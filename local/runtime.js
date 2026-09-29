// Stands in for the claude.ai capabilities skill-garden.html uses (db, user,
// downloads, mcp) when the page is served by server.mjs on this computer.
(() => {
  "use strict";
  const HEADERS = { "Content-Type": "application/json", "X-Skill-Garden": "1" };
  async function api(method, url, body) {
    let r;
    try { r = await fetch(url, { method, headers: HEADERS, body: body === undefined ? undefined : JSON.stringify(body) }); }
    catch { throw { code: "unavailable", message: "Skill Garden's local server isn't running." }; }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw { code: r.status === 404 || r.status === 400 ? "invalid_argument" : r.status === 409 ? "tool_error" : "unavailable", message: data.error || r.statusText };
    return data;
  }

  /* live updates: one event stream, listeners per collection */
  const subs = new Map();
  let es = null;
  function listen(col, fn) {
    if (!es) {
      es = new EventSource("/api/events");
      es.onmessage = (ev) => { try { const { col: c } = JSON.parse(ev.data); (subs.get(c) || []).forEach((f) => f()); } catch {} };
      // after a reconnect (server restarted), refresh everything
      es.onopen = () => subs.forEach((fns) => fns.forEach((f) => f()));
    }
    if (!subs.has(col)) subs.set(col, new Set());
    subs.get(col).add(fn);
    fn();
    return () => subs.get(col).delete(fn);
  }

  const meta = { fromCache: false, hasPendingWrites: false };
  const docSnap = (id, data) => ({ id, exists: data !== undefined, data: () => data, metadata: meta });
  const querySnap = (rows) => ({ docs: rows.map((r) => docSnap(r.id, r.data)), size: rows.length, empty: !rows.length, docChanges: () => [], metadata: meta });

  function compare(a, b) { return a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : a < b ? -1 : 1; }
  const TESTS = {
    "==": (a, b) => a === b, "!=": (a, b) => a !== b, "<": (a, b) => a < b, "<=": (a, b) => a <= b, ">": (a, b) => a > b, ">=": (a, b) => a >= b,
    in: (a, b) => b.includes(a), "not-in": (a, b) => !b.includes(a), "array-contains": (a, b) => Array.isArray(a) && a.includes(b),
  };
  function query(col, filters = [], order = null, max = null) {
    const apply = (rows) => {
      let out = rows.filter((r) => filters.every(([f, op, v]) => (TESTS[op] || (() => true))(r.data[f], v)));
      const [f, dir] = order || ["", "asc"];
      const val = (r) => (order ? r.data[f] : r.id);
      // missing values sort last in either direction, as on claude.ai
      out.sort((x, y) => { const a = val(x), c = val(y); return a === undefined || c === undefined ? compare(a, c) : compare(a, c) * (dir === "desc" ? -1 : 1); });
      return max ? out.slice(0, max) : out;
    };
    const fetchRows = () => api("GET", `/api/col/${encodeURIComponent(col)}`);
    return {
      where: (f, op, v) => query(col, [...filters, [f, op, v]], order, max),
      orderBy: (f, dir = "asc") => query(col, filters, [f, dir], max),
      limit: (n) => query(col, filters, order, n),
      get: async () => querySnap(apply(await fetchRows())),
      onSnapshot(next, error) {
        let alive = true;
        const off = listen(col, () => fetchRows().then((rows) => alive && next(querySnap(apply(rows)))).catch((e) => alive && error && error(e)));
        return () => { alive = false; off(); };
      },
    };
  }
  function docRef(col, id) {
    const url = `/api/doc/${encodeURIComponent(col)}/${encodeURIComponent(id)}`;
    const read = () => api("GET", url).then((r) => r.data).catch((e) => { if (e.code === "invalid_argument") return undefined; throw e; });
    return {
      id, path: `${col}/${id}`,
      get: async () => docSnap(id, await read()),
      set: (data) => api("PUT", url, data).then(() => undefined),
      update: (data) => api("PATCH", url, data).then(() => undefined),
      delete: () => api("DELETE", url).then(() => undefined),
      onSnapshot(next, error) {
        let alive = true;
        const off = listen(col, () => read().then((d) => alive && next(docSnap(id, d))).catch((e) => alive && error && error(e)));
        return () => { alive = false; off(); };
      },
    };
  }
  const db = {
    collection: (col) => Object.assign(query(col), {
      path: col,
      doc: (id) => docRef(col, id || Math.random().toString(36).slice(2, 12)),
      add: async (data) => { const ref = docRef(col, Math.random().toString(36).slice(2, 12)); await ref.set(data); return ref; },
    }),
    doc: (p) => { const [col, id] = String(p).split("/"); return docRef(col, id); },
  };

  const user = {
    isOwner: async () => true, canEdit: async () => true, can: async () => true, id: async () => "local",
    me: async () => ({ id: "local", name: "", avatarUrl: "", color: "#1D6B50", email: null, isOwner: true, canEdit: true }),
    profiles: async (ids) => Object.fromEntries([].concat(ids).map((i) => [i, { id: i, name: "", avatarUrl: "", color: "#1D6B50", email: null, isMe: i === "local", guest: false }])),
  };

  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      return { status: "saved" };
    },
  };

  // The page starts a run through the claude.ai routine; here the local server runs it.
  const mcp = {
    async callTool(server, tool) {
      if (tool !== "fire_trigger") throw { code: "bad_request", message: "Not available locally." };
      await api("POST", "/api/scout");
      return { content: [], payload: { started: true } };
    },
  };

  const caps = { db, user, downloads, mcp };
  window.claude = { use: async (name) => caps[name] || null };
})();
