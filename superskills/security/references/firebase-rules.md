# Firebase security rules review (vendor-specific)

> Distilled from: firebase-security-rules-auditor (firebase/agent-skills, Apache-2.0), firebase-firestore and firebase-data-connect (firebase/agent-skills, Apache-2.0).

Use this when writing or reviewing `firestore.rules`, `storage.rules`, or Data Connect `@auth` directives. Rules are the only server-side check for client SDK access: if a rule allows it, any signed-in (or anonymous) client can do it.

## 1. Rules of thumb

- Default deny: start from `allow read, write: if false;` and open specific paths.
- Split `write` into `create`, `update`, `delete`, and `read` into `get`, `list` when they need different conditions.
- Authority comes from `request.auth.uid` or custom claims, never from fields in the document the client is writing.
- Validate shape on create **and** update: required keys, allowed keys, types, sizes.
- Test with the emulator and `@firebase/rules-unit-testing`; every rule gets an allowed and a denied test.

## 2. Audit checklist

| Check | What goes wrong |
|---|---|
| `update` re-validates everything `create` checks | Client creates a valid doc, then updates `role: "admin"` or `ownerId` to someone else. |
| Ownership fields immutable on update | `request.resource.data.ownerId == resource.data.ownerId` missing. |
| Allowed keys restricted | `request.resource.data.keys().hasOnly([...])` without also checking ownership still lets clients write any value to allowed keys. |
| Field types and sizes checked | `is string`, `.size() <= 1000`, list sizes bounded; otherwise storage abuse. |
| `list` queries constrained | A `get` rule based on ownership does not stop a `list` on the whole collection unless the rule references fields the query must filter on. |
| Role checks come from a trusted source | Roles stored in a user-writable profile doc can be self-granted; use custom claims or an admin-only collection. |
| Recursive wildcards | `match /{document=**}` with a broad allow opens every subcollection. |
| Storage rules | Content type and size checked (`request.resource.size < 5 * 1024 * 1024`, `contentType.matches('image/.*')`), path tied to `request.auth.uid`. |
| Test mode left on | `allow read, write: if request.time < timestamp.date(...)` shipped to production. |

## 3. Example

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /notes/{noteId} {
      allow get, list: if request.auth != null
                       && resource.data.ownerId == request.auth.uid;
      allow create: if request.auth != null
                    && request.resource.data.ownerId == request.auth.uid
                    && request.resource.data.keys().hasOnly(['ownerId', 'title', 'body'])
                    && request.resource.data.title is string
                    && request.resource.data.title.size() <= 200;
      allow update: if request.auth != null
                    && resource.data.ownerId == request.auth.uid
                    && request.resource.data.ownerId == resource.data.ownerId
                    && request.resource.data.keys().hasOnly(['ownerId', 'title', 'body']);
      allow delete: if request.auth != null
                    && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

## 4. Data Connect

- Every query and mutation needs an explicit `@auth(level: ...)`: `PUBLIC`, `USER_ANON`, `USER`, `USER_EMAIL_VERIFIED`, or `NO_ACCESS` (admin SDK only).
- `PUBLIC` and `USER` only say who may call; filter rows with `auth.uid` expressions (`where: { ownerId: { eq_expr: "auth.uid" } }`) so users see only their own data.
- Mutations set ownership from `auth.uid` (`ownerId_expr: "auth.uid"`), not from a client-supplied argument.
- Use `@check`/`@redact` to verify a related row (membership, role) before acting.

## 5. Report format

Table: path | operation | issue | example request a client could send | fixed rule | emulator test added.
