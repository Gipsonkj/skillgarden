# API design: REST and GraphQL

> Distilled from: api-design-principles (wshobson/agents, MIT), backend-patterns (affaan-m/ECC, MIT), apollo-server (apollographql/skills, MIT), fastify-best-practices (mcollina/skills, MIT).

Use this when designing endpoints, error formats, pagination, versioning, or a GraphQL schema. Run through `templates/api-design-principles/api-design-checklist.md` before implementation and again before release.

## 1. REST resources

- Nouns, plural collections: `/orders`, `/orders/{id}`, `/orders/{id}/items`. Nest at most two levels.
- Methods: `GET` read (safe), `POST` create, `PUT` full replace (idempotent), `PATCH` partial update, `DELETE` remove (idempotent).
- Actions that are not CRUD: a sub-resource (`POST /orders/{id}/cancel`) rather than a verb in the path root.
- Field naming: one convention (snake_case or camelCase) across the whole API. Timestamps ISO 8601 UTC.

## 2. Status codes

| Code | When |
|---|---|
| 200 | Successful read or update returning a body |
| 201 | Created; include `Location` header |
| 204 | Success with no body (delete) |
| 400 | Malformed request (bad JSON, wrong types) |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed |
| 404 | Not found (also for other tenants' resources when existence is sensitive) |
| 409 | Conflict (duplicate, version mismatch) |
| 422 | Validation failed; include field errors |
| 429 | Rate limited; include `Retry-After` |
| 500/503 | Server error / temporarily unavailable; never leak internals |

## 3. Error format

One shape everywhere (RFC 9457 problem details or similar):

```json
{"error": {"code": "validation_failed", "message": "Invalid request",
  "details": [{"field": "email", "message": "must be a valid email"}],
  "request_id": "req_123"}}
```

Stable machine-readable `code`; human `message`; never stack traces.

## 4. Pagination, filtering, sorting

- Cursor pagination by default: `?limit=20&cursor=...`, response `{"data": [...], "next_cursor": "..." | null}`. Default page size 20, maximum 100.
- Offset pagination only for small, admin-style lists.
- Filters as query params (`?status=paid&created_after=...`), sorting `?sort=-created_at`. Allowlist sortable and filterable fields.

## 5. Safety and evolution

- **Idempotency keys** for `POST` that create money movement or side effects (`Idempotency-Key` header, stored with the response for 24 hours).
- **Versioning**: URL prefix (`/v1`) or a dated header; additive changes are not breaking (new fields, new optional params); removing or renaming is. Announce deprecations with a `Deprecation`/`Sunset` header and a date.
- **Rate limits** per key or user with `RateLimit-*` headers.
- **Validation** with a schema at the route (Fastify JSON Schema, zod, pydantic). Fastify: define `response` schemas too, which both serialize faster and strip unlisted fields.
- **Webhooks** you send: signed (HMAC with timestamp), retried with backoff, event ids for deduplication.
- **Docs**: OpenAPI generated from the same schemas the code validates with.

## 6. GraphQL (Apollo Server)

- Schema-first, designed around client use cases; nullable by default for fields that can fail independently.
- **Authentication in `context`** (decode the token once per request); **authorization in resolvers** or a directive, per field when needed. A field returning another user's object must check access.
- **DataLoader per request** for every relation to avoid N+1; never share a loader across requests (it caches per user).
- Mutations return the changed object plus user errors (`{ order, errors { field message } }`) for expected failures; throw `GraphQLError` with an `extensions.code` for unexpected ones.
- Pagination with connections (`first`, `after`, `edges`, `pageInfo`).
- Protect the server: depth and complexity limits, persisted queries for public clients, disable introspection in production if the schema is private, request size limits.
- Mask internal errors in production (`includeStacktraceInErrorResponses: false`).

## 7. REST or GraphQL?

| Pick REST when | Pick GraphQL when |
|---|---|
| Public API, simple resources, HTTP caching matters | Many clients with different data needs |
| Webhooks and file transfers | Deeply related data fetched together |
| Small team, few clients | A gateway over many backend services |
