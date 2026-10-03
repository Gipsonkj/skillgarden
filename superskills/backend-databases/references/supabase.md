# Supabase (vendor-specific)

> Distilled from: supabase (supabase/agent-skills, MIT), supabase-postgres-best-practices (supabase/agent-skills, MIT).

Use this for Supabase projects: Row Level Security, auth integration, keys, views and functions, connection strings, and the CLI migration flow. General Postgres design is in postgres-schema.md and query-performance.md.

## 1. Keys

| Key | Where it may live | Notes |
|---|---|---|
| Publishable / anon key | Browser and mobile apps | Safe only because RLS is on for every exposed table |
| Secret / `service_role` key | Server only (env var, secrets manager) | Bypasses RLS entirely. Never in a client bundle, never in `NEXT_PUBLIC_*` |

## 2. Row Level Security

- Enable RLS on **every** table in an exposed schema (`public` by default). A table without RLS is readable and writable with the anon key.
- Write a policy per operation. `UPDATE` needs both `USING` (which rows can be targeted) and `WITH CHECK` (what the row may become); missing `WITH CHECK` lets users move rows to another owner.
- Wrap auth functions in a sub-select so Postgres evaluates them once per query instead of once per row:
  ```sql
  create policy "own rows" on notes for select to authenticated
    using (owner_id = (select auth.uid()));
  create policy "update own" on notes for update to authenticated
    using (owner_id = (select auth.uid()))
    with check (owner_id = (select auth.uid()));
  ```
- Index the columns policies filter on (`owner_id`, `tenant_id`).
- Specify the role (`to authenticated`) so policies are not evaluated for anon traffic.
- Authorization data comes from tables you control or `app_metadata` (server-set). **Never** from `user_metadata`, which the user can edit.
- Test policies as each role (`set local role authenticated; set local request.jwt.claims = '...'`) or with pgTAP.

## 3. Views and functions

- Views run with the owner's rights by default and bypass RLS: create them `with (security_invoker = true)` (Postgres 15+), or keep them out of exposed schemas.
- Avoid `security definer` functions. If one is unavoidable:
  - put it in a non-exposed schema (for example `private`),
  - check `auth.uid()` inside it,
  - `set search_path = ''` and schema-qualify every name,
  - `revoke execute on function ... from public, anon` and grant only to the roles that need it.

## 4. Connections

| String | Use |
|---|---|
| Transaction pooler (port 6543) | Serverless functions and most app traffic; no prepared statements across transactions |
| Session pooler (port 5432 via pooler) | IPv4-only environments needing session features |
| Direct connection | Migrations, `pg_dump`, long-lived workers, `LISTEN/NOTIFY` |

## 5. Workflow with the CLI

1. `supabase init`, `supabase start` (local stack in Docker).
2. Change schema with migration files: `supabase migration new <name>`, write SQL, `supabase db reset` locally to replay.
3. Generate types: `supabase gen types typescript --local > src/types/db.ts`.
4. `supabase db push` to the linked project (after review), or let CI apply migrations.
5. Run the database advisors (security and performance lints) in the dashboard or via `supabase db lint`, and fix RLS warnings before launch.

## 6. Other services

- **Storage**: buckets private by default; access through RLS policies on `storage.objects`; signed URLs with short expiry for private files.
- **Edge Functions**: verify the JWT (default on); use the secret key only inside the function; set CORS explicitly.
- **Realtime**: respects RLS for Postgres changes when using authenticated clients; use broadcast/presence channels with authorization for private rooms.

## 7. Launch checklist

- [ ] RLS enabled on every exposed table; advisors show no RLS errors.
- [ ] Every `UPDATE` policy has `WITH CHECK`.
- [ ] `service_role` key absent from all client code and public env vars.
- [ ] Views are `security_invoker`; no exposed `security definer` functions.
- [ ] Policy columns indexed; auth calls wrapped in `(select ...)`.
- [ ] Point-in-time recovery or backups configured for production.
