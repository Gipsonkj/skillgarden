# Deliverability and authentication

> Distilled from: email-best-practices deliverability, compliance and list-management references (resend/resend-skills, MIT), postmark-email-best-practices deliverability reference (ActiveCampaign/postmark-skills, MIT), twilio-sendgrid-deliverability-advisor (twilio/ai, MIT), deliverability-qa and its checklist (aaron-he-zhu/aaron-marketing-skills, Apache-2.0), loops-email-sending-best-practices deliverability reference (loops-so/skills, MIT), amazon-ses domain identity reference (aws/agent-toolkit-for-aws, Apache-2.0), email-marketing-bible (CosmoBlk/email-marketing-bible, MIT), resend sending overview (resend/resend-skills, MIT).

Use for "emails going to spam", "set up SPF/DKIM/DMARC", "BIMI", "warm up a new domain", "bounce rate is high", "spam complaints", "Gmail/Yahoo sender requirements", "List-Unsubscribe header", "blocklisted", "Postmaster Tools".

Provider rules and thresholds below are as of the sources (2025-2026). Mailbox providers change them; check current docs (Google, Yahoo, Microsoft sender guidelines) before relying on a number.

## 1. Bulk-sender rules (Gmail, Yahoo, Microsoft, Apple)

| Requirement | Who | Notes |
|---|---|---|
| SPF and DKIM pass | All senders, all volumes | Aligned with the visible From domain |
| DMARC record (p=none minimum), aligned | More than 5,000 messages a day to that provider | Orange (France): more than 1,000 a day. Microsoft consumer mail returns a 550 reject when missing |
| One-click unsubscribe (RFC 8058) | Bulk marketing mail | Honour within 48 hours (2 days) |
| Spam complaint rate | Gmail and Yahoo: keep under 0.10%, aim under 0.08%; 0.3% and above risks blocking | Orange tolerates under 0.6% but has no feedback loop |
| Valid forward and reverse DNS, TLS | All | Your ESP usually covers this; check on dedicated IPs |

Treat the 5,000/day line as a floor, not a target: set all three records up before the first send at any volume.

## 2. Authentication setup

### SPF
```
v=spf1 include:<your-esp-include> ~all
```
- **One SPF record per domain.** A second record breaks both. Merge every sender (ESP, Google Workspace, helpdesk) into one: `v=spf1 include:_spf.google.com include:spf.mtasv.net ~all`.
- **10 DNS-lookup limit.** Each `include`, `a`, `mx` counts. Near the limit, drop unused senders or move a sender to its own subdomain.
- **End with `~all`** (soft fail). One source recommends `-all`; the ESP sources prefer `~all` because `-all` can break forwarded mail. With DMARC at enforcement, `~all` is enough. Never `+all`.
- Many ESPs check SPF on their own bounce (Return-Path / MAIL FROM) domain. A custom MAIL FROM subdomain (for example `bounce.example.com`) makes SPF align with your domain.

### DKIM
- Your ESP gives one or more TXT or CNAME records (for example `pm._domainkey` → `pm.mtasv.net`). Add them exactly; selector names are case-sensitive.
- **2048-bit keys.** 1024-bit still passes provider rules but is below current best practice. Rotate keys about yearly if your ESP does not do it for you (Postmark rotates automatically).
- The `d=` domain in the signature must match (or be a parent of) the From domain, or DMARC cannot use it.

### DMARC
Publish one TXT record at `_dmarc.example.com` and ramp it:
```
v=DMARC1; p=none; rua=mailto:dmarc@example.com                 # weeks 1-4: monitor
v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@example.com   # then 25%, 50%, 100%
v=DMARC1; p=reject; rua=mailto:dmarc@example.com               # when reports show only your own senders failing nothing
```
- DMARC passes when **either** SPF or DKIM passes **and aligns** with the From domain. Set up both so forwarded mail (which breaks SPF) still passes on DKIM.
- **Default (relaxed) alignment** lets `bounce.example.com` align with `example.com`. A record with `aspf=s` (strict) breaks that, leaving DKIM as the only passing leg.
- **Only one DMARC record.** If one already exists at `p=quarantine` or `p=reject`, never downgrade it; changing it is the domain owner's decision.
- Read the `rua` aggregate reports (a DMARC report tool turns the XML into a readable digest) before each step up. Every legitimate sender must pass first: CRM, billing, helpdesk, Google Workspace.
- `p=none` forever gives no spoofing protection. Move on once reports are clean.

