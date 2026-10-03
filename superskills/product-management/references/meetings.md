> Distilled from: meeting-minutes (github/awesome-copilot, MIT), notion-meeting-intelligence (openai/skills, MIT), stakeholder-update (anthropics/knowledge-work-plugins, Apache-2.0)

# Meetings: prep, agendas and minutes

## 1. Prep (before the meeting)

1. Confirm: objective, decisions needed, attendees and roles, date/time, duration, prior materials.
2. Gather context from connected tools (docs, wiki, tracker, prior notes): previous decisions, open action items, specs, OKRs. Link sources; never paste whole documents.
3. Pick the format:

| Meeting | Agenda shape |
|---|---|
| Status / update | Progress vs goal, metrics, risks, asks, next steps |
| Decision | Decision question, deadline, impact, options (pros, cons, cost, risk), recommendation, decision owner |
| Planning (sprint/project) | Goal, capacity, scope, dependencies, risks (see `references/sprint-planning.md`) |
| Retro | Goal recap, went well / didn't / confusing, root causes, 1–3 actions |
| 1:1 | Their topics first, wins, blockers, growth, feedback both ways, follow-ups |
| Brainstorm | Problem framing, constraints, diverge (silent writing first), cluster, pick next steps |
| Customer meeting | Account context, their goals, open issues, what we want to learn, commitments to avoid |

4. Build the agenda/pre-read: context in 2–3 sentences with links, each item with owner, timebox and expected output (inform / discuss / decide). Put decision items early, not in the last 5 minutes.
5. Research to enrich (benchmarks, market facts) only when it helps the decision; cite sources and keep fact separate from opinion.
6. Share the pre-read 24 h ahead for decision meetings.

## 2. Minutes (during / after)

Ask up to 3 clarifying questions if missing: title/date/time/organizer; whether there is an agenda, transcript or recording; who reviews the minutes. If there is no transcript, proceed, mark the source as "ad-hoc notes" and flag gaps.

**Structure** (decisions and actions near the top):

1. **Metadata** — title, date (YYYY-MM-DD), start/end or duration with time zone, organizer, location/link, minutes author, distribution list.
2. **Attendance** — present (name + role), absent, note-taker.
3. **Summary** — 1–3 sentences: objective and outcome.
4. **Decisions** — statement; who decided; 1–2 sentence rationale; effective date.
5. **Action items** — ID, action, **owner**, **due date** (or clear timeframe), acceptance criteria, linked ticket.
6. **Notes by agenda item** — key points (optional timestamps), open questions with owner.
7. **Parking lot** — item, why parked, next step/owner.
8. **Risks / blockers** — description, impact, owner.
9. **Next meeting** — date, objectives.
10. **References** — agenda, slides, recording, tickets, or "None".
11. **Version** — version, last updated (ISO 8601), changes.

**Short template (meetings ≤ 30 min):**
```
Title / Date / Organizer / Present
Summary:
Decisions: D1 — who — effective
Actions: A1 — action — owner — due — done when
Next steps / next meeting:
```

**Rules:**
- Every action has an owner and a due date. If one was implied, write it and mark "(implied — confirm)".
- Unknowns are `TBD` with how to get them; never guess names, dates or numbers.
- Facts only; opinions labelled "Opinion" or left out.
- Length: under 1 page for ≤ 30 min meetings, under 2 pages for ~60 min.
- No unnecessary personal data from the discussion.
- Send the draft to the organizer for a check within 24 h when it records significant decisions.
- Offer to create the action items as tickets in the tracker after the user approves the list.

## 3. Facilitation quick rules

- Start with the decision or outcome the meeting must produce.
- Timebox every item; park tangents visibly.
- End with read-back of decisions and actions (owner + date) before people leave.
- Cancel recurring meetings that have nothing to decide or sync.
