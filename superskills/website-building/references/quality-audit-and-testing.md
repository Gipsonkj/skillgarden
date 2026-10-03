> Distilled from: web-quality-audit (addyosmani/web-quality-skills, MIT), webapp-testing (anthropics/skills, Apache-2.0), audit-website (squirrelscan/skills, MIT), web-perf (cloudflare/skills, Apache-2.0)

# Quality audit, accessibility and browser testing

A site is done when it was looked at in a real browser, not when it compiled. Keep measured findings separate from hypotheses you only saw in code.

## 1. Audit flow

1. Fix the target: which URLs, which states and journeys (logged in? cart filled?), mobile and desktop.
2. Collect a live baseline before searching the codebase.
3. Use the runtime failures to decide which source files to open.
4. Rank by user impact and confidence; fix.
5. Re-run the same checks and the affected flows. Report what is verified and what still needs field data or a human.

| Need | Preferred | Fallback |
|---|---|---|
| Performance | DevTools trace (`performance-cwv.md`) | Lighthouse CLI / PageSpeed Insights |
| Accessibility, SEO, best practices, agentic browsing | Chrome DevTools MCP `lighthouse_audit` (excludes performance; navigation mode reloads, snapshot mode keeps state) | `npx lighthouse <url> --only-categories=accessibility,seo,best-practices` |
| Rendered semantics | `take_snapshot` + exercising the UI | Playwright, manual testing |
| Static smoke test of HTML files | `bash scripts/web-quality-audit/analyze.sh <file-or-dir>` (read-only, needs `jq`, JSON on stdout) | Read the source |
| Whole-site crawl | squirrelscan (section 5) | Screaming Frog export from the user |

A Lighthouse score is a subset of checks, not proof of quality.

## 2. Severity

| Level | Examples | Action |
|---|---|---|
| Critical | Security hole, page or core flow broken | Fix now |
| High | CWV failing, major accessibility barrier (no keyboard access, unlabelled form) | Fix before launch |
| Medium | Performance opportunity, SEO gaps | This sprint |
| Low | Minor polish | When convenient |

## 3. Accessibility floor (WCAG 2.2 AA)

- Every `<img>` has meaningful `alt`; decorative ones `alt=""`. Video has captions.
- Contrast: body text 4.5:1, large text 3:1, UI controls and focus rings 3:1. Never colour alone to convey state.
- Everything works by keyboard, in a sensible order, with a visible `:focus-visible` style and no traps. A "Skip to main content" link on pages with long navigation.
- `<html lang>`; one landmark structure (`header`, `nav`, `main`, `footer`); headings in order.
- Every input has a visible `<label>`; errors are text, tied to the field (`aria-describedby`), and announced.
- Native elements first (`<button>`, `<a href>`, `<dialog>`, `<details>`); ARIA only where no native element fits, and roles must match behaviour. No `div onClick`.
- Tap targets ≥ 44x44 CSS px (48 for SEO tooling). No auto-advancing carousels without pause. Respect `prefers-reduced-motion`.
- Never `maximum-scale=1` or `user-scalable=no`.

Best practices: HTTPS everywhere, no mixed content, `<!DOCTYPE html>`, `<meta charset="utf-8">` first in head, clean console, no deprecated APIs (`document.write`, sync XHR), no public source maps in production, a CSP where feasible, no intrusive interstitials.

## 4. Browser testing with Playwright

Use Python Playwright scripts. For a dev server that is not yet running, let the helper own its lifecycle:

```bash
python3 scripts/webapp-testing/with_server.py --server "npm run dev" --port 5173 -- python3 check_home.py
# several servers: repeat --server/--port pairs in matching order; --timeout 30 per server
```

Run it with `--help` first; treat it as a black box. The test script contains only browser logic:

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    logs = []
    page.on("console", lambda m: logs.append(f"{m.type}: {m.text}"))
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")   # before inspecting a JS app
    page.screenshot(path="shots/home-390.png", full_page=True)
    page.get_by_role("button", name="Book a table").click()
    page.get_by_label("Email").fill("test@example.com")
    assert page.get_by_text("Thanks").is_visible()
    print("\n".join(l for l in logs if l.startswith("error")))
    browser.close()
```

- Reconnaissance first: screenshot or `page.content()` after `networkidle`, find real selectors, then act. Prefer role, label and text locators over CSS chains.
- Static HTML can be opened with a `file://` URL, but anything that fetches (video, JSON, models) must be served over HTTP.
- Check at 390, 768 and 1440 widths; capture console errors and failed requests; test the empty, error and loading states, not only the happy path.
- For scroll-driven pages use `node scripts/auteur/shoot.mjs` (see `motion-and-scroll.md`).

## 5. Whole-site audit and fix loop (squirrelscan)

Needs the `squirrel` CLI (installing it is the user's call; check `squirrel --version`).

```bash
squirrel audit https://example.com --format llm          # quick pass, ~25 pages
squirrel audit https://example.com -C surface --format llm   # one page per URL pattern, ~100
squirrel audit https://example.com -C full --format llm      # sign-off crawl, ~500
squirrel report <audit-id> --format llm                  # re-render cached audit
squirrel report --diff <baseline-id> --format llm        # before/after
```

Loop: present score and top issues → propose fixes and confirm with the user → map each finding to its template, component or content file → fix in batches (errors first, then high-rank warnings) → rebuild and run existing checks → re-audit with `--refresh` → repeat. Broken links and "should this go?" items are the user's decision: flag, don't guess. Prefer auditing the live site; apply fixes to local code either way.

Score targets: < 50 → 75+; 50-70 → 85+; 70-85 → 90+; > 85 → 95+. Sign off on a `-C full` crawl.

## 6. Report format

```markdown
## Evidence
| Signal | Scope / conditions | Result | Source |
## Critical (n)
- [Category] Issue. File: path:line
  - Impact / Evidence (measured | observed | code hypothesis) / Fix
## High (n) ... Medium ... Low
## Verification
- Re-run under same conditions: ...
- Manual checks done: keyboard pass, screen-reader spot check, real phone?
- Still pending: field data, search recrawl
```

## Pre-launch checklist

- [ ] No console errors on any page in the main journeys
- [ ] Lighthouse accessibility/SEO/best practices reviewed, real failures fixed
- [ ] Keyboard-only pass through nav, forms and dialogs
- [ ] Screenshots at 390 / 768 / 1440 inspected, no overflow or overlap
- [ ] Forms submit somewhere real and show success and error states
- [ ] 404 page, favicon, OG image, `robots.txt`, sitemap present