### BIMI (optional)
Shows your logo in supporting inboxes. Needs DMARC at `p=quarantine` or `p=reject` (p=none is not enough), a strong sending reputation, an SVG logo, and usually a mark certificate (VMC, which needs a registered trademark, or CMC). Worth it only after enforcement is stable.

### Verify
```bash
dig TXT example.com +short                       # SPF
dig TXT <selector>._domainkey.example.com +short # DKIM
dig TXT _dmarc.example.com +short                # DMARC
```
No output means the record is missing. Then send a test to a Gmail account, open "Show original" and confirm `spf=pass`, `dkim=pass`, `dmarc=pass`. Keep DNS TTL low (300 s) while setting up, raise it (3600 s+) once stable, and allow time for propagation before "fixing" again.

## 3. One-click unsubscribe

Every marketing or bulk email carries both headers:
```
List-Unsubscribe: <https://example.com/unsubscribe?token=abc123>, <mailto:unsubscribe@example.com?subject=unsubscribe>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```
- The HTTPS endpoint accepts **POST** with no login or confirmation step and returns 200 or 202; a GET shows a normal unsubscribe page.
- The token identifies the recipient and list; sign it so it cannot be guessed or reused for someone else.
- Stop sending within 48 hours. Keep a visible unsubscribe link in the footer too; a preference centre is a nice extra, never a replacement.
- Most ESPs add the headers for broadcasts; check a received message to confirm. With a raw sending API you add them yourself ([sending-apis.md](sending-apis.md)).

## 4. Domains, subdomains and IPs

- **Send from your own domain**, never a free mailbox or the ESP's shared domain.
- **Separate streams by subdomain** so a marketing problem cannot block password resets: for example `t.example.com` (transactional) and `m.example.com` (marketing), or the ESP's stream feature (Postmark message streams). One source suggests separating once marketing passes about 40,000 a month; doing it from day one costs little.
- **Do not fragment** across many weak domains. One well-warmed marketing subdomain beats several occasional ones.
- **Never send cold email from the primary domain** or the marketing subdomain ([compliance-and-cold-email.md](compliance-and-cold-email.md)).
- **Shared vs dedicated IP:** shared pools suit most senders. A dedicated IP needs steady volume (one source says about 1 million a month or more) and its own warm-up; reverse DNS must resolve to your domain.
- **Brand tracked links** with your own domain (SendGrid "link branding", custom tracking domains elsewhere) so links do not point at a shared tracker domain.
- Gmail reputation follows the domain more than the IP and has a long memory (up to about 120 days).

## 5. Warm-up

New domains and IPs have no reputation. Ramp slowly and send to the most engaged people first (recent sign-ups, active users, welcome and transactional mail).

**New domain (Postmark and Resend schedules)**

| Day | Max per day | Max per hour |
|---|---|---|
| 1 | 150 | |
| 2 | 250 | |
| 3 | 400 | |
| 4 | 700 | 50 |
| 5 | 1,000 | 75 |
| 6 | 1,500 | 100 |
| 7 | 2,000 | 150 |

After day 7, at most double volume each week. **Existing domain moving to a new provider:** about 1,000 on day 1, 2,500 on day 2, 5,000 on days 3-4, 7,500 on days 5-6, 10,000 on day 7.

- Spread sends through the day; avoid hourly spikes.
- Pause and investigate if bounces pass 4% or complaints pass 0.08% during warm-up.
- SendGrid's automated IP warm-up for dedicated IPs runs a 41-day schedule; if the hourly cap is hit, mail is retried for up to 72 hours (check current docs).
- Providers forget reputation after about 30 days of silence: re-warm after a long pause.
- Do not use third-party "warm-up networks" that trade fake opens and replies between inboxes. They manufacture engagement signals, which providers treat as manipulation.

## 6. Thresholds and what to do

| Metric | Healthy | Warning | Stop and fix |
|---|---|---|---|
| Hard bounce rate (per send) | under 1% | 1-2% | over 2% (warning) / over 4% (critical) |
| Spam complaint rate | under 0.05% | 0.08-0.1% | 0.1% or more |
| Soft bounce rate | under 5% | 5-10% | over 10% |
| Unsubscribe rate | under 0.2% | 0.3-0.5% | over 0.5% |

