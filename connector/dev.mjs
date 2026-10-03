// Run the connector on this computer: node dev.mjs  →  http://localhost:8787/mcp
// Reads the repo branch in REF (default main). Set ACCESS_KEYS to require a key.
import http from "node:http";
import worker from "./worker.js";
const env = { REPO: process.env.REPO || "Gipsonkj/skillgarden", REF: process.env.REF || "main", ACCESS_KEYS: process.env.ACCESS_KEYS || "", GITHUB_TOKEN: process.env.GITHUB_TOKEN || "" };
const port = Number(process.env.PORT || 8787);
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const r = await worker.fetch(new Request(`http://localhost:${port}${req.url}`, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, "127.0.0.1", () => console.log(`Skill Garden connector on http://localhost:${port}/mcp (repo ${env.REPO}@${env.REF})`));
