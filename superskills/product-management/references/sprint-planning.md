> Distilled from: sprint-planning (anthropics/knowledge-work-plugins, Apache-2.0), stakeholder-update (anthropics/knowledge-work-plugins, Apache-2.0), roadmap-update (anthropics/knowledge-work-plugins, Apache-2.0), linear (openai/skills, Apache-2.0), jira-expert (alirezarezvani/claude-skills, MIT)

# Sprint planning and team rituals

## 1. Inputs to collect

- Team members and availability (PTO, holidays, on-call, interviews, recurring meetings)
- Sprint length (days)
- Prioritized backlog (from tracker, paste, or description) with estimates
- Carryover from last sprint and why it carried over
- Cross-team dependencies and their status
- Last 3 sprints' completed points (velocity), if available

## 2. Capacity

1. Available days per person = sprint working days − PTO − holidays − on-call days.
2. Focus factor: planned work usually gets 60–70% of a day after meetings and interrupts.
3. Capacity = Σ available days × focus factor, or in points: average velocity of the last 3 sprints × (available days ÷ normal days).
4. **Load to 70–80% of capacity.** The rest absorbs interrupts and estimation error.

## 3. Scope

- **One sprint goal**, one sentence, outcome-shaped ("Customers can pay invoices by card in production"). If you need "and" twice, the sprint is unfocused.
- P0 = needed for the goal; P1 = should ship; P2 = stretch, first to cut.
- Every item has an owner, an estimate and acceptance criteria. Items over ~8 points or with unclear criteria do not enter the sprint; split or refine first.
- Carryover is re-estimated and its cause named before re-committing.
- Flag items blocked by other teams; do not commit them as P0 unless the dependency is confirmed.

## 4. Sprint plan template

```markdown
## Sprint plan: <name>
**Dates:** <start> – <end> | **Team:** N engineers
**Sprint goal:** <one sentence>

### Capacity
| Person | Available days | Points | Notes |
| ... | 8 of 10 | 8 | 2 days PTO |
| **Total** | **x** | **y** | |

### Backlog
| Priority | Item | Estimate | Owner | Dependencies |
| P0 | ... | 5 | ... | None |
| P1 | ... | 3 | ... | Blocked by API-12 |
| P2 (stretch) | ... | 2 | ... | None |

**Planned load:** y points of z capacity (≈ 75%)

### Risks
| Risk | Impact | Mitigation |

### Definition of done
- [ ] Code reviewed and merged
- [ ] Tests passing (incl. acceptance criteria)
- [ ] Docs updated where behaviour changed
- [ ] Product sign-off / demoable

### Key dates
Start, mid-sprint check, demo, retro
```

## 5. Rituals

**Planning meeting.** Come with a proposed priority order; review last sprint (shipped / carried / cut), confirm capacity, commit, flag dependencies. Push back on overcommitment.

**Stand-up (≤ 15 min).** Done since last, doing next, blocked by. Blockers are the point; take discussions offline. Skip it when there is nothing to sync.

**Mid-sprint check.** Is the goal still reachable? Cut P2 early rather than late.

**Demo / stakeholder review.** Remind of the goal, show the real product (not slides), share early data, ask focused questions ("what would stop you using X?"), state what's next.

**Retro.** Set the stage (safety, goal), gather what went well / not well / confusing, find root causes, pick **1–3** actions with owners, close. Check last retro's actions first; if they are never followed up, people stop engaging. Focus on systems, not individuals.

## 6. Tracker hooks

- Jira: sprint content `sprint in openSprints() AND project = KEY`, spillover and velocity queries in `references/jira-confluence.md`. Sprint creation is a UI/REST action, not usually available through the Atlassian MCP.
- Linear: cycles are sprints; list cycles and assign issues (see `references/linear.md`).
- Azure DevOps Boards: iterations are sprints. With the official MCP (setup in `references/stories-and-tickets.md` §5), `work` → `list_team_iterations` finds the sprint, `get_team_capacity` reads the team's capacity for it, and `wit_work_item` → `list_for_iteration` lists what is in it. WIQL can filter with `@CurrentIteration` for a given team.
- Reads first, then writes; show the plan before creating or moving issues.
