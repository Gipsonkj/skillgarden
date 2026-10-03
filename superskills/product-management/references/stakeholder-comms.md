> Distilled from: stakeholder-update (anthropics/knowledge-work-plugins, Apache-2.0), roadmap-update (anthropics/knowledge-work-plugins, Apache-2.0), product-manager-toolkit (alirezarezvani/claude-skills, MIT)

# Stakeholder updates, status, risks and decision records

## 1. Pin down type and audience

| Type | Cadence | Focus |
|---|---|---|
| Weekly | Weekly | Progress, blockers, next steps |
| Monthly | Monthly | Trends, milestones, strategic fit |
| Launch | Once | What shipped, why it matters, availability, limits, how to give feedback |
| Ad-hoc | As needed | Escalation, pivot, major decision |

| Audience | Wants | Length |
|---|---|---|
| Executives | Conclusion, status, risks they can help with, decisions they must make | ≤ 200–300 words |
| Board | Metrics, strategy, risk; very concise | ≤ 1 page |
| Engineering | Priorities, technical context, blockers, decisions affecting their work, links | As long as needed, skimmable |
| Cross-functional (design, sales, support, marketing) | What's coming that affects them, what you need from them by when | Short |
| Customers | What they can now do, what's coming (no hard dates), known issues with workarounds | Short, zero jargon |

If tools are connected (tracker, chat, meeting notes, docs), pull completed items, at-risk items, decisions and blockers from them. Otherwise ask for: accomplishments since last update, blockers/risks, decisions made or needed, what's next.

## 2. Templates

**Executive**
```
Status: Green | Yellow | Red
TL;DR: <the one thing to know>
Progress:
- <outcome achieved, tied to goal/OKR, with metric>
Risks:
- <risk>: <mitigation>. <ask, if any>
Decisions needed:
- <decision>: <options + recommendation>. Need by <date>.
Next milestones:
- <milestone> — <date>
```

**Engineering**
```
Shipped: <item> — <PR/ticket link>. <impact>
In progress: <item> — <owner>, <expected date>, <blocker>
Decisions: made — <decision + rationale + ADR link>; needed — <context, options, recommendation>
Priority changes: <what and why>
Coming up: <items and why they're next>
```

**Cross-functional**
```
What's coming: <launch> — <date>. What it means for your team.
What we need from you: <ask> — by <date>.
Decisions made: <decision> — how it affects you.
Open for input: <topic> — how to give it.
```

**Customer**
```
What's new: <feature> — <benefit in their words>. <how to use / link>
Coming soon: <feature> — <"this quarter" / "later this year">
Known issues: <issue> — <status>, <workaround>
Feedback: <channel>
```

## 3. Rules that make updates work

1. Lead with the conclusion; bad news first, never buried under good news.
2. Status colour is your honest assessment:
   - **Green**: on plan, no significant risk. Not a default.
   - **Yellow**: risk materialised or slipping; mitigation under way; outcome uncertain. Move to Yellow at the first sign, not when sure.
   - **Red**: will miss commitments without intervention (scope cut, people, date). Use when you need help.
   - Note why the status changed: "Moved to Yellow because vendor API slipped 2 weeks."
   - Back to Green only when the risk is resolved, not paused.
3. Asks are specific: "Decision on pricing tier by Friday 14 Nov", never "support needed".
4. Execs: outcomes and goals, not activities ("shipped X, moved Y by Z%", not "held 14 stand-ups").
5. Only list risks you want help with in exec updates; manage the rest yourself.
6. Engineers: link every ticket/PR; explain why priorities changed.
7. Customers: no ticket numbers, no internal code names, no dates you might miss.

## 4. Risk communication (ROAM)

Each risk ends in one state:
- **Resolved** — no longer a concern; say how.
- **Owned** — someone manages it; name owner + plan.
- **Accepted** — known, proceeding without mitigation; record the rationale.
- **Mitigated** — actions reduced it to acceptable; say what was done.

Write each risk as: "There is a risk that **[thing]** because **[reason]**. If it happens, **[impact]**. Likelihood **[likely/possible/unlikely]** because **[evidence]**. We are **[mitigation]**. We need **[specific help]**." A risk raised early is a planning input; raised late, it is a fire drill.

## 5. Decision records (ADR / decision log)

Write one for strategic product choices, significant technical or vendor choices, contested decisions, and decisions that constrain future options. Write it when the decision is made, keep it to one page.

```markdown
# <Decision title>
Status: Proposed | Accepted | Deprecated | Superseded by <link>
Date / Deciders: <date> / <who decided; who was consulted>
## Context
<situation and forces at play>
## Decision
<what we decided, stated directly>
## Consequences
<positive; negative/trade-offs accepted; what this enables or prevents>
## Alternatives considered
<option — why rejected>
```

Wrong-in-hindsight decisions stay; mark them superseded and link the new one.

## 6. Delivery

Offer channel formatting (email, chat post, doc, slides). Draft messages; send only after the user approves the final text.
