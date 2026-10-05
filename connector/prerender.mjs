// Pre-render the website's app views into plain HTML files, so search engines and AI crawlers that don't
// run JavaScript read the same page visitors see. Headless Chrome opens /explore/?prerender from a small
// local server over the build output, then the app's own router (window.__sg, only present with
// ?prerender) draws each address; the view and any open guide drawer are saved into a copy of the app page
// with that address's head (pages.mjs). In the browser the app takes the HTML over once its data is in.
// No npm packages: Chrome's DevTools protocol over Node's built-in WebSocket.
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { headFor } from "./pages.mjs";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4", ".txt": "text/plain", ".xml": "application/xml" };

function findChrome() {
  const fixed = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].filter(Boolean);
  for (const f of fixed) if (fs.existsSync(f)) return f;
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    try { return execFileSync("which", [name], { encoding: "utf8" }).trim(); } catch {}
  }
  return null;
}

// Serves the build output; any address without a file gets the app page (the app routes by path).
function serve(out, appHtml) {
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let f = path.join(out, p);
    if (!f.startsWith(out)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) { res.writeHead(200, { "Content-Type": "text/html" }).end(appHtml); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
  let n = 0; const waiting = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { const [ok, fail] = waiting.get(m.id); waiting.delete(m.id); m.error ? fail(new Error(m.error.message)) : ok(m.result); } };
  const send = (method, params = {}) => new Promise((ok, fail) => { const id = ++n; waiting.set(id, [ok, fail]); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => { const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  return { send, evaluate, close: () => ws.close() };
}

/** Pre-render every route into out. Returns how many files were written, or 0 when Chrome isn't there. */
export async function prerender({ out, routes, required }) {
  const chrome = findChrome();
  if (!chrome) {
    if (required) throw new Error("Pre-rendering needs Google Chrome or Chromium (set CHROME_PATH).");
    console.warn("No Chrome found: pages are not pre-rendered (set CHROME_PATH to enable).");
    return 0;
  }
  const appHtml = fs.readFileSync(path.join(out, "explore", "index.html"), "utf8");
  const server = await serve(out, appHtml);
  const base = `http://127.0.0.1:${server.address().port}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sg-prerender-"));
  const proc = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-extensions", `--user-data-dir=${profile}`, "--remote-debugging-port=0", "--window-size=1280,900", ...(process.env.CI ? ["--no-sandbox"] : []), "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  let client;
  try {
    const port = await new Promise((ok, fail) => {
      let buf = ""; const t = setTimeout(() => fail(new Error("Chrome didn't start")), 20000);
      proc.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on ws:\/\/[^:]+:(\d+)\//); if (m) { clearTimeout(t); ok(m[1]); } });
      proc.on("exit", (c) => fail(new Error(`Chrome exited (${c})`)));
    });
    const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
    client = await cdp(page.webSocketDebuggerUrl);
    await client.send("Page.enable");
    await client.send("Page.navigate", { url: `${base}/explore/?prerender` });
    const until = Date.now() + 60000;
    while (!(await client.evaluate("!!(window.__sg && window.__sg.ready())").catch(() => false))) {
      if (Date.now() > until) throw new Error("The app's data didn't load in the pre-render browser.");
      await new Promise((ok) => setTimeout(ok, 200));
    }
    const shell = { view: '<main id="view"><p class="skeleton">Opening the garden…</p></main>', drawer: '<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" aria-hidden="true"></aside>', scrim: '<div class="scrim" id="scrim" data-act="close-overlays"></div>' };
    for (const k of Object.keys(shell)) if (!appHtml.includes(shell[k])) throw new Error(`Pre-render: the app page no longer has its ${k} markup.`);
    const headRe = /<title>[^<]*<\/title><meta name="description" content="[^"]*">/;
    if (!headRe.test(appHtml)) throw new Error("Pre-render: the app page's title and description weren't found.");
    let n = 0;
    for (const r of routes) {
      const snap = await client.evaluate(`window.__sg.route(${JSON.stringify(r.route)})`);
      if (!snap || !snap.view || /class="skeleton"/.test(snap.view.slice(0, 300))) throw new Error(`Pre-render: ${r.route} has no content.`);
      let html = appHtml.replace(headRe, () => headFor(r))
        .replace(shell.view, () => `<main id="view" data-pre>${snap.view.replace(/(<section id="ex")[^>]*>/, "$1>")}</main>`);
      if (snap.drawer) html = html
        .replace(shell.drawer, () => `<aside class="drawer on" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" aria-hidden="false">${snap.drawer}</aside>`)
        .replace(shell.scrim, () => shell.scrim.replace('class="scrim"', 'class="scrim on"'));
      const f = path.join(out, r.file);
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, html);
      n++;
    }
    return n;
  } finally {
    try { client?.close(); } catch {}
    const exited = new Promise((ok) => (proc.exitCode !== null ? ok() : proc.once("exit", ok)));
    proc.kill(); await exited;
    server.close();
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
  }
}
