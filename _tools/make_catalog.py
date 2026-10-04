"""Write skillgarden-app/catalog/catalog.json: every topic, its super skill and its ranked sub-skills."""
import json, os, re, glob
from pathlib import Path
APP = Path(__file__).resolve().parent.parent  # the repo
ROOT = Path(os.environ.get("SKILLGARDEN_LIBRARY", APP.parent)).resolve()  # library: skills/
import importlib.util
spec = importlib.util.spec_from_file_location("b", APP / "_tools" / "build.py"); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
topics = []
slugs = [s for s in b.ORDER if (APP / "_research" / f"{s}.json").exists()]
for i, slug in enumerate(slugs, 1):
    t = json.load(open(APP / "_research" / f"{slug}.json"))
    folder = f"{i:02d}_{b.safe(t['topic'])}"
    sid = slug.replace("_", "-")
    sd = APP / "superskills" / sid
    meta = json.loads((sd / "topic.json").read_text()) if (sd / "topic.json").exists() else {}
    desc = ""
    if (sd / "SKILL.md").exists():
        m = re.search(r"^description:\s*(.+?)\n(?=\w+:|---)", (sd / "SKILL.md").read_text(), re.S | re.M)
        desc = m.group(1).strip().strip('"') if m else ""
    refs = sorted(str(p.relative_to(sd)) for p in sd.glob("references/*.md")) if sd.exists() else []
    skills = []
    for j, s in enumerate(sorted(t["skills"], key=lambda s: s.get("rank", 999)), 1):
        local = ROOT / "skills" / folder / f"{j:02d}_{b.safe(s['name'])}"
        nc = "NON-COMMERCIAL" in (s.get("notes") or "")
        if s.get("license_ok") and not nc and "link-only" in (s.get("notes") or ""):
            s = s | {"notes": re.sub(r"\s*-?>\s*link-only\.?", ". The author states the license in the README or SKILL.md, which this library accepts.", s["notes"])}
        skills.append({k: s.get(k) for k in ("name", "purpose", "how_to_use", "url", "repo", "stars", "license", "evidence", "notes")} | {
            "rank": j, "trending": bool(s.get("trending")), "nonCommercial": nc,
            "redistributable": bool(s.get("license_ok")) and not nc,
            "local": str(local.relative_to(ROOT)) if s.get("license_ok") and not nc and (local / "SKILL.md").exists() else None})
    topics.append({"id": sid, "order": i, "name": meta.get("name") or t["topic"], "blurb": meta.get("blurb", ""), "hue": meta.get("hue", (i * 47) % 360),
                   "superskill": {"description": desc, "references": refs, "path": f"superskills/{sid}"} if desc else None,
                   "zip": f"zips/{folder}.zip" if not any(k["nonCommercial"] for k in skills) else None, "skills": skills})
out = APP / "catalog"; out.mkdir(exist_ok=True)
json.dump({"topics": topics}, open(out / "catalog.json", "w"), indent=1, ensure_ascii=False)
print(len(topics), "topics,", sum(len(t["skills"]) for t in topics), "skills,", sum(1 for t in topics if t["superskill"]), "super skills")