Postmark is stricter on complaints (warning above 0.04%, stop above 0.08%).

**Complaint rate at or above 0.1%:** pause broad sends; mail only people who clicked in the last 30 days; check where the complainers came from (one form, one import, one partner); check that expectations at sign-up match what you send; make the unsubscribe more visible. Repair takes 2-4 weeks of clean sending.

**Bounces:**
- Hard bounce (address does not exist): suppress at once, never retry.
- Soft bounce (mailbox full, server busy): retry with backoff (about 1 h, 4 h, 24 h); suppress after 3-5 consecutive failures.
- Deferrals (provider says "later"): slow down; high Yahoo deferrals are normal while introducing new patterns.
- Low bounces do not mean safe: accounts get suspended for consent or engagement problems even at 0.1% bounces.

## 7. List hygiene

- Suppress hard bounces, complaints and unsubscribes immediately and permanently (keep them in a suppression list so they are never re-imported).
- Validate at collection (format, MX check, typo suggestions) rather than "cleaning" a bad list later.
- Engagement-based sending is the biggest single lever: see the tiers in [strategy-and-list-growth.md](strategy-and-list-growth.md). Sunset after 90-180 days without a click (Microsoft is sensitive to mail sent to people unengaged for over 6 months).
- Lists decay about 22-30% a year; a re-permission or sunset flow keeps up with that.
- Spam traps look like normal addresses. They come from bought, scraped, appended and very old lists. There is no safe way to "clean" a bought list.

## 8. Diagnose "going to spam"

Work in this order and fix the root cause, not the symptom:

1. **New domain or IP?** It is probably a warm-up problem; authentication alone will not fix it.
2. **Authentication:** SPF, DKIM, DMARC pass and align on a real received message.
3. **Unsubscribe headers** present and working.
4. **Reputation:** Google Postmaster Tools (domain reputation, spam rate; the only place Gmail complaint data shows), Microsoft SNDS and JMRP, your ESP's health score (SendGrid SEQ).
5. **Blocklists:** check the domain and IP (Spamhaus has high impact; SpamCop listings expire about 24 hours after the last trap hit; others need a delisting request). Fix the behaviour before asking for delisting; repeat requests without changes are ignored.
6. **Bounce logs:** read the SMTP responses for the receiver's stated reason.
7. **Sending pattern:** sudden spikes, a newly added old segment, a new import.
8. **Content last:** image-only emails, missing plain-text part, link shorteners, link domains that do not match the sender, spammy subject patterns ([campaigns-subject-lines-testing.md](campaigns-subject-lines-testing.md)).

Then test (seed or placement test, or real accounts at Gmail, Outlook and Yahoo) and monitor for 2-4 weeks. If no seed test is possible, say so instead of assuming inbox placement is fine.

**Diagnosis output**
```
Type: acute (sudden block or spike) | gradual (slow decline) | setup (new domain or program)
Root cause: [most likely, with evidence]
Immediate actions: 1. ... 2. ... 3. ...
Monitor: [metric, threshold, for how long]
```

## 9. AI-era notes

- Gmail's Gemini and Apple Intelligence summarise and re-rank from the opening live text; image-only or vague openings lose.
- Raw, unpersonalised AI copy at volume is filtered harder; use real data and specific content.
- Apple Mail Privacy Protection pre-loads images, so opens are inflated (SendGrid flags these as `sg_machine_open`). Do not use opens to define "engaged" or to judge deliverability.
- Agent-triggered flows need hard volume caps, engagement-tier targeting and the current complaint rate shown to the agent before it sends.

## Checklist

- [ ] One SPF record, under 10 lookups, ending `~all`
- [ ] DKIM 2048-bit, aligned with the From domain
- [ ] One DMARC record with `rua`, ramping from `p=none` to `quarantine` to `reject`
- [ ] `List-Unsubscribe` and `List-Unsubscribe-Post` headers on every bulk email; POST endpoint honoured within 48 hours
- [ ] Transactional and marketing separated by subdomain or stream
- [ ] New domain warmed with engaged contacts on the schedule above
- [ ] Hard bounces and complaints suppressed automatically; complaint rate under 0.1%
- [ ] Postmaster Tools (and SNDS for Outlook-heavy lists) connected and checked
