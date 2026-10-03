# Threat modeling: STRIDE, attack trees, mitigation mapping

> Distilled from: security-threat-model (openai/skills, Apache-2.0), stride-analysis-patterns, attack-tree-construction, threat-mitigation-mapping (wshobson/agents, MIT).

Use this when designing a feature or system, before a launch, or when someone asks "what could go wrong with this design?". The output is a short document the team can act on, not an essay.

## 1. Scope the model (15 minutes)

Write down, in this order:

1. **What it is**: one paragraph, plus the deployment shape (internet-facing web app, internal service, CLI, library, mobile app).
2. **Assets**: data and capabilities worth protecting (credentials, personal data, payment flows, admin actions, model/API spend).
3. **Actors**: anonymous user, signed-in user, other tenant, admin, internal service, third-party webhook sender, CI system.
4. **Data-flow diagram**: components, data stores, external entities, and the trust boundaries between them. A Mermaid flowchart is enough.
5. **Assumptions**: things you are taking as given (TLS terminates at the load balancer, the identity provider is trusted). Ask the owner to confirm them; unconfirmed assumptions are the most common source of wrong conclusions.

Ground every claim in the repository or the design doc. Mark anything you inferred as an assumption.

## 2. STRIDE per element

Walk each element and each trust-boundary crossing through the six categories.

| Category | Property broken | Ask | Typical controls |
|---|---|---|---|
| Spoofing | Authentication | Can someone pretend to be another user or service? | Strong auth, MFA, mutual TLS, signed webhooks |
| Tampering | Integrity | Can data be changed in transit or at rest? | TLS, signatures/HMAC, DB constraints, write authorization |
| Repudiation | Non-repudiation | Can someone deny an action? | Append-only audit logs with actor, time, request id |
| Information disclosure | Confidentiality | Can data leak to the wrong party? | Per-object authorization, encryption, minimal responses |
| Denial of service | Availability | Can someone exhaust a resource? | Rate limits, quotas, timeouts, size caps, autoscaling limits |
| Elevation of privilege | Authorization | Can someone gain rights they should not have? | Least privilege, server-side role checks, sandboxing |

Which categories apply to which element type:

| Element | S | T | R | I | D | E |
|---|---|---|---|---|---|---|
| External entity | yes | | yes | | | |
| Process | yes | yes | yes | yes | yes | yes |
| Data store | | yes | yes | yes | yes | |
| Data flow | | yes | | yes | yes | |

## 3. Rank the threats

Score each threat on **likelihood** (how easy, how exposed) and **impact** (what is lost), each 1-3. Priority = likelihood x impact.

| Score | Priority | Action |
|---|---|---|
| 7-9 | High | Fix before launch |
| 4-6 | Medium | Fix this quarter or add a compensating control |
| 1-3 | Low | Record and accept |

Context changes the score: a missing rate limit on an internal admin tool is Low; on a public login endpoint it is High. Write one sentence per threat explaining the score.

## 4. Attack trees for the high-priority goals

For each High threat, write a small tree with the attacker goal as the root.

- **OR node**: any child achieves the parent.
- **AND node**: all children are needed.
- Annotate leaves with cost or difficulty and whether a control already exists.

```
Goal: read another tenant's invoices (OR)
  - Guess or enumerate invoice IDs (AND)
      - IDs are sequential              [control: none]
      - Endpoint lacks tenant check     [control: none]
  - Steal a session cookie (OR)
      - XSS in invoice notes            [control: CSP, escaping]
      - Cookie sent over plain HTTP     [control: Secure flag]
```

Cut the cheapest complete path first: one control on an AND node breaks the whole branch.

## 5. Map mitigations

For each threat list at least one control and its type.

| Type | Purpose | Examples |
|---|---|---|
| Preventive | Stop it happening | Input validation, authorization check, least privilege |
| Detective | Notice it happened | Audit logs, alerts on unusual access, anomaly detection |
| Corrective | Limit and recover | Token revocation, key rotation, backups, incident runbook |

Rules of thumb:

- Every High threat needs a preventive control; a detective control alone is not enough.
- Prefer controls at the trust boundary over controls deep inside.
- Record residual risk and who accepted it.

## 6. Output format

```
# Threat model: <system>
Scope and assumptions (bullets, marked confirmed/unconfirmed)
Data-flow diagram (Mermaid)
Threat table: id | element | STRIDE | description | L | I | priority | mitigation | status
Attack trees for High threats
Open questions for the owner
```

Keep it to what the team will maintain. Revisit when a trust boundary, data store or actor changes.
