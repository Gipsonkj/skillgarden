// Read-only stand-in for the capabilities skill-garden.html uses, for the public website.
// Super skills come from /data/topics.json (built from ../superskills); nothing can be written.
(() => {
  "use strict";
  window.SG_PUBLIC = true;
  let topics = null;
  const load = () => (topics ||= fetch("/data/topics.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  const meta = { fromCache: false, hasPendingWrites: false };
  const docSnap = (id, data) => ({ id, exists: data !== undefined, data: () => data, metadata: meta });
  const rows = async (col) => (col === "topics" ? Object.entries(await load()).map(([id, data]) => ({ id, data })) : []);
  const readOnly = () => Promise.reject({ code: "permission_denied", message: "This is the read-only public garden." });
  function query(col) {
    const q = {
      where: () => q, orderBy: () => q, limit: () => q,
      get: async () => { const r = await rows(col); return { docs: r.map((x) => docSnap(x.id, x.data)), size: r.length, empty: !r.length, docChanges: () => [], metadata: meta }; },
      onSnapshot(next, error) { q.get().then(next, error); return () => {}; },
    };
    return q;
  }
  function docRef(col, id) {
    const read = async () => (col === "topics" ? (await load())[id] : undefined);
    return { id, path: `${col}/${id}`, get: async () => docSnap(id, await read()), set: readOnly, update: readOnly, delete: readOnly,
      onSnapshot(next, error) { read().then((d) => next(docSnap(id, d)), error); return () => {}; } };
  }
  const db = {
    collection: (col) => Object.assign(query(col), { path: col, doc: (id) => docRef(col, id), add: readOnly }),
    doc: (p) => { const [col, id] = String(p).split("/"); return docRef(col, id); },
  };
  const downloads = {
    async save({ filename, data }) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); a.download = filename;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      return { status: "saved" };
    },
  };
  const caps = { db, downloads };
  window.claude = { use: async (name) => caps[name] || null };
})();
