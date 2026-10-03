# Secrets: storage, scanning and leak response

> Distilled from: secrets-management (wshobson/agents, MIT), secret-scanning (github/awesome-copilot, MIT), security-and-hardening (addyosmani/agent-skills, MIT).

Use this for "where should this API key live?", setting up secret scanning, `.env` handling, and responding to a leaked credential.

## 1. Where secrets live

| Environment | Store |
|---|---|
| Local dev | `.env` file, gitignored; `.env.example` committed with placeholder values |
| CI | The CI platform's encrypted secrets, scoped to the environment; prefer OIDC federation over stored cloud keys |
| Production | A secrets manager (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault, Doppler, 1Password) or the platform's env settings |
| Kubernetes | External Secrets Operator or sealed secrets; plain `Secret` objects are only base64 |

Rules:

- Code reads secrets from the environment or the manager SDK; never hardcode, never commit.
- Validate required secrets at startup and fail fast with the variable name (not its value).
- One secret per service and environment, least privilege. Dev keys never work against production.
- Front-end bundles are public: anything shipped to the browser (`NEXT_PUBLIC_`, `VITE_`) is not a secret.
- Rotate on a schedule (for example 90 days for static keys) and on every staff departure with access. Short-lived credentials beat rotation.

## 2. Keep them out of git

`.gitignore` baseline:
```
.env
.env.*
!.env.example
*.pem
*.key
```

Add a pre-commit scanner (gitleaks, trufflehog, or detect-secrets) and run it in CI too, since hooks can be skipped.

## 3. GitHub secret scanning and push protection

- Enable secret scanning and **push protection** at the organization or repository level (Settings -> Code security). Push protection blocks the push when a supported token is detected.
- Bypasses require a reason (false positive, used in tests, will fix later); review bypasses weekly.
- Add **custom patterns** for internal token formats (a regex plus test strings) and check them against sample data before publishing to avoid alert floods.
- Enable validity checks where offered so alerts show whether the credential is still active.
- Alert triage: confirm, rotate, then close as "revoked". Closing as "false positive" requires evidence.

## 4. A secret leaked: response order

1. **Revoke or rotate first.** Assume it has been copied the moment it was pushed to any remote. History rewriting does not un-leak it.
2. **Check usage**: provider audit logs for the window since the commit.
3. **Replace** the secret in the store and redeploy consumers.
4. **Then clean history** if needed (`git filter-repo`), coordinate with collaborators to re-clone, and ask the host to purge cached views where supported.
5. **Prevent recurrence**: add the pattern to scanning, add the file to `.gitignore`, write a one-paragraph incident note.

## 5. Logging

- Redact secrets and tokens in logs by key name (`authorization`, `cookie`, `password`, `token`, `secret`, `api_key`) at the logger level.
- Never echo secrets in CI logs; mask any value derived from a secret.
