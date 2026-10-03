# Authentication and authorization implementation

> Distilled from: auth-implementation-patterns (wshobson/agents, MIT), backend-patterns (affaan-m/ECC, MIT), supabase (supabase/agent-skills, MIT).

Use this when adding login, sessions, tokens, OAuth, API keys or role checks to a backend. Prefer a managed provider or a maintained library over building auth yourself.

## 1. Build or buy

| Option | When |
|---|---|
| Managed provider (Supabase Auth, Clerk, Auth0, Firebase Auth, Cognito) | Default for new apps; MFA, social login and resets come built in |
| Maintained library (Auth.js, Better Auth, Lucia-style patterns, Django auth, fastapi-users) | You want users in your own database |
| Hand-rolled | Only for narrow cases (internal API keys); still use vetted primitives |

## 2. Sessions vs tokens

| | Server sessions (cookie with session id) | JWT access + refresh tokens |
|---|---|---|
| Revocation | Immediate (delete the row) | Only at expiry unless you keep a denylist |
| Best for | Web apps on one domain | Mobile, multiple APIs, service-to-service |
| Storage in browser | httpOnly cookie | httpOnly cookie (not `localStorage`) |

Token rules:

- Access tokens short-lived (15-30 minutes); refresh tokens longer (days to weeks), rotated on every use, stored hashed server-side so they can be revoked; reuse of an old refresh token revokes the family.
- Verify signature, `exp`, `iss`, `aud`; pin the algorithm on the server.
- Keep claims minimal (user id, tenant id, role); never personal data you would not show in a URL.

## 3. Passwords

- Hash with argon2id (preferred) or bcrypt with cost 12 or more. Never fast hashes.
- Minimum length 8 (12 better); check against breached-password lists; no composition rules that annoy without helping.
- Login and reset endpoints: rate limit (about 10 attempts per 15 minutes per account and per IP, shared store), generic error messages ("invalid email or password"), constant-ish response time.
- Reset tokens: random 32 bytes, stored hashed, single use, expire in 15-60 minutes; invalidate sessions on password change.

## 4. Cookies and CSRF

- `HttpOnly; Secure; SameSite=Lax` by default; `Path=/`; bounded `Max-Age`.
- `SameSite=Lax` blocks most cross-site POSTs; add CSRF tokens (or double-submit) for `SameSite=None` or when state-changing GETs exist (they should not).

## 5. OAuth / OIDC

- Authorization Code flow with PKCE for every client type; validate `state` (and `nonce` for OIDC).
- Exact-match redirect URIs.
- Link accounts by verified email only.

## 6. Authorization

| Model | Use |
|---|---|
| Role-based (RBAC) | Small fixed role set (owner, admin, member, viewer) |
| Permission-based | Roles map to permissions (`invoice:write`); check permissions in code, not role names |
| Attribute/relationship-based | Access depends on ownership or sharing (document shared with user X); use policies or a service like OpenFGA |
| Row Level Security | Postgres enforces the rule in the database itself (see supabase.md) |

- Check on the server for every request, against the specific resource and tenant.
- Centralize checks in one function or middleware (`can(user, 'invoice:write', invoice)`), and test the denied path.
- Roles and permissions come from your database or verified token claims, never from user-editable profile metadata.

## 7. API keys (machine access)

- Generate 32 random bytes with a prefix (`sk_live_...`) so leaks are scannable; show once; store a hash.
- Scope keys (read-only, per resource), set expiry, record last use, allow rotation with overlap.

## 8. Checklist

- [ ] Provider or library chosen; no custom crypto.
- [ ] Tokens/sessions in httpOnly cookies; access tokens 15-30 min.
- [ ] Login/reset rate-limited with a shared store.
- [ ] Every protected route checks resource-level permission; denied-path tests exist.
- [ ] Logout and password change revoke sessions/refresh tokens.
