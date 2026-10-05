# Authentication and authorization implementation

> Distilled from: auth-implementation-patterns (wshobson/agents, MIT), backend-patterns (affaan-m/ECC, MIT), supabase (supabase/agent-skills, MIT). Auth0 section written in our own words from the Auth0 docs.

Use this when adding login, sessions, tokens, OAuth, API keys or role checks to a backend. Prefer a managed provider or a maintained library over building auth yourself.

## 1. Build or buy

| Option | When |
|---|---|
| Managed provider (Supabase Auth, Clerk, Auth0, Firebase Auth, Cognito) | Default for new apps; MFA, social login and resets come built in |
| Maintained library (Auth.js, Better Auth, Lucia-style patterns, Django auth, fastapi-users) | You want users in your own database |
| Hand-rolled | Only for narrow cases (internal API keys); still use vetted primitives |

**Pick a provider or library**

| Situation | Use | Why |
|---|---|---|
| The app already uses one, or the user pays for one | That one | Migrating users and sessions is costly |
| Database is Supabase | Supabase Auth (supabase.md) | Same JWT drives RLS |
| Firebase / Firestore app | Firebase Auth (firebase.md) | Rules read `request.auth` |
| Next.js or React app, wants the quickest hosted setup | Clerk | Framework quickstarts and a CLI; see clerk-setup under "Go deeper" in SKILL.md |
| Several apps or APIs, enterprise SSO, B2B organizations, free tier to start | Auth0 (section 8) | Universal Login, RBAC in tokens, Actions; free plan covers small apps |
| Already on AWS | Cognito | Stays in the same cloud account as the rest of the stack |
| Users must live in your own database, no vendor | Auth.js, Better Auth, Django auth, fastapi-users | Free; you run resets, MFA and security updates |

If the user has not said which provider their app uses, ask; don't scaffold a second one.

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

## 8. Auth0 (managed provider)

**Access:** Dashboard, Auth0 CLI, Management API, SDKs. CLI on macOS: `brew tap auth0/auth0-cli && brew install auth0`, then `auth0 login`.

```bash
auth0 apis create --name "Orders API" --identifier "https://api.example.com"
auth0 apps create --name "Web" --type spa
```

These change the user's tenant: show the exact command and wait for a yes. The API identifier becomes the `audience`.

**Protect an Express API** with `express-oauth2-jwt-bearer`; config from env vars (`AUTH0_DOMAIN`, `AUTH0_AUDIENCE`), never in the repo:

```js
const { auth, requiredScopes } = require("express-oauth2-jwt-bearer");

const checkJwt = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
});

app.get("/api/orders", checkJwt, requiredScopes("read:orders"), (req, res) => {
  const userId = req.auth.payload.sub; // still check this user may see each order
});
```

The middleware rejects tokens whose `iss` or `aud` don't match with 401.

**Gotchas:**

- **Always request the API's audience.** Without an `audience`, Auth0 issues an opaque token meant only for `/userinfo`; your API cannot validate it. With your API identifier as audience you get a JWT.
- **RBAC:** in Applications > APIs > (your API) > Settings, turn on "Enable RBAC" and "Add Permissions in the Access Token". Permissions then arrive in the `permissions` claim, and `scope` holds the requested permissions the user actually has, so `requiredScopes` works when the client asks for those scopes.
- **Custom claims** (tenant id, plan) go in a post-login Action with a namespaced name you control, for example `api.accessToken.setCustomClaim("https://example.com/tenant_id", tenantId)`. Non-namespaced claims can collide with reserved ones and be dropped.
- **Lifetimes:** access tokens for a custom API last 86400 seconds (24 hours) by default; shorten it in the API settings to match section 2.
- **Machine-to-machine:** `POST https://{AUTH0_DOMAIN}/oauth/token` with `grant_type=client_credentials`, `client_id`, `client_secret` and `audience`, from server code only.
- **Plan limits (Free):** up to 25,000 monthly active users, 5 Organizations, 1 custom domain (needs card verification). Moving to a paid plan spends money: show the plan and price and wait for a yes.

## 9. Checklist

- [ ] Provider or library chosen; no custom crypto.
- [ ] Tokens/sessions in httpOnly cookies; access tokens 15-30 min.
- [ ] Login/reset rate-limited with a shared store.
- [ ] Every protected route checks resource-level permission; denied-path tests exist.
- [ ] Logout and password change revoke sessions/refresh tokens.
