# Firebase Firestore and Data Connect (vendor-specific)

> Distilled from: firebase-firestore, firebase-data-connect (firebase/agent-skills, Apache-2.0).

Use this for Firestore data modeling, queries and indexes, and for Firebase Data Connect (Postgres-backed GraphQL). For a security rules audit, the security super skill has a dedicated guide; the essentials are repeated in section 4.

## 1. Firestore data model

- Documents (max 1 MiB each) in collections; subcollections under documents.
- Model for the reads you need: Firestore has no joins, so duplicate small, stable fields (author name on a post) and accept fan-out writes when they change.
- Top-level collection with an `ownerId` field versus a subcollection under the user:

| Choose | When |
|---|---|
| Top-level collection | You query across users (admin views, collection-group not needed) |
| Subcollection (`users/{uid}/notes`) | Data is always accessed per parent; simpler rules |

- Avoid ever-growing arrays inside a document; use a subcollection.
- Avoid monotonically increasing document ids or indexed fields written at high rates (hotspots); auto ids are fine.

## 2. Queries and indexes

- Single-field indexes are automatic; compound queries (filter + order on different fields) need a composite index in `firestore.indexes.json`. The error message links to creating it; commit the index file.
- Pagination with `startAfter(lastDoc)` and `limit(n)`; avoid offsets.
- Use `count()` aggregation instead of reading all documents.
- Batched writes and transactions: up to 500 operations; transactions re-run on contention, so keep them free of side effects.

## 3. Client vs server

- Client SDKs go through security rules. The Admin SDK bypasses them: use it only on trusted servers and Cloud Functions.
- Listen with `onSnapshot` only where realtime is needed and detach listeners on unmount; each listener costs reads.
- Use the emulator suite for local development and tests.

## 4. Security rules essentials

- Default deny; split `create`/`update`/`delete` and `get`/`list`.
- Identity from `request.auth.uid` and custom claims, never from fields in the incoming document.
- `update` must re-check ownership and keep ownership fields unchanged; restrict keys with `hasOnly` and validate types and sizes.
- Every rule has an allowed and a denied emulator test.

## 5. Data Connect

- Schema in GraphQL (`schema.gql`) mapped to Cloud SQL Postgres; queries and mutations defined as connectors; generated typed SDKs for web and mobile.
- Every operation declares `@auth(level: ...)`: `PUBLIC`, `USER_ANON`, `USER`, `USER_EMAIL_VERIFIED`, or `NO_ACCESS` (admin only).
- The level only gates who may call. Restrict rows with expressions on `auth.uid`:
  ```graphql
  query MyNotes @auth(level: USER) {
    notes(where: { ownerId: { eq_expr: "auth.uid" } }) { id title }
  }
  mutation AddNote($title: String!) @auth(level: USER) {
    note_insert(data: { ownerId_expr: "auth.uid", title: $title })
  }
  ```
- Never accept owner ids as client arguments. Use `@check` with a lookup query to verify membership or roles before a mutation.
- Schema changes deploy as Postgres migrations; review generated SQL before applying to production.

## 6. Checklist

- [ ] Data model matches the main screens' reads; no unbounded arrays.
- [ ] Composite indexes committed in `firestore.indexes.json`.
- [ ] Rules default-deny with emulator tests for allowed and denied paths.
- [ ] Data Connect operations all have explicit `@auth` and `auth.uid` row filters.
