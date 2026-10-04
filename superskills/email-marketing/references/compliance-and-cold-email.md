# Compliance and cold email

> Distilled from: email-best-practices compliance and email-types references (resend/resend-skills, MIT), postmark-email-best-practices compliance reference (ActiveCampaign/postmark-skills, MIT), email-marketing-bible compliance and cold email sections (CosmoBlk/email-marketing-bible, MIT), cold-email and its follow-up-sequences, benchmarks and subject-lines references (coreyhaines31/marketingskills, MIT), loops-email-sending-best-practices (loops-so/skills, MIT).

Use for "is this email legal", "CAN-SPAM", "GDPR consent for email", "CASL", "do I need double opt-in", "unsubscribe requirements", "write a cold email", "B2B outreach email", "follow-up sequence for prospects".

**Not legal advice.** Laws, penalties and provider rules below are as of the sources (2025-2026). Check current official guidance for the countries you send to, and ask a lawyer when the stakes are real. When in doubt, follow the strictest rule that applies (usually GDPR).

## 1. The laws at a glance

| Law | Where | Consent for marketing | Must have | Unsubscribe | Penalty (approx.) |
|---|---|---|---|---|---|
| CAN-SPAM | US | Not required (opt-out model) | Accurate From/To/Reply-To, non-deceptive subject, physical postal address, clear opt-out | Honour within 10 business days; link must work 30 days after send | Over $50,000 per email (sources cite $51,744-$53,000) |
| GDPR | EU | Required: freely given, specific, informed, unambiguous; no pre-ticked boxes | Consent records; withdrawal as easy as giving it; access and erasure rights | Immediately | Up to 4% of global turnover or €20M |
| UK PECR + UK GDPR | UK | Required, with a "soft opt-in" for existing customers and similar products when an opt-out was offered at collection (check current ICO guidance) | As GDPR | Immediately | As GDPR |
| CASL | Canada | Express, or implied (purchase or business relationship within 2 years; inquiry within 6 months) | Sender identity and contact details valid for 60 days after sending; mailing address plus phone, email or web address | Works for 60 days after send; processed within 10 business days | Up to $10M CAD per violation |
| Spam Act 2003 | Australia | Required | Sender identification | Within 5 business days | Up to about $2.2M AUD per day (bible) |
| LGPD | Brazil | Explicit consent for marketing | Similar to GDPR | Promptly | Per LGPD |

**Plus mailbox-provider rules** (not law, but enforced by rejection): one-click unsubscribe (RFC 8058) honoured within 48 hours for bulk senders, SPF/DKIM/DMARC, complaint rate under 0.1% ([deliverability.md](deliverability.md)).

## 2. Transactional exemption

Transactional or relationship messages (receipts, password resets, account notices, shipping) are exempt from most marketing rules, including the unsubscribe requirement, **only while they are primarily transactional**. Adding a promotion can void the exemption. Keep the company name and address in them anyway. Details: [transactional-email.md](transactional-email.md).

## 3. Consent done right

