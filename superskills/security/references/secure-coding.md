# Secure coding: hardening the code you write

> Distilled from: security-and-hardening (addyosmani/agent-skills, MIT), security-review (affaan-m/everything-claude-code, MIT), security-best-practices (openai/skills, Apache-2.0), golang-security (samber/cc-skills-golang, MIT), security-review (getsentry/skills, Apache-2.0).

Use this when you are building or changing anything that takes untrusted input, handles sessions, stores personal data, or calls out to other services. The goal is secure-by-default code, not a checklist pasted at the end.

## 1. Five minutes of threat thinking first

Before writing the handler, answer three questions in a comment or the PR description:

1. **Where does untrusted data enter?** HTTP bodies, headers, cookies, path params, uploads, webhooks, queue messages, third-party API responses, LLM output, and "internal" values another process wrote (filenames on a shared volume, a path in a job payload). Trust follows who *wrote* a value, not which channel delivered it.
2. **What is worth stealing or breaking?** Credentials, personal data, payment data, admin actions, money movement.
3. **What is the blast radius if this control fails?** RCE, cross-tenant read, account takeover, cost runaway.

Then write the first test as an abuse case ("user B requests user A's invoice -> 404").

## 2. The three tiers

| Always | Ask the human first | Never |
|---|---|---|
| Validate input at the boundary with a schema | New auth flow or change to auth logic | Commit secrets (keys, tokens, passwords) |
| Parameterize every query (SQL, NoSQL, shell args) | Storing a new category of sensitive data | Log passwords, tokens, full card numbers |
| Encode output via framework auto-escaping | New third-party integration | Trust client-side validation |
| Check authorization on every request, per resource | CORS changes | `eval`/`innerHTML`/`exec` with user data |
| Hash passwords with argon2id, scrypt or bcrypt (cost >= 12) | File upload handlers | Auth tokens in `localStorage` |
| httpOnly + Secure + SameSite cookies, bounded max-age | Rate-limit changes | Stack traces or SQL errors in responses |
| Security headers on every response | Granting elevated roles | Disable a security control "for now" |

## 3. Controls by area

### Input validation
- Validate shape, length, enum and format with a schema (zod, pydantic, JSON Schema, Fastify schemas). Reject with 422 and field-level details. Downstream code uses only the parsed, typed value.
- Allowlist, never blocklist. Cap sizes: body (for example 1 MB), strings (`max(200)`), arrays, page size (max 100).

### Injection
- SQL: placeholders only. ORMs are safe until you reach `.raw()`, `.extra()`, `$queryRawUnsafe`, string-built `RawSQL`. Identifiers (column names) cannot be parameterized: map them through an allowlist.
- Shell: pass an argument array (`execFile`, `exec.Command(name, args...)`, `subprocess.run([...])`), never `shell=True` or `bash -c` with input.
- Templates: never render user input as a template source.

### XSS
- Framework escaping (`{x}` in React, `{{ }}` in Django/Vue) is the default defence. The dangerous escapes are `dangerouslySetInnerHTML`, `v-html`, `|safe`, `mark_safe`, `innerHTML`.
- If you must render user HTML, sanitize with an allowlist sanitizer (DOMPurify) and a tiny tag list.
- CSP: start at `default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` and loosen per directive. `'unsafe-inline'`/`'unsafe-eval'` are debt with a removal date.

### Access control (the #1 real-world bug)
- Authentication answers "who"; authorization answers "may this principal do this action on this resource". Check both on every request.
- Load the resource scoped to the caller (`WHERE id = $1 AND org_id = $2`) instead of loading by id then comparing.
- Check bulk, export, import, search and GraphQL nested resolvers, not just the obvious route. Each item needs its own check.
- Return 404 (not 403) for other tenants' objects when existence itself is sensitive.
- Public identifiers should not be guessable or count-revealing: expose UUIDv7/random IDs, not sequential integers.

### Sessions and auth
- Session secret and JWT keys come from the environment or a secrets manager.
- Cookies: `HttpOnly; Secure; SameSite=Lax` (or `Strict`), `Max-Age` bounded. `SameSite=None` sends the cookie cross-site and needs CSRF tokens.
- Access tokens 15-30 minutes; refresh tokens rotated and revocable. Pin the JWT algorithm server-side; never accept `alg` from the token header.
- Secure cookies break plain-HTTP local dev: gate `Secure` on an env flag rather than dropping it. Do not recommend HSTS preload casually: it can lock users out for months.

