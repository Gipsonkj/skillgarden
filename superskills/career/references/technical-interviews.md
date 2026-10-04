# Technical interviews: coding, system design, case, take-home and presentation rounds

> Distilled from: leetcode-teacher and its patterns reference (jamesrochabrun/skills, MIT), mock, prep and present commands of interview-coach (noamseg/interview-coach-skill, MIT), interview-system-designer competency matrices and loop planner (alirezarezvani/claude-skills, MIT), job-post-builder interview-guide notes on take-homes (anthropics/knowledge-work-plugins, Apache-2.0). Take-home practice in section 5 also draws on general hiring practice.

Technical rounds score how the candidate thinks as much as the answer. Be honest about the limit when coaching: you can judge structure, scoping, communication and obvious errors; for deep domain correctness ("is this architecture right for our scale?"), recommend a peer in the field as well.

## 1. Find out the format first

Ask the recruiter or the candidate:
1. Live coding, whiteboard or verbal walkthrough? Which language and editor; can code run?
2. System design: open-ended, or a deep dive on the candidate's own past system?
3. Take-home: time limit, deadline, what is reviewed, is there a follow-up discussion?
4. Mixed rounds: split between technical and behavioural, one interviewer or two?
5. AI-assistant policy for take-homes and live rounds.

Typical loops by level (from `scripts/interview-system-designer/interview_planner.py`): junior = screen, coding, behavioural; mid adds system design; senior adds leadership; staff swaps coding for architecture and technical strategy. Real loops vary; use this only as a starting guess.

## 2. Coding rounds

### The approach, out loud

1. **Clarify:** restate the problem; ask about input size, types, duplicates, empty input, expected output format.
2. **Examples:** work 1-2 small examples by hand, plus edge cases (empty, one item, all equal, negative, very large).
3. **Brute force first:** state it and its complexity in one sentence. It proves understanding and gives a fallback.
4. **Find the bottleneck and the pattern** (table below). Say which pattern and why.
5. **Plan, then code:** outline in comments or words; get the interviewer's nod; write clean code with clear names.
6. **Test:** walk the examples through the code line by line; fix bugs calmly.
7. **Complexity:** time and space, then "can we do better?" and the tradeoff.

Silence is the biggest avoidable failure: narrate decisions, assumptions and dead ends.

### Pattern map

| Signal in the problem | Pattern | Typical complexity |
|---|---|---|
| Pairs or triples in a sorted array | Two pointers | O(n) time, O(1) space |
| Best subarray or substring with a property | Sliding window | O(n) |
| Cycle, middle of a list | Fast and slow pointers | O(n), O(1) |
| Overlapping ranges, calendars | Merge intervals | O(n log n) |
| Sorted or rotated data, "first version where..." | Modified binary search | O(log n) |
| Top or bottom K, streaming ranks | Heap | O(n log k) |
| Merge K sorted lists | K-way merge (heap) | O(n log k) |
| Shortest path in unweighted graph, levels | BFS | O(V + E) |
| All paths, connected regions, cycle detection | DFS | O(V + E) |
| Dependencies, build order | Topological sort | O(V + E) |
| Grouping, "are these connected" | Union-find | Near O(1) amortised per op |
| All combinations or permutations | Backtracking | Exponential; prune early |
| Optimal value with overlapping subproblems | Dynamic programming (knapsack, LCS, Fibonacci-style) | Usually O(n x state) |
| Next greater or smaller element | Monotonic stack | O(n) |
| Prefix lookups, autocomplete | Trie | O(word length) per op |
| Counting, lookups, deduplication | Hash map or set | O(n) |

### Practice plan

| Level | Focus | Goal |
|---|---|---|
| 1 | Hash maps, simple two pointers, linear scans | Fluency in the interview language |
| 2 | Sliding window, fast and slow pointers, basic trees | Recognise patterns |
| 3 | BFS, DFS, binary search variants, heaps, basic DP | Core medium problems |
| 4 | Harder DP, graphs, backtracking, tries | Hard problems |
| 5 | Timed mixed sets, explaining aloud | Interview pace |

- Solve each pattern 5-10 times before moving on; redo misses a few days later.
- Write tests before code; keep a log of mistakes by type (off-by-one, missed edge case, wrong pattern).
- Practise in the language you'll interview in, on a plain editor without autocomplete if that's the format.
- Real product framing helps memory ("free meeting slots" = merge intervals), but the pattern is what transfers.

