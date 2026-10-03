# Profile optimisation

> Distilled from: linkedin-profile (alirezarezvani/claude-skills, MIT), linkedin-profile-optimizer (paramchoudhary/resumeskills, MIT), linkedin-marketing profile-optimizer references (sergebulaev/linkedin-skills, MIT), linkedin-posts SEO/GEO section (kostja94/marketing-skills, MIT).

The user describes or pastes their own profile. **Never fetch or scrape a profile**, theirs or anyone else's (ToS: [tos-and-safe-automation.md](tos-and-safe-automation.md)). If they want their data in bulk, they can use Settings, then Data privacy, then "Get a copy of your data".

## Three readers

| Reader | Arrives from | Time | Sees |
|---|---|---|---|
| Scanner | Your comment on someone's post | ~3 s | Photo, name, headline |
| Evaluator | Search, referral, your post | ~40 s | Headline, visible part of About, Featured, current role |
| Decider | Already interested | Minutes | Everything |

Most traffic comes from scanners. Most conversions come from deciders. When time is short, work in this order: **headline, photo, first 2 sentences of About, Featured, current role, everything else.**

## Audit first

Have the user fill in [../templates/linkedin-profile/profile_worksheet.md](../templates/linkedin-profile/profile_worksheet.md) (its script paths point to the original plugin; use the commands below), then fix gaps by **points per hour**. Featured, "Open to", custom URL and skills take minutes and recover real points.

## Headline (220 characters; first ~60 show in search and invitations)

The only string that travels with every comment, search result and invitation. Five jobs, 20 points each:
1. **Audience**: "for Series A SaaS founders".
2. **Outcome**: what changes because of you.
3. **One proof**: a number, `ex-Company`, a credential. It must be true.
4. **Searchable**: keep one standard role or skill term recruiters search for.
5. **Readable**: 3 segments at most, 1 emoji at most, no "passionate", "results-driven", "thought leader".

Patterns:
```
[Role people search] for [audience] | [proof] | [your line]
I help [audience] [outcome] without [the cost they expect]
[Current role] moving into [destination] · [proof of the move]
```
Put the strongest segment first. For career changes, state the destination, not just where they've been.

```bash
python3 scripts/linkedin-profile/headline_scorer.py --headline "..." --output human
```
Exit 0 SHIP (75 or more) / 2 SHARPEN / 3 REWRITE. Two or three passes is normal. The final test is whether they'd say it out loud to a peer, and whether someone in their audience can repeat back what they do.

## About (2,600 cap; fold at ~265-300 characters)

Whatever sits above the fold is the whole section for most readers. Five parts, in first person:
1. **Tension**: the problem the audience recognises, in their words.
2. **Who it's for**: specific enough to exclude someone.
3. **Proof**: 2-3 real results with numbers.
4. **How you work**: the part that's yours, not your job title's.
5. **CTA**: who should reach out and what they get.

Work keywords into real sentences, not a keyword list. Answer-first paragraphs of 40-60 words also get quoted by search engines and AI answer tools (public profile and About are indexed; feed posts are behind login).

```bash
python3 scripts/linkedin-profile/about_section_builder.py --print-schema   # JSON shape
python3 scripts/linkedin-profile/about_section_builder.py --input about.json --output human
```
It refuses a fold that cuts mid-sentence, a fold with no audience or proof, a missing CTA, and anything over 2,600 characters.

## Other sections

| Section | Rule |
|---|---|
| Photo | Face fills about 60% of the frame, well lit, recognisable at 48 px |
| Banner 1584 x 396 | Say what you do or show one artefact. Keep text in the right two-thirds (the photo covers the lower left). Check on a phone |
| Experience | Outcomes, not duties: "Cut p99 checkout latency 1.9 s to 340 ms" rather than "Responsible for backend". 2-5 bullets for relevant roles, one line each for older ones |
| Featured | One artefact a stranger can judge in 60 s (talk, repo, teardown, best post). Refresh quarterly |
| Skills | Up to 50. List skills you'd accept an interview on. Pin the top 3 |
| Recommendations | Ask for 2 specific ones: name the project and the angle, and offer a first draft for them to edit |
| Custom URL, contact, "Open to" / Services | Two-minute fixes. Leaving them empty signals nobody maintains the profile |
| Open to Work | "Recruiters only" is the discreet option. Keep "open to work" out of the headline |

## Output format

```
## Assessment: completeness X/100, top 3 issues
## Headline: current -> proposed (score)
## About: full text, fold marked
## Experience: per role, add / change
## Featured, Skills, Recommendations: concrete actions
## First-hour plan: 3-5 fixes ranked by points per hour
```

## Rules

- Never invent a credential, metric, title or employer. If there's no proof, make the claim qualitative or leave it out.
- First person throughout. Third person reads like a press release.
- Keep the profile consistent with the resume on titles, dates and core metrics. LinkedIn can be longer and more conversational.
- Benchmarks such as "21x more views with a photo" are vendor claims (🔴/🟡). Don't quote them as fact.