- **What counts:** the person ticks an unchecked box, clicks a clearly labelled subscribe button, or completes a form whose purpose is plainly subscription. Tell them what they will get, how often, from whom, and how to leave.
- **What does not count:** pre-ticked boxes, opt-out-by-default, consent assumed from a purchase (outside soft opt-in or CASL implied consent), bought, rented or scraped lists, an address published online (except CASL's narrow "conspicuous publication" case for role-related messages with no "no marketing" notice).
- **Double opt-in** is the safe default for marketing lists and lead magnets ([strategy-and-list-growth.md](strategy-and-list-growth.md)).
- **Records:** address, date and time, method, exact wording or list agreed to, source page or form. CASL: keep consent records 3 years after consent expires. GDPR: keep personal data only as long as needed, and act on erasure requests (sources cite 30 days).
- **Consent is per channel.** Email consent does not cover SMS or WhatsApp, which need their own explicit opt-in (US SMS also needs prior express written consent, quiet hours 8 am-9 pm local, and carrier registration).
- **AI does not move liability.** You own every email an agent sends, including the footer it might delete while editing a template.

## 4. Every marketing email

- [ ] From name and address honestly identify the sender; headers accurate
- [ ] Subject matches the content (no fake `RE:`/`FWD:`, no false urgency)
- [ ] Visible unsubscribe link, no login needed, free; plus `List-Unsubscribe` and `List-Unsubscribe-Post` headers
- [ ] Physical postal address (CAN-SPAM; CASL needs contact details too)
- [ ] Sent only to contacts with a valid consent basis for this region and content
- [ ] Suppressions applied: unsubscribed, bounced, complained
- [ ] Unsubscribes processed immediately (the strictest rule wins; never rely on the 10-day allowance)
- [ ] Privacy policy linked at the point of collection: what you collect, how it is used, who it is shared with, rights, contact

**Pre-send compliance gate** (answer all six or do not send): (1) Which type: transactional, lifecycle, marketing, newsletter or cold? (2) Which regions are the recipients in? (3) What is the consent basis? (4) Unsubscribe and address present? (5) Suppressions applied? (6) Is every claim true? Any unclear answer: ask, or refuse.

## 5. Cold email: small, relevant, compliant

Cold email here means a **short, personal, one-to-one message to a business contact** with a real reason to write. It is not bulk outreach. This craft does not cover scraping contact data, buying lists, mass sending, inbox or domain rotation, warm-up networks or any trick to get past spam filters.

**Where it is allowed**
- US: allowed without prior consent if CAN-SPAM is followed (accurate identity, honest subject, postal address, working opt-out).
- UK and EU: B2B outreach to work addresses usually relies on legitimate interest, with an easy opt-out and do-not-contact requests honoured; rules differ by country and some require prior consent. Check current guidance. Record your legitimate-interest reasoning.
- Canada and Australia: consent is required (CASL implied consent covers narrow cases such as a role-related address conspicuously published without a "no marketing" note).
- Individuals' personal addresses: treat as consumer marketing; consent needed in most places.

**Who to write to**
- Only people you have a specific, current reason to contact (a trigger: new role, funding, hiring, a post, a problem you can see).
- Find them from the user's own network and public or consented sources. Research without scraping: `linkedin-automation` (`references/lead-research.md`).
- Keep each campaign small: 50 contacts or fewer per campaign got about 2.8x the reply rate in one large study, and 1-2 people per company beat 10+.

**Sending setup**
- From a real person's mailbox, never a no-reply.
- Not from the primary domain or the marketing subdomain: cold email that draws complaints must not damage product or marketing mail. Several ESPs (Loops, for one) forbid cold email on their platform; use a normal mailbox, sent by hand or at a low daily volume (the bible's upper bound is about 10-30 per mailbox per day).
- Authenticate it (SPF, DKIM, DMARC) like any other domain. Keep it honestly branded and linked to your real business.
- Plain text, no images, one link at most, no tracking pixels needed.

**Writing**
- 25-75 words is the sweet spot (under 75 words earned about 83% more replies in one source; another says 50-125). Read it aloud; write like a peer.
- Shape: observation or trigger → the problem it usually means → one proof point → one low-friction, interest-based ask ("Worth exploring?" rather than "30 minutes Tuesday?").
- Their world first: "you/your" outnumber "I/we". Personalisation must connect to the problem; if you can delete the opening line and the email still works, it was decoration.
- Subject: 2-4 words, lowercase, looks internal ("hiring ops", "q3 forecast"). No emoji, no first name, no fake `Re:`.
- Avoid AI tells: "I hope this email finds you well", "I came across your profile", "leverage", "synergy", contrast reveals, self-answered questions, em dashes.
- Every cold email ends with a plain opt-out line, for example: "If this isn't relevant, reply 'no' and I won't email again." Plus your name, company and postal address.

**Follow-ups**
- 3-5 emails in total, gaps growing: day 0, 3, 7-8, 14, 21-28.
- Each adds one new thing (a different angle, a case study, a useful resource) and stands alone. Never "just checking in" or "did you see my last email?".
- The last is a short breakup that leaves the door open. **Honour it**: no further contact. Any "no", unsubscribe or complaint stops the sequence at once and goes on a permanent do-not-contact list.
- By the 4th follow-up replies drop sharply and complaints triple, so stop at 4 follow-ups.

**Expected results:** reply rates average about 4-6% (good 5-10%); a positive reply rate of 3-5% of sends is a solid target. Bounces over 4% mean the list is bad: stop and fix the source.

## 6. Out of scope (refuse and explain)

- Buying, renting, scraping or "appending" email addresses
- Guessing or permutating addresses and verifying them by probing mail servers
- Inbox or domain rotation, lookalike domains, or warm-up networks to raise volume past filters
- Hiding identity, fake reply threads, misleading subjects
- Sending marketing to people who unsubscribed or never consented where consent is required

Offer the compliant route instead: a lead magnet and opt-in ([strategy-and-list-growth.md](strategy-and-list-growth.md)), a small hand-picked prospect list, or a warm introduction.

## Checklist

- [ ] Recipient regions known and the strictest applicable rule followed
- [ ] Consent basis recorded per contact; no pre-ticked boxes; double opt-in on marketing forms
- [ ] Unsubscribe link, one-click headers and postal address in every marketing email; unsubscribes processed immediately
- [ ] Transactional emails carry no promotions
- [ ] Cold email is one-to-one, short, relevant, from a real person, off the main domains, with an opt-out line
- [ ] Follow-ups capped at 4, breakup honoured, do-not-contact list kept