## 3. System design rounds

### A structure to narrate

1. **Requirements (5 min):** functional (what users do) and non-functional (latency, availability, consistency, durability, cost). Agree what's out of scope.
2. **Scale estimates:** users, requests per second at peak, data size per year, read/write ratio. Round numbers; show the arithmetic.
3. **API and data model:** main endpoints or events; core entities and access patterns; choose storage from the access pattern, not the brand.
4. **High-level design:** clients, gateway, services, storage, caches, queues. Draw it, then walk one request end to end.
5. **Deep dive** on the 1-2 hardest parts the interviewer cares about (hot keys, fan-out, ordering, consistency).
6. **Bottlenecks and failure modes:** what breaks at 10x, single points of failure, retries and idempotency, monitoring and alerts.
7. **Tradeoffs and evolution:** what was optimised and what was given up; what changes with more time or scale.

### What interviewers track

Scoping questions before solving; an outline before detail; reasoning narrated, not just conclusions; tradeoffs named unprompted; adapting calmly when a constraint changes; time spread across the problem (not 80% on one box); assumptions stated instead of bluffed.

### Level expectations (typical)

| Level | Expected depth |
|---|---|
| Junior | Component interactions, basic scaling ideas |
| Mid | Service and API design, data modelling |
| Senior | Distributed systems patterns, scalability and reliability, explicit tradeoffs |
| Staff+ | Cross-system architecture, long-term technical strategy, org impact |

**Mock protocol:** give an open problem; don't prompt for clarifying questions (note whether they ask); during the walkthrough, probe "why this over X?", "what breaks at 10x?", "this component is unavailable now, what changes?"; debrief on the tracking list above.

## 4. Case and product rounds

**Consulting-style case:** clarify the objective and constraints -> lay out a structure (issue tree, MECE buckets) -> state a hypothesis -> ask for the data you need -> do the maths out loud with round numbers -> synthesise a recommendation with risks and next steps. Lead with the answer at the end: "I'd recommend X because A and B; the main risk is C."

**Product sense:** clarify the goal and the product -> pick a user segment and say why -> list their problems and prioritise one -> generate several solutions, pick one with reasoning -> define success metrics and guardrails -> note risks.

**Analytical or metrics:** define the metric precisely (numerator, denominator, time window) -> segment before concluding -> separate correlation from cause -> say what experiment or data would settle it. For SQL or statistics prep, data-analysis's guides go deeper.

## 5. Take-home assignments

1. **Read twice and ask early:** unclear requirements, expected time, whether AI tools are allowed, what reviewers weigh. Asking is a positive signal.
2. **Respect the time box.** If they say 3-4 hours, deliver a focused 3-4 hour result and list what you'd do next. Over-building isn't the win it seems.
3. **Make it easy to review:** a README with setup in under 5 commands, assumptions, decisions and tradeoffs, what's missing, and how to run tests.
4. **Show engineering habits:** small meaningful commits, tests on the core logic, clear names, input validation, no secrets in the repo.
5. **Prepare the follow-up:** a 5-minute walkthrough, then extensions ("how would this handle 100x data?") and what you'd change.
6. **Your own work only,** within the stated AI policy. If the task looks like unpaid production work (their real backlog, many days of effort), it's fair to ask about scope.

For code quality, tests and review habits beyond interview scope, use coding-practices.

## 6. Presentation rounds

- Structure: situation, complication, resolution; or context, options, recommendation for business cases. Lead with the conclusion.
- Time: about 130-150 spoken words a minute; 1-2 minutes per content slide; keep 25-40% of the slot for questions. Running over is the most common failure.
- Slide titles state the takeaway ("Churn halved after onboarding change"), one point per slide.
- Q&A: 30-60 second answers; "I don't know, here's how I'd find out" beats a made-up answer.
- Rehearse with a timer at least twice. The deck itself: docs-office's deck-writing guide.

## 7. Checklist

- [ ] Format, language, tools and AI policy confirmed for each round
- [ ] Coding: clarify, examples, brute force, pattern, plan, code, test, complexity, all aloud
- [ ] System design: requirements and scale agreed before boxes; tradeoffs and failure modes named
- [ ] Case answers end with a recommendation, risks and next steps
- [ ] Take-home within the time box, with README, tests and listed assumptions
- [ ] Coaching limits stated where domain correctness needs a peer reviewer
