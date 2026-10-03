#!/usr/bin/env node
// Live screen recording of a real browser session. macOS only. No npm installs.
//
//   node record.mjs --doctor
//   node record.mjs --open https://example.com/dashboard      (then a human logs in)
//   node record.mjs --route routes/tour.json [--check] [--out DIR]
//
// The pointer on screen is the real macOS cursor (warp.c). The clicks are real
// clicks delivered to the page over the DevTools Protocol. The video is
// `screencapture -v -C`. Nothing is drawn in afterwards.
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HOME = os.homedir();
const DATA = path.join(HOME, '.screen-record-web');
const PROFILE = path.join(DATA, 'chrome-profile');
const WARP = path.join(DATA, 'warp');
const PORT = Number(process.env.REC_PORT || 9333);
const SKILL = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const say = (...a) => console.log(...a);

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];
const has = c => spawnSync('which', [c]).status === 0;

// ---------------------------------------------------------------- CDP client
class CDP {
  #id = 0;
  #pending = new Map();
  static async open(wsUrl) {
    const c = new CDP();
    c.ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      c.ws.onopen = res;
      c.ws.onerror = () => rej(new Error('could not open ' + wsUrl));
    });
    c.ws.onmessage = ev => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.id && c.#pending.has(m.id)) {
        const { res, rej } = c.#pending.get(m.id);
        c.#pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
      }
    };
    return c;
  }
  send(method, params = {}, timeoutMs = 20000) {
    const id = ++this.#id;
    return new Promise((res, rej) => {
      const t = setTimeout(() => {
        this.#pending.delete(id);
        rej(new Error(`${method} did not answer in ${timeoutMs}ms`));
      }, timeoutMs);
      const done = f => v => { clearTimeout(t); f(v); };
      this.#pending.set(id, { res: done(res), rej: done(rej) });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { try { this.ws.close(); } catch {} }
}

const json = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
const up = async () => { try { await json('/json/version'); return true; } catch { return false; } };

async function ensureChrome(url) {
  if (await up()) return false;
  const bin = CHROMES.find(fs.existsSync);
  if (!bin) throw new Error('No Chrome found in /Applications.');
  fs.mkdirSync(PROFILE, { recursive: true });
  spawn(bin, [
    `--user-data-dir=${PROFILE}`, `--remote-debugging-port=${PORT}`,
    '--no-first-run', '--no-default-browser-check',
    '--hide-crash-restore-bubble', '--disable-session-crashed-bubble',
    '--disable-features=Translate,MediaRouter',
    url || 'about:blank',
  ], { detached: true, stdio: 'ignore' }).unref();
  for (let i = 0; i < 40; i++) { await sleep(500); if (await up()) return true; }
  throw new Error('Chrome did not open a debugging port.');
}

async function attach() {
  const pages = (await json('/json')).filter(t => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!pages.length) throw new Error('No page target. Is the recording Chrome open?');
  const t = pages[0];
  return { cdp: await CDP.open(t.webSocketDebuggerUrl), targetId: t.id };
}

const evaluate = async (cdp, expression) => {
  const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

// Find a clickable by its visible text. `exact` avoids "Chat" matching "Chatter".
const FIND = (label, exact) => `(() => {
  const want = ${JSON.stringify(String(label))}.toLowerCase();
  const els = [...document.querySelectorAll('a,button,[role="link"],[role="button"],summary')];
  const el = els.find(e => {
    const t = (e.textContent || '').trim().toLowerCase();
    if (!t) return false;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return false;
    return ${exact ? 't === want' : 't.includes(want)'};
  });
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
})()`;

const GEOM = `({ sx: screenX, sy: screenY, chrome: outerHeight - innerHeight,
  iw: innerWidth, ih: innerHeight, sw: screen.width, sh: screen.height, url: location.href })`;

// ------------------------------------------------------------------- cursor
function ensureWarp() {
  fs.mkdirSync(DATA, { recursive: true });
  const src = path.join(SKILL, 'scripts', 'warp.c');
  if (fs.existsSync(WARP) && fs.statSync(WARP).mtimeMs > fs.statSync(src).mtimeMs) return;
  if (!has('clang')) throw new Error('clang not found — install Xcode Command Line Tools: xcode-select --install');
  execFileSync('clang', ['-O2', '-framework', 'ApplicationServices', '-o', WARP, src]);
}


// Is the browser actually the thing on screen? Compare the page's own
// screenshot with a still of the screen area the page should occupy. This
// catches the expensive failure: a take that records the foreground app
// because something covered the browser.
async function browserIsOnScreen(cdp, rect, dir) {
  if (!has('ffmpeg')) return null;
  const a = path.join(dir, '_page.jpg'), b = path.join(dir, '_screen.png');
  const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 60 });
  fs.writeFileSync(a, Buffer.from(shot.data, 'base64'));
  fs.rmSync(b, { force: true });
  spawnSync('screencapture', ['-x', `-R${rect.x},${rect.y},${rect.w},${rect.h}`, b], { stdio: 'ignore' });
  const grey = f => {
    const o = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', 'scale=8:8',
      '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], { encoding: 'buffer' });
    return o.stdout?.length === 64 ? [...o.stdout] : null;
  };
  const pa = grey(a), pb = grey(b);
  fs.rmSync(a, { force: true }); fs.rmSync(b, { force: true });
  if (!pa || !pb) return null;
  const diff = pa.reduce((n, v, i) => n + Math.abs(v - pb[i]), 0) / 64;
  return { ok: diff < 40, diff: Math.round(diff) };
}

// --------------------------------------------------------------- preflight
async function doctor() {
  const major = Number(process.versions.node.split('.')[0]);
  const rows = [];
  rows.push([major >= 22, `node ${process.versions.node}`, 'needs 22+ (built-in WebSocket)']);
  rows.push([has('clang'), 'clang', 'xcode-select --install']);
  rows.push([!!CHROMES.find(fs.existsSync), 'Google Chrome', 'install Chrome']);
  rows.push([has('ffmpeg'), 'ffmpeg', 'optional — without it you keep the raw .mov']);

  // Screen Recording permission: a denied capture still writes a perfectly
  // normal file, it is just uniformly black. Brightness alone is a bad test —
  // a dark-themed window is legitimately near-black. A DENIED capture has no
  // variance at all, so measure the spread across a 32x32 grey reduction.
  fs.mkdirSync(DATA, { recursive: true });
  const probe = path.join(DATA, 'permission-probe.mov');
  fs.rmSync(probe, { force: true });
  spawnSync('screencapture', ['-v', '-C', '-V1', '-R0,0,1200,800', probe], { stdio: 'ignore' });
  let lit = null;
  if (fs.existsSync(probe) && has('ffmpeg')) {
    const out = spawnSync('ffmpeg', ['-v', 'error', '-ss', '0.4', '-i', probe, '-frames:v', '1',
      '-vf', 'scale=32:32', '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], { encoding: 'buffer' });
    if (out.stdout?.length) {
      const px = [...out.stdout];
      lit = Math.max(...px) - Math.min(...px) > 3;
    }
  } else if (fs.existsSync(probe)) {
    lit = fs.statSync(probe).size > 60000;
  }
  fs.rmSync(probe, { force: true });
  rows.push([lit !== false, 'Screen Recording permission',
    'System Settings → Privacy & Security → Screen & System Audio Recording → allow this app, then restart it']);

  for (const [ok, what, fix] of rows) say(`  ${ok ? '✓' : '✗'} ${what}${ok ? '' : `  — ${fix}`}`);
  return rows.every(r => r[0]);
}

// ------------------------------------------------------------------- record
async function runRoute(routeFile, { checkOnly, outDir }) {
  const route = JSON.parse(fs.readFileSync(routeFile, 'utf8'));
  const name = route.name || path.basename(routeFile, '.json');
  const dir = outDir || path.resolve(path.dirname(routeFile), '..', 'out');
  fs.mkdirSync(dir, { recursive: true });
  ensureWarp();

  const opened = await ensureChrome(route.url);
  if (opened) await sleep(2500);
  let { cdp, targetId } = await attach();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Page.bringToFront');

  const MENUBAR = 25;
  if (route.fullscreen !== false) {
    const scr = await evaluate(cdp, '({ w: screen.width, h: screen.height })');
    const v = await json('/json/version');
    const b = await CDP.open(v.webSocketDebuggerUrl);
    const { windowId } = await b.send('Browser.getWindowForTarget', { targetId });
    await b.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } }).catch(() => {});
    await sleep(300);
    await b.send('Browser.setWindowBounds', { windowId,
      bounds: { left: 0, top: MENUBAR, width: scr.w, height: scr.h - MENUBAR } });
    b.close();
    await sleep(1200);
  }
  await cdp.send('Page.bringToFront');

  if (route.url) { await cdp.send('Page.navigate', { url: route.url }); await sleep(route.settle ?? 2600); }

  const g = await evaluate(cdp, GEOM);
  if (/\/login|\/signin|\/sign-in/.test(g.url) && route.url && !/\/login/.test(route.url)) {
    say(`\n  Landed on ${g.url} — that session is not signed in.`);
    say(`  A person must sign in, in the Chrome window that is open now. Then run this again.`);
    say(`  Never type someone's password for them; the profile remembers it afterwards.\n`);
    cdp.close(); process.exit(3);
  }
  const contentTop = g.sy + g.chrome;             // holds in windowed AND fullscreen
  const toScreen = (x, y) => [Math.round(g.sx + x), Math.round(contentTop + y)];
  say(`  window ${JSON.stringify(g)}`);

  // Verify every label the route clicks BEFORE rolling: a missing label halfway
  // through means the whole take is wasted. Sidebars that collapse to icons on
  // some pages are the usual cause.
  const labels = route.steps.filter(s => s.click || s.move).map(s => ({ l: s.click || s.move, e: !!s.exact }));
  const missing = [];
  for (const { l, e } of labels) if (!(await evaluate(cdp, FIND(l, e)))) missing.push(l);
  if (missing.length) {
    say(`  not on the opening page: ${missing.join(', ')}`);
    say(`  (fine if a later step navigates to them — otherwise fix the labels)`);
  }
  if (checkOnly) { say('  --check only, nothing recorded.'); cdp.close(); return; }

  // Default to the browser window, not the whole display: a maximised window
  // fills the frame without the menu bar and Dock in every shot. Set
  // "region": "display" when the desktop is genuinely part of the story.
  const rect = route.region === 'display'
    ? { x: 0, y: 0, w: g.sw, h: g.sh }
    : { x: g.sx, y: g.sy, w: g.iw, h: g.ih + g.chrome };
  const region = `-R${rect.x},${rect.y},${rect.w},${rect.h}`;
  say(`  recording ${rect.w}x${rect.h} at ${rect.x},${rect.y} (${route.region === 'display' ? 'whole display' : 'browser window'})`);
  const seen = await browserIsOnScreen(cdp, { x: g.sx, y: contentTop, w: g.iw, h: g.ih }, dir);
  if (seen && !seen.ok) {
    say(`  ABORTED: the browser is not what is on screen (difference ${seen.diff}/255).`);
    say(`  Something is covering it — click the browser window once to raise it, then re-run.`);
    say(`  Note: macOS fullscreen puts the browser on its own Space and will do this every time.`);
    cdp.close(); process.exit(4);
  }
  if (seen) say(`  browser is on screen (difference ${seen.diff}/255)`);

  const raw = path.join(dir, `${name}_raw.mov`);
  fs.rmSync(raw, { force: true });                 // screencapture REFUSES to overwrite

  const cap = route.cap ?? 120;                    // fixed length: SIGINT would bin the file
  const rec = spawn('screencapture', ['-v', '-C', `-V${cap}`, region, raw], { stdio: ['ignore', 'pipe', 'pipe'] });
  rec.stderr.on('data', d => say('  screencapture:', String(d).trim()));
  const recDone = new Promise(res => rec.on('exit', res));
  const t0 = Date.now();
  await sleep((route.pad ?? 1.8) * 1000);

  const glide = async (x, y, ms = 620) => {
    const [sx, sy] = toScreen(x, y);
    execFileSync(WARP, [String(sx), String(sy), 'glide', String(Math.max(12, Math.round(ms / 12))), '12']);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' });
  };
  const clickAt = async (x, y) => {
    for (const type of ['mousePressed', 'mouseReleased'])
      await cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
  };

  try {
    for (const s of route.steps) {
      if (s.goto) { await cdp.send('Page.navigate', { url: s.goto }); }
      if (s.click || s.move) {
        const label = s.click || s.move;
        const n = await evaluate(cdp, FIND(label, !!s.exact));
        if (!n) { say(`  (no "${label}" on screen, skipped)`); continue; }
        await glide(n.x, n.y, (s.glide ?? 0.62) * 1000);
        await sleep((s.settle ?? 0.43) * 1000);
        if (s.click) { await clickAt(n.x, n.y); say(`  → ${label}`); }
      }
      if (s.scroll) {
        for (let i = 0; i < s.scroll; i++) {
          await cdp.send('Input.dispatchMouseEvent', {
            type: 'mouseWheel', x: Math.round(g.iw / 2), y: Math.round(g.ih / 2),
            deltaX: 0, deltaY: s.by ?? 400,
          });
          await sleep((s.gap ?? 1.0) * 1000);
        }
      }
      if (s.dwell || s.wait) await sleep(((s.dwell ?? s.wait)) * 1000);
    }
    await sleep((route.tail ?? 1.2) * 1000);
  } finally {
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    say(`  take runs ${secs}s of a ${cap}s capture — waiting for the recorder to close the file`);
    cdp.close();
    await Promise.race([recDone, sleep(cap * 1000 + 20000)]);
    if (!fs.existsSync(raw)) { say('  screencapture wrote nothing. Run --doctor.'); return; }

    if (has('ffmpeg')) {
      const full = path.join(dir, `${name}.mp4`);
      spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-t', secs,
        '-vf', 'scale=1920:-2:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow',
        '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', full], { stdio: 'inherit' });
      say(`  ${full}`);
      if (route.crop169 !== false && rect.w / rect.h < 1.7) {
        const w = rect.w * 2, h = Math.round(w / 16 * 9) & ~1, y = Math.round((contentTop - rect.y) * 2);
        const wide = path.join(dir, `${name}_16x9.mp4`);
        spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-t', secs,
          '-vf', `crop=${w}:${h}:0:${y},scale=1920:1080:flags=lanczos`, '-c:v', 'libx264',
          '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', wide], { stdio: 'inherit' });
        say(`  ${wide}`);
      }
    } else say(`  ${raw}  (no ffmpeg — raw capture kept)`);
  }
}

// --------------------------------------------------------------------- main
const argv = process.argv.slice(2);
const arg = f => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
try {
  if (typeof WebSocket === 'undefined') throw new Error(`node ${process.versions.node} has no WebSocket — needs node 22+`);
  if (argv.includes('--doctor')) process.exit((await doctor()) ? 0 : 1);
  else if (argv.includes('--open')) {
    const url = arg('--open');
    await ensureChrome(url);
    const { cdp } = await attach();
    await cdp.send('Page.navigate', { url });
    await cdp.send('Page.bringToFront');
    await sleep(2500);
    say(`\n  Chrome is open at ${url} on a recording-only profile.`);
    say(`  If it needs a login, sign in NOW, by hand, in that window.`);
    say(`  The profile keeps the session, so this is a one-time step.\n`);
    cdp.close();
  }
  else if (arg('--route')) await runRoute(arg('--route'), { checkOnly: argv.includes('--check'), outDir: arg('--out') });
  else say('usage: record.mjs --doctor | --open <url> | --route <file.json> [--check] [--out DIR]');
} catch (e) { console.error('  ' + e.message); process.exit(1); }
process.exit(0);
