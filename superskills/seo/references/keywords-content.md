> Distilled from: keyword-research (aaron-he-zhu/aaron-marketing-skills, Apache-2.0), content-writer (aaron-he-zhu/aaron-marketing-skills, Apache-2.0), keyword-research (every-app/open-seo, MIT), seo-audit (anthropics/knowledge-work-plugins, Apache-2.0), seo (AgriciDaniel/claude-seo, MIT), seo-aeo-best-practices (sanity-io/agent-toolkit, MIT), seo (affaan-m/ECC, MIT)

# Keyword research, on-page writing and content refresh

## Keyword research in 8 steps

1. **Scope**: product, audience, business goal, market and language, and the site's current authority. A new site cannot win the same terms as a 10-year-old domain.
2. **Seed**: write down terms for the core offer, the problem it solves, the solution category, the audience, and the industry jargon.
3. **Expand**: add modifiers ("best", "for [audience]", "vs", "template", "near me", "how to", "pricing", "alternative"), autocomplete and People Also Ask questions, and your own Search Console queries.
4. **Classify intent**, then check it against the live SERP. The SERP is the ground truth.
5. **Score** each term (see below).
6. **Flag AI-answer queries**: questions, definitions, comparisons, lists and how-tos. These feed [ai-search.md](ai-search.md).
7. **Cluster** terms into pillar and cluster hubs. One URL targets one cluster.
8. **Deliver** an executive summary, quick wins, growth bets, AI-answer opportunities, clusters and a publishing calendar.

### Intent

| Intent | Signal words | Format that wins | Funnel stage |
|---|---|---|---|
| Informational | what, how, why, guide, examples, checklist | explainer, tutorial, list | top (TOFU) |
| Navigational | brand, login, docs, pricing, support | homepage, docs, product page | retention |
| Commercial | best, top, vs, review, alternative, worth it | comparison, roundup, buying guide | middle and bottom (MOFU, BOFU) |
| Transactional | buy, price, coupon, trial, demo, hire, near me | pricing, landing, local service page | bottom (BOFU) |

Common traps:
- "best CRM software" is commercial, not informational.
- "how much does X cost" is commercial.
- "SEO services" is local and transactional.

For mixed intent, answer the dominant question first and bridge to the second.

### Scoring

You can use either method.
- **Opportunity** = (Volume × Intent value) ÷ Difficulty, with intent values informational 1, navigational 1, commercial 2, transactional 3.
- **Weighted priority** (score each factor 1–5):

  | Factor | Weight |
  |---|---|
  | Business relevance | 30% |
  | Difficulty (inverted) | 25% |
  | Volume | 20% |
  | Intent | 15% |
  | Trend | 10% |

  Bands: 4.0–5.0 means target now, 3.0–3.9 next sprint, 2.0–2.9 later, below 2 monitor.

When revenue is the goal, work bottom-of-funnel terms first: "pricing", "best", "vs", "alternative", "hire", "services".

### Evidence labels

Label every metric as one of: **Measured** (a tool export or Search Console), **User-provided**, **Calculated**, **Estimated**, **Proxy**, or **Unknown**. Also keep the source, the market and the date.
- Volume and difficulty from any tool are estimates, and different tools disagree by 2–5×.
- Wikipedia pageviews or Google Trends show attention, not search volume. Use them to compare and time topics, never as a volume number.
- If a decision-critical value is Unknown, mark the score "not scored" instead of inventing it.

### Clusters

- A pillar is viable when it has 8–12 real subtopics, combined cluster volume of about 5,000 or more a month (or strategic importance), and you can add original expertise or data.
- Build order:
  1. the pillar;
  2. 3–4 of the easiest cluster pages;
  3. the highest-volume pages;
  4. the niche pages;
  5. then refresh the pillar with links to them.
- Links: every cluster page links to the pillar; the pillar links to every core cluster page; each cluster page links to 2–3 siblings with descriptive anchors.
- Keep a keyword-to-URL map. Two pages targeting the same cluster is cannibalisation. Merge them, or split them by intent.