### Headers, CORS, errors
- Use helmet (or equivalent) for `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, CSP.
- CORS: explicit origin list from config. Never `*` together with credentials.
- Strip sensitive fields (password hash, reset tokens, internal flags) with an explicit response DTO. Generic error body to the client, details to server logs with a request id.

### SSRF (any URL the server fetches for a user)
1. Allowlist scheme (`https`) and host.
2. Resolve **all** DNS records; reject if any address is loopback, link-local (`169.254.169.254` cloud metadata), private, unique-local or reserved, IPv4 and IPv6.
3. Disable redirects (`redirect: 'error'`).
4. The check has a DNS-rebinding gap: for high-risk features pin the resolved IP for the connection or route through an egress filtering proxy.

### File uploads and paths
- Allowlist MIME types, cap size (for example 5 MB), check magic bytes when it matters; the extension proves nothing. Store outside the web root with a generated name.
- Path traversal: resolve the final path (symlinks included) and confirm it sits under an allowlisted root. In Go 1.24+ use `os.Root`; never rely on `Clean` + string prefix alone.
- Destructive operations on derived paths (delete, move, overwrite): require (a) resolved target under an allowlisted root, (b) at least one level below that root, (c) ownership evidence read before the operation. On refusal, log and stop; never fall back to a broader default path.

### Rate limiting
- General API: about 100 requests per 15 minutes per IP/user. Auth endpoints: about 10 attempts per 15 minutes. Expensive search/LLM calls: separate, tighter limits.
- In-memory counters become `limit x instances` behind a load balancer and never fire on serverless. Use a shared store (Redis, Upstash, gateway limiter).

### Cryptography
- Never roll your own. Use AES-GCM or libsodium secretbox for data, argon2id/bcrypt for passwords, HMAC-SHA256 for signatures.
- Tokens and nonces come from a CSPRNG (`crypto.randomBytes`, `secrets`, `crypto/rand`), never `Math.random`/`random`/`math/rand`.
- Compare secrets in constant time (`timingSafeEqual`, `hmac.compare_digest`, `subtle.ConstantTimeCompare`).
- A crypto error must fail closed; `_ , _ = encrypt(x)` that continues unencrypted is a critical bug.

### Logging and privacy
- Log security events (login success/failure, permission denials, role changes) with user id and request id; never the secret material.
- Classify fields as you add them: non-personal, personal (email, IP, device id), sensitive (health, finance, location, government ids, minors). Personal data needs a purpose, a retention period and a working delete/export path that reaches backups, caches, search indexes and analytics copies.
- Sending personal data to analytics, ads or LLM vendors is sharing: it needs consent and a data-processing agreement.

## 4. Framework quick notes

| Stack | Safe default | Footgun to grep for |
|---|---|---|
| Express | `helmet()`, `express.json({limit})`, zod at route | `res.send(req.query.x)`, `child_process.exec`, `cors({origin: true, credentials: true})` |
| Next.js | Server Actions re-check auth; env vars without `NEXT_PUBLIC_` stay server-side | `NEXT_PUBLIC_` on a secret, `dangerouslySetInnerHTML`, open redirects via `?next=` |
| Django | ORM, auto-escape, CSRF middleware on | `|safe`, `mark_safe`, `.raw()`/`.extra()`, `DEBUG=True` in prod, `csrf_exempt` |
| Flask/FastAPI | pydantic models, `Depends()` auth | `render_template_string(user)`, `yaml.load`, `pickle.loads`, missing auth dependency on one router |
| Go | `database/sql` placeholders, `html/template`, `exec.Command(name, args...)` | `text/template` for HTML, `fmt.Sprintf` into SQL, `math/rand` tokens, missing server timeouts |
| React/Vue | JSX/mustache escaping | `dangerouslySetInnerHTML`, `v-html`, `href={userUrl}` with `javascript:` |

## 5. Verification before you call it done

- [ ] An abuse-case test exists for each new endpoint (wrong user -> 403/404, bad input -> 422, over limit -> 429).
- [ ] No secrets in code or in `git log -p` for the change.
- [ ] Every protected route checks authorization against the specific resource.
- [ ] Responses do not leak internals; headers present (check DevTools or `curl -I`).
- [ ] Server-side fetches of user URLs go through the SSRF guard.
- [ ] Rate limiter uses a shared store if more than one instance runs.
- [ ] Personal data has a purpose, a retention period and a delete path.

## Rationalizations to reject

| Excuse | Reality |
|---|---|
| "It's an internal tool" | Internal tools get phished into; they are often the weakest link. |
| "The framework handles it" | Frameworks give tools; the escape hatches are where bugs live. |
| "It's just a prototype" | Prototypes ship. Habits from day one cost nothing. |
| "It's only LLM output" | That text can be SQL, a script tag or a shell command. |
