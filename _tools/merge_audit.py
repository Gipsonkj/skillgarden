"""Merge _research/audit/*.add.json into _research/<slug>.json (dedupe by repo+path, insert at suggested rank)."""
import json, glob
from pathlib import Path
R = Path(__file__).resolve().parent.parent / "_research"
for f in sorted(glob.glob(str(R / "audit" / "*.add.json"))):
    a = json.load(open(f)); slug = a["slug"]
    tp = R / f"{slug}.json"; t = json.load(open(tp))
    have = {(s["repo"].lower(), s.get("skill_path", "").strip("/")) for s in t["skills"]}
    added = []
    for s in sorted(a.get("add", []), key=lambda s: s.get("rank", 999)):
        k = (s["repo"].lower(), s.get("skill_path", "").strip("/"))
        if k in have: continue
        s["audit_added"] = True
        pos = max(0, min(len(t["skills"]), int(s.get("rank", 999)) - 1))
        t["skills"].insert(pos, s); have.add(k); added.append(s["name"])
    for i, s in enumerate(t["skills"], 1): s["rank"] = i
    t.setdefault("sources_checked", []).extend(a.get("checked", []))
    json.dump(t, open(tp, "w"), indent=2, ensure_ascii=False)
    print(f"{slug}: +{len(added)} {added}")
