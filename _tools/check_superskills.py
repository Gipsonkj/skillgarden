"""Validate skillgarden-app/superskills/<id>/ folders against the build brief."""
import json, re, sys
from pathlib import Path
APP = Path(__file__).resolve().parent.parent  # the repo
SS = APP / "superskills"
NC = re.compile(r"onetake|lieflat|product-manager-skills|academic-research-skills", re.I)
CATALOG = json.loads((APP / "catalog" / "catalog.json").read_text())
URLS = {k["url"] for t in CATALOG["topics"] for k in t.get("skills", [])}
CRAFTS = {p.name for p in SS.iterdir() if (p / "SKILL.md").is_file()}
CROSS = re.compile(r"`([a-z0-9-]+)` → ((?:`[^`]+`(?:,\s*)?)+)")
def section(txt, name):
    m = re.search(rf"^## {re.escape(name)}.*?$(.*?)(?=^## |\Z)", txt, re.M | re.S)
    return m.group(1) if m else None
ok_all = True
for d in sorted(p for p in SS.iterdir() if p.is_dir()):
    probs = []
    sk = d / "SKILL.md"
    if not sk.is_file():
        print(f"{d.name}: (in progress, no SKILL.md)"); continue
    txt = sk.read_text()
    m = re.match(r"^---\n(.*?)\n---\n", txt, re.S)
    if not m: probs.append("no frontmatter")
    else:
        keys = re.findall(r"^([a-zA-Z_-]+):", m.group(1), re.M)
        if sorted(keys) != ["description", "name"]: probs.append(f"frontmatter keys {keys}")
        nm = re.search(r"^name:\s*(.+)$", m.group(1), re.M)
        if not nm or nm.group(1).strip().strip('"') != d.name: probs.append("name != folder")
        desc = m.group(1).split("description:", 1)[-1].strip()
        if len(desc) > 1024: probs.append(f"description {len(desc)} chars")
    lines = txt.count("\n")
    refs = sorted(str(p.relative_to(d)) for p in (d / "references").rglob("*.md")) if (d / "references").exists() else []
    for r in refs:
        if r not in txt: probs.append(f"unlinked {r}")
    # Router rework: plan step, hand-offs to other crafts, originals to go deeper into
    plan, other, deep = section(txt, "Plan the request"), section(txt, "Other crafts"), section(txt, "Go deeper")
    if plan is None or "skillgarden:superseed" not in plan: probs.append("no standard Plan the request section")
    if other is None or other.count("\n| ") < 4: probs.append("Other crafts needs 3+ rows")
    if deep is None or deep.count("\n| ") < 4: probs.append("Go deeper needs 3+ rows")
    for craft, xrefs in CROSS.findall(txt):
        if craft not in CRAFTS: probs.append(f"unknown craft {craft}"); continue
        for ref in re.findall(r"`([^`]+)`", xrefs):
            if not (SS / craft / ref.rstrip("/")).exists(): probs.append(f"missing {craft}/{ref}")
    for url in re.findall(r"\]\((https?://[^)\s]+)\)", deep or ""):
        if url not in URLS: probs.append(f"Go deeper link not in catalog: {url}")
    own = CROSS.sub("", txt.replace(deep or "\0", ""))
    for link in set(re.findall(r"((?:references|scripts|templates)/[\w./-]+)", own)):
        if not (d / link.rstrip(".")).exists(): probs.append(f"missing {link}")
    size = sum(p.stat().st_size for p in d.rglob("*") if p.is_file())
    if size > 2_000_000: probs.append(f"size {size/1e6:.1f}MB")
    for p in ("CREDITS.md", "topic.json"):
        if not (d / p).is_file(): probs.append(f"no {p}")
    try:
        t = json.loads((d / "topic.json").read_text())
        tests = t.get("tests", [])
        if len(tests) != 4 or len(t.get("searches", [])) < 4: probs.append("topic.json needs 4 tests and 4+ searches")
        elif not any(c != d.name and re.search(rf"\b{c}\b", tests[3].get("good", "")) for c in CRAFTS): probs.append("test t4 must use another craft")
    except Exception as e: probs.append(f"topic.json {e}")
    if (d / "CREDITS.md").is_file():
        used = "\n".join(l for l in (d / "CREDITS.md").read_text().split("Also see")[0].splitlines() if not re.search(r"nothing (was )?used|not used|excluded", l, re.I))
        if NC.search(used): probs.append("NC source in credits")
    ok_all &= not probs
    print(f"{d.name}: {lines} lines, {len(refs)} refs, {size/1e3:.0f}KB {'OK' if not probs else probs}")
sys.exit(0 if ok_all else 1)