### Seasonal timing

Publish 6–8 weeks before the peak. Plan 3–4 months ahead for calendar events such as Black Friday or tax season.

## Writing a page that ranks

### Brief before draft

For each page, decide:
- the target query and its intent;
- the format the top 10 results use (list, guide, tool, comparison);
- the questions those results answer;
- what you can add that they don't: data, a worked example, first-hand testing, a template, a calculator;
- the word count of the top 3, as a range rather than a target.

### Placement

- **Primary term**: in the title, the H1, the first 100 words, at least one H2 and the conclusion. Use synonyms elsewhere and never stuff it.
- **Title tag**: 50–60 characters, with the primary term near the start and the brand at the end if there's room. Write for the click. Numbers, the year (on time-sensitive topics) and a specific benefit raise CTR.
- **Meta description**: 120–160 characters. Say what the reader gets and include a reason to click. Google rewrites many descriptions, but a good one still wins on the queries it matches.
- **Headings**: H2s phrased the way people ask ("How long does X take?") so they can stand alone as answers. Keep a logical H2 → H3 order.
- **Opening**: answer the query in the first 40–60 words, then expand.
- **Links**: 2–5 internal links to related pages with descriptive anchors, and 2–3 external links to primary sources. Aim for at least 1 citation per 500 words. Mark any unsourced statistic `[needs source]` rather than inventing one.
- **Media**: one meaningful image or diagram per major section, with descriptive alt text and compressed files.
- **FAQ block**: 3–6 real questions with 40–60 word answers. Add it for readers and AI answers. FAQ rich results are gone (see [schema.md](schema.md)).

### E-E-A-T on the page

Trust is the core; experience, expertise and authority support it.
- **Who** wrote it: a named author with a bio, credentials, a profile page and `Person` schema.
- **How** it was made: say whether you tested, measured or interviewed, and how.
- **Why** it exists: to help the reader, not to fill a keyword slot.
- YMYL topics (health, money, legal, safety, and now civic topics such as elections) need credentialed authors or reviewers and visible sources.
- Show the published and updated dates, and only change the updated date when the content really changed.

Spam policies to stay clear of:
- **Scaled content abuse**: many low-value pages made to rank, by AI or by people.
- **Site reputation abuse**: third-party content parked on a strong domain.
- **Expired-domain abuse**: buying an old domain to host unrelated content.

## Content decay and refresh

### Spotting decay

- Clicks down more than 30% against the same period last year or a 3-month baseline.
- Position slipping 3 or more places on the main query.
- CTR more than 30% below the expected CTR for its position:

  | Position | Expected CTR |
  |---|---|
  | 1 | 25–35% |
  | 2 | 12–18% |
  | 3 | 8–12% |
  | 4–5 | 5–8% |
  | 6–10 | 2–5% |

- Outdated facts, years, prices, screenshots or product names.

### Refresh or rewrite

| Situation | Action |
|---|---|
| Intent unchanged, facts dated | refresh: update the facts, add missing sections and new examples, and add internal links from newer posts |
| The SERP format changed (for example, from guide to tool) | rewrite to the new format at the same URL |
| More than 50% of the content would change | rewrite at the same URL |
| Two pages compete for the same query | consolidate: 301 the weaker page into the stronger one and merge the best parts |
| No traffic, no links, no business value | retire: 301 to the closest page, or 410 if nothing is relevant; noindex if users still need it |

### Dates when republishing

| How much is new | What to do with the date |
|---|---|
| 50% or more | Update the published date |
| 20–50% | Show "Last updated" with the new date |
| Under 20% | Keep the original date |

Changing the date without changing the content is a trust problem and can backfire.

### Measuring a refresh

Request indexing, then read the results at 7, 14, 28 and 56 days. Compare clicks, impressions and average position with the baseline from the same weekdays. One read at 7 days is noise.
