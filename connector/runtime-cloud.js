// Stands in for the capabilities skill-garden.html uses, for the admin page on the live site (/admin/).
// Signs in with Google (Firebase Auth) and reads and writes the garden's data in Firestore, which the
// app on the Mac keeps in step (local/cloud.mjs). connector/firebase/firestore.rules decides who gets
// in; ADMINS below only decides what this page says. Work that needs the Mac (a scout run, an
// Instagram read) is left in `requests` for it to pick up.
(() => {
  "use strict";
  const SDK = "https://www.gstatic.com/firebasejs/12.19.0";
  // The web app's public config (not a secret: the rules guard the data).
  const CONFIG = { apiKey: "AIzaSyAcxB2eE6Iy6979HG7sCqzHho-z1luVKvU", authDomain: "skillgarden-e6812.firebaseapp.com", projectId: "skillgarden-e6812", appId: "1:253864661442:web:befd388183064fe80a865b", messagingSenderId: "253864661442" };
  const ADMINS = ["gipsonkj@gmail.com", "soorajpv2286@gmail.com"];
  const MAC_STALE = 15 * 60_000;

  let ready;
  const caps = new Promise((r) => { ready = r; });
  window.claude = { use: async (name) => (await caps)[name] || null };

  /* ---- the sign-in screen ---- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  let gate = null, card = null;
  function showGate(html) {
    if (!gate) {
      gate = document.createElement("div");
      gate.setAttribute("role", "dialog");
      gate.setAttribute("aria-modal", "true");
      gate.setAttribute("aria-labelledby", "sg-gate-h");
      gate.style.cssText = "position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:16px;background:var(--ground,#f6f8f7);overflow:hidden";
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
      card = document.createElement("div");
      card.style.cssText = "position:relative;z-index:1;width:100%;display:grid;place-items:center";
      gate.append(canvas, card);
      document.body.append(gate);
      growGarden(canvas);
    }
    card.innerHTML = `<div class="panel" style="max-width:420px;width:100%;gap:14px;box-shadow:0 1px 2px rgb(0 0 0/.04),0 16px 48px -16px rgb(20 70 45/.22)"><h2 id="sg-gate-h" style="margin:0;font-size:22px">Skill Garden admin</h2>${html}</div>`;
  }

  /* ---- a garden growing behind the sign-in card: vines climb in from the edges, leaves unfurl, each
     tip opens into a flower around a glowing seed, pollen drifts up, and every few seconds a new seed
     sprouts while the oldest vine fades. Drawn grown and still under reduced motion; stops when the
     card goes. ---- */
  function growGarden(canvas) {
    const ctx = canvas.getContext("2d");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const R = (a, b) => a + Math.random() * (b - a);
    const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const turn = (to, a) => Math.atan2(Math.sin(to - a), Math.cos(to - a));
    const PETALS = ["#f4c35a", "#ec9a86", "#c7a6e6", "#f3ead6", "#f2a7c0"];
    const LEAVES = ["#3f9a6e", "#4fa77a", "#2f8a60", "#6cb98d"];
    const STEM = "#2f7a57";
    const SPEED = 24, STEP = 6; // stem points a second, px per point
    let W = 0, H = 0, plants = [], motes = [], seeds = [], next = 0, start = 0, last = 0;

    function stem(x, y, a, n, delay, tend, root) {
      const pts = [], cx = W / 2, cy = H / 2;
      let curl = R(-0.02, 0.02), d = root ? root.d : 0;
      for (let i = 0; i < n; i++, d++) {
        pts.push([x, y, a, d]);
        curl = Math.max(-0.05, Math.min(0.05, curl + R(-0.012, 0.012)));
        a += curl + turn(tend, a) * 0.012;
        const dx = (x - cx) / (W / 2), dy = (y - cy) / (H / 2);
        if (dx * dx + dy * dy < 0.3) a += turn(Math.atan2(y - cy, x - cx), a) * 0.09; // keep the card clear
        x += Math.cos(a) * STEP; y += Math.sin(a) * STEP;
      }
      const group = root ? root.group : { fade: 0 };
      const p = { pts, delay, group, phase: root ? root.phase : R(0, 6.28), w: root ? 1.6 : R(2.4, 3.4), leaves: [], flowers: [] };
      for (let i = 3; i < n - 2; i += Math.round(R(4, 7))) p.leaves.push({ i, side: p.leaves.length % 2 ? 1 : -1, size: R(8, 13) * (1 - (i / n) * 0.4), color: pick(LEAVES) });
      p.flowers.push({ i: n - 1, r: root ? R(7, 11) : R(11, 17), color: pick(PETALS), k: Math.random() < 0.5 ? 5 : 6, spin: R(0, 6.28) });
      plants.push(p);
      if (!root) for (const side of [-1, 1]) {
        if (Math.random() < 0.25) continue;
        const i = Math.round(R(0.3, 0.75) * n), [bx, by, ba, bd] = pts[i];
        stem(bx, by, ba + side * R(0.7, 1.1), Math.round(n * R(0.22, 0.38)), delay + i / SPEED, tend, { d: bd, phase: p.phase, group });
      }
      return group;
    }

    function plant(grown) {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      plants = []; motes = []; seeds = [];
      const ground = Math.max(5, Math.min(11, Math.round(W / 150)));
      for (let k = 0; k < ground; k++) sprout("ground", R(0, 1.4), ((k + R(0.2, 0.8)) / ground) * W);
      for (let k = 0; k < 4; k++) sprout("side", R(0.4, 1.8), k % 2, H * R(0.4, 0.9));
      sprout("hang", R(0.8, 2), R(0.04, 0.22)); sprout("hang", R(0.8, 2), R(0.78, 0.96));
      start = performance.now() - (grown ? 60000 : 0);
      next = (performance.now() - start) / 1000 + 4;
    }

    // A vine from the ground (at x), a side (at 0 left, 1 right; from height y) or hanging from the top (at fraction x).
    function sprout(kind, delay, at, y) {
      const up = -Math.PI / 2, down = Math.PI / 2;
      if (kind === "ground") return stem(at, H + 4, up + R(-0.35, 0.35), Math.round((H * R(0.32, 0.55)) / STEP), delay, up);
      if (kind === "side") return stem(at ? W + 4 : -4, y, (at ? -Math.PI + 0.6 : -0.6) + R(-0.2, 0.2), Math.round((Math.min(W, H) * R(0.22, 0.38)) / STEP), delay, up);
      return stem(W * at, -4, down + R(-0.3, 0.3), Math.round((H * R(0.18, 0.3)) / STEP), delay, down);
    }

    // A new seed glows where it lands, then sprouts; the oldest vine fades to make room.
    function reseed(t) {
      const old = plants.find((p) => !p.group.fade);
      if (old) old.group.fade = t;
      if (Math.random() < 0.65) { const x = R(0.03, 0.97) * W; seeds.push({ x, y: H - 10, t0: t }); sprout("ground", t + 0.9, x); }
      else { const side = Math.random() < 0.5 ? 0 : 1, y = H * R(0.45, 0.85); seeds.push({ x: side ? W - 10 : 10, y, t0: t }); sprout("side", t + 0.9, side, y); }
    }

    function leaf(x, y, a, len, color) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.5, -len * 0.4, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.4, 0, 0);
      ctx.fillStyle = color; ctx.fill();
      ctx.beginPath(); ctx.moveTo(len * 0.1, 0); ctx.lineTo(len * 0.85, 0);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.restore();
    }

    function flower(x, y, f, age, t) {
      const bud = ease(age / 0.4), open = ease((age - 0.3) / 1.2);
      if (bud <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.rotate(f.spin + Math.sin(t * 0.4 + f.spin) * 0.08);
      if (open < 0.05) {
        ctx.beginPath(); ctx.ellipse(0, 0, f.r * 0.32 * bud, f.r * 0.45 * bud, 0, 0, 7);
        ctx.fillStyle = "#5fae84"; ctx.fill();
      } else {
        ctx.globalAlpha *= 0.92; ctx.fillStyle = f.color;
        for (let k = 0; k < f.k; k++) {
          const a = (k / f.k) * Math.PI * 2;
          ctx.beginPath(); ctx.ellipse(Math.cos(a) * f.r * 0.55 * open, Math.sin(a) * f.r * 0.55 * open, f.r * (0.25 + 0.35 * open), f.r * (0.18 + 0.16 * open), a, 0, 7); ctx.fill();
        }
        ctx.globalAlpha /= 0.92;
        const glow = f.r * (0.9 + 0.15 * Math.sin(t * 1.6 + f.spin)) * open, g = ctx.createRadialGradient(0, 0, 0, 0, 0, glow);
        g.addColorStop(0, "rgba(255,214,110,.75)"); g.addColorStop(1, "rgba(255,214,110,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, glow, 0, 7); ctx.fill();
        ctx.fillStyle = "#e0a93a"; ctx.beginPath(); ctx.ellipse(0, 0, f.r * 0.2, f.r * 0.27, 0, 0, 7); ctx.fill();
      }
      ctx.restore();
    }

    function draw(now) {
      const t = (now - start) / 1000, sway = still ? 0 : t, dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);
      const open = [];
      if (!still && t > next) { next = t + R(3, 5); reseed(t); }
      plants = plants.filter((p) => !p.group.fade || t - p.group.fade < 2.5);
      for (const sd of seeds) {
        const age = t - sd.t0, a = ease(age / 0.5) * (1 - ease((age - 1.4) / 0.8)), r = 10 + 4 * Math.sin(age * 5);
        if (a <= 0) continue;
        const g = ctx.createRadialGradient(sd.x, sd.y, 0, sd.x, sd.y, r * 2);
        g.addColorStop(0, `rgba(255,210,100,${0.85 * a})`); g.addColorStop(1, "rgba(255,210,100,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sd.x, sd.y, r * 2, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(214,160,52,${a})`; ctx.beginPath(); ctx.ellipse(sd.x, sd.y, 4, 5.5, 0.4, 0, 7); ctx.fill();
      }
      seeds = seeds.filter((sd) => t - sd.t0 < 2.4);
      for (const p of plants) {
        ctx.globalAlpha = p.group.fade ? Math.max(0, 1 - (t - p.group.fade) / 2.5) : 1;
        const n = p.pts.length, grown = still ? n - 1 : Math.min(n - 1, (t - p.delay) * SPEED);
        if (grown <= 0) continue;
        const at = (i) => { const [x, y, , d] = p.pts[i], s = Math.min(1, d / 70); return [x + Math.sin(sway * 0.9 + p.phase + d * 0.04) * 9 * s * s, y]; };
        const m = Math.floor(grown), f = grown - m;
        ctx.strokeStyle = STEM; ctx.lineCap = "round";
        let [px, py] = at(0);
        for (let i = 1; i <= m + 1 && i < n; i++) {
          let [x, y] = at(i);
          if (i === m + 1) { x = px + (x - px) * f; y = py + (y - py) * f; }
          ctx.lineWidth = Math.max(0.8, p.w * (1 - (i / n) * 0.65));
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
          px = x; py = y;
        }
        for (const l of p.leaves) {
          if (l.i > grown) continue;
          const [x, y] = at(l.i), s = still ? 1 : ease((grown - l.i) / SPEED / 0.6);
          leaf(x, y, p.pts[l.i][2] + l.side * (0.95 + Math.sin(sway * 1.1 + l.i) * 0.08), l.size * s, l.color);
        }
        for (const fl of p.flowers) {
          if (grown < n - 1) continue;
          const age = still ? 9 : t - p.delay - (n - 1) / SPEED, [x, y] = at(fl.i);
          flower(x, y, fl, age, sway);
          if (age > 1.5 && !p.group.fade) open.push([x, y]);
        }
      }
      ctx.globalAlpha = 1;
      if (still) return;
      if (open.length && motes.length < 45 && Math.random() < 0.12) {
        const [x, y] = pick(open);
        motes.push({ x, y, vy: R(8, 18), ph: R(0, 6.28), life: 0, span: R(4, 8), r: R(1, 2.2) });
      }
      for (const m of motes) {
        m.life += dt / m.span; m.y -= m.vy * dt; m.x += Math.sin(t * 0.8 + m.ph) * 8 * dt;
        const a = Math.sin(Math.PI * Math.min(1, m.life)) * 0.8, g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
        g.addColorStop(0, `rgba(244,190,70,${a})`); g.addColorStop(1, "rgba(244,190,70,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 4, 0, 7); ctx.fill();
      }
      motes = motes.filter((m) => m.life < 1);
    }

    const loop = (now) => { if (!canvas.isConnected) return; draw(now); requestAnimationFrame(loop); };
    let timer = 0;
    addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(() => { if (canvas.isConnected) { plant(true); if (still) draw(performance.now()); } }, 150); });
    requestAnimationFrame(() => { plant(still); if (still) draw(performance.now()); else requestAnimationFrame(loop); });
  }
  const hideGate = () => { if (gate) { gate.remove(); gate = null; } };
  const onBody = (fn) => (document.body ? fn() : document.addEventListener("DOMContentLoaded", fn, { once: true }));

  /* ---- deep merge, as the app on the Mac does it ---- */
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
  function merge(target, patch) {
    const out = { ...target };
    for (const [k, v] of Object.entries(patch)) {
      if (isObj(v) && v.__delete__ === true) delete out[k];
      else if (isObj(v) && isObj(out[k])) out[k] = merge(out[k], v);
      else out[k] = v;
    }
    return out;
  }
  const strip = (d) => { if (!d) return d; const { _ts, _by, ...rest } = d; return rest; };

  (async () => {
    let A, F, Fs;
    try {
      [A, F, Fs] = await Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`)]);
    } catch {
      onBody(() => showGate(`<p class="muted">Couldn't load Google sign-in. Check the connection and reload.</p>`));
      return;
    }
    const app = A.initializeApp(CONFIG);
    const auth = F.getAuth(app);
    const fs = Fs.initializeFirestore(app, { ignoreUndefinedProperties: true });
    let started = false;

    const signIn = async () => {
      const provider = new F.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try { await F.signInWithPopup(auth, provider); }
      catch (e) {
        if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) return F.signInWithRedirect(auth, provider);
        if (e && e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") onBody(() => showGate(`<p class="muted">Sign-in didn't finish: ${esc(e.message || e.code)}</p><div class="row-actions"><button class="btn primary" data-sg="in">Try again</button></div>`));
      }
    };
    document.addEventListener("click", (ev) => {
      const b = ev.target.closest && ev.target.closest("[data-sg]");
      if (!b) return;
      if (b.dataset.sg === "in") signIn();
      if (b.dataset.sg === "out") F.signOut(auth).then(() => location.reload());
    });

    F.onAuthStateChanged(auth, (user) => {
      if (started) { if (!user) location.reload(); return; }
      if (!user) return onBody(() => showGate(`<p class="muted" style="margin:0">Review, Scout, Reel inbox and My skills, for the garden's admins. Sign in with the Google account you were added with.</p><div class="row-actions"><button class="btn primary" data-sg="in">Sign in with Google</button><a class="btn" href="/explore/">Explore the garden</a></div>`));
      const email = String(user.email || "").toLowerCase();
      if (!ADMINS.includes(email) || !user.emailVerified) return onBody(() => showGate(`<p style="margin:0">${esc(user.email || "This account")} isn't an admin of this garden.</p><div class="row-actions"><button class="btn" data-sg="out">Sign out</button><a class="btn" href="/explore/">Explore the garden</a></div>`));
      started = true;
      onBody(() => { hideGate(); signedInAs(user); });
      ready(capsFor(user, email));
    });

    function capsFor(user, email) {
      const stamp = () => ({ _ts: Fs.serverTimestamp(), _by: email });
      // Every write also touches sync/web, so the Mac sees there is something to pull.
      const beacon = (w) => w.set(Fs.doc(fs, "sync", "web"), { at: Fs.serverTimestamp(), by: email });
      const fail = (e) => Promise.reject({ code: e && e.code === "permission-denied" ? "permission_denied" : "unavailable", message: (e && e.message) || "Couldn't reach the garden's data." });
      const docSnap = (s) => ({ id: s.id, exists: s.exists(), data: () => strip(s.data()), metadata: s.metadata });
      const querySnap = (q) => ({ docs: q.docs.map(docSnap), size: q.size, empty: q.empty, docChanges: () => [], metadata: q.metadata });
      function query(col, parts = []) {
        const q = () => Fs.query(Fs.collection(fs, col), ...parts);
        return {
          where: (f, op, v) => query(col, [...parts, Fs.where(f, op, v)]),
          orderBy: (f, dir = "asc") => query(col, [...parts, Fs.orderBy(f, dir)]),
          limit: (n) => query(col, [...parts, Fs.limit(n)]),
          get: () => Fs.getDocs(q()).then(querySnap, fail),
          onSnapshot: (next, error) => Fs.onSnapshot(q(), (s) => next(querySnap(s)), (e) => error && error(e)),
        };
      }
      function docRef(col, id) {
        const ref = Fs.doc(fs, col, id);
        const batch = (fn) => { const b = Fs.writeBatch(fs); fn(b); beacon(b); return b.commit().then(() => undefined, fail); };
        return {
          id, path: `${col}/${id}`,
          get: () => Fs.getDoc(ref).then(docSnap, fail),
          set: (data) => batch((b) => b.set(ref, { ...data, ...stamp() })),
          // Read, merge and write in one transaction, so nested fields merge the way they do on the Mac.
          update: (data) => Fs.runTransaction(fs, async (tx) => {
            const cur = await tx.get(ref);
            if (!cur.exists()) throw { code: "not-found", message: `${col}/${id} does not exist; use set to create it.` };
            tx.set(ref, { ...merge(strip(cur.data()), data), ...stamp() });
            beacon(tx);
          }).then(() => undefined, (e) => (e && e.code === "not-found" ? Promise.reject({ code: "invalid_argument", message: e.message }) : fail(e))),
          delete: () => batch((b) => { b.delete(ref); b.set(Fs.doc(fs, "deleted", `${col}~${id}`), { col, id, ...stamp() }); }),
          onSnapshot: (next, error) => Fs.onSnapshot(ref, (s) => next(docSnap(s)), (e) => error && error(e)),
        };
      }
      const newId = () => Math.random().toString(36).slice(2, 12);
      const db = {
        collection: (col) => Object.assign(query(col), { path: col, doc: (id) => docRef(col, id || newId()), add: async (data) => { const r = docRef(col, newId()); await r.set(data); return r; } }),
        doc: (p) => { const [col, id] = String(p).split("/"); return docRef(col, id); },
      };
      // Work only the Mac can do waits in `requests` until the app there picks it up.
      const ask = (kind) => { const b = Fs.writeBatch(fs); b.set(Fs.doc(fs, "requests", `${Date.now()}-${newId()}`), { kind, status: "new", ...stamp() }); beacon(b); return b.commit().catch(fail); };
      const me = { id: user.uid, name: user.displayName || "", avatarUrl: user.photoURL || "", color: "#1D6B50", email, isOwner: true, canEdit: true };
      return {
        db,
        user: { isOwner: async () => true, canEdit: async () => true, can: async () => true, id: async () => user.uid, me: async () => me,
          profiles: async (ids) => Object.fromEntries([].concat(ids).map((i) => [i, { ...me, id: i, isMe: i === user.uid, guest: false }])) },
        downloads: {
          async save({ filename, data }) {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); a.download = filename;
            document.body.append(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 10000);
            return { status: "saved" };
          },
        },
        mcp: { async callTool(server, tool) { if (tool !== "fire_trigger") throw { code: "bad_request", message: "Not available here." }; await ask("scout"); return { content: [], payload: { started: true } }; } },
        reader: { run: () => ask("ig-run"), stop: () => ask("ig-stop") },
        publisher: { run: () => ask("publish") },
      };
    }

    // Who is signed in, a way out, and a note when the Mac (which runs the scout) has been away a while.
    function signedInAs(user) {
      const bar = document.createElement("p");
      bar.className = "muted";
      bar.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:20;margin:0;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--raised);font-size:12.5px;display:flex;gap:8px;align-items:center";
      bar.innerHTML = `<span>${esc(user.email)}</span><button class="link" data-sg="out">Sign out</button>`;
      document.body.append(bar);
      Fs.onSnapshot(Fs.doc(fs, "sync", "mac"), (s) => {
        const at = s.exists() ? Date.parse(s.data().at) : 0, b = document.getElementById("banner");
        if (!b) return;
        const away = !at || Date.now() - at > MAC_STALE;
        if (away) { b.hidden = false; b.textContent = `The app on the Mac ${at ? `was last online ${new Date(at).toLocaleString()}` : "hasn't connected yet"}. Changes made here are saved; scout runs and Instagram reads wait until it's back.`; b.dataset.mac = "1"; }
        else if (b.dataset.mac) { b.hidden = true; delete b.dataset.mac; }
      }, () => {});
    }
  })();
})();
