#!/usr/bin/env python3
"""ByteDance ModelArk runner: Seedream stills, Seedance i2v, 2.5 multi-ref and edit.

  ark.py models                                   list model ids the key can see
  ark.py probe                                    which video models are actually OPEN (free)
  ark.py image out.jpg [--size 2560x1920] [--model seedream-5-0-260128]  <<< prompt
  ark.py video [still.png] out.mp4 [--model M] [--res 720p] [--dur 5] [--ratio 9:16]
               [--ref path|asset://id|https://…]* [--video https://signed] [--edit]
               [--audio] [--camerafixed] [--timeout 1800]              <<< prompt

Key: ARK_API_KEY environment variable (export ARK_API_KEY=<your ModelArk API key>).
Prices (measured): 1.5-pro 720p 5s no-audio ≈ $0.13; 2.5 720p 5s ≈ $1.16; audio doubles it.
"""
import argparse, base64, json, mimetypes, os, sys, time, urllib.error, urllib.request

BASE = "https://ark.ap-southeast.bytepluses.com/api/v3"
V15 = "seedance-1-5-pro-251215"
V25 = "dreamina-seedance-2-5-260628"
IMG = "seedream-5-0-260128"
VIDEO_CANDIDATES = [V15, V25, "dreamina-seedance-2-0-fast-260128",
                    "dreamina-seedance-2-0-mini-260615", "seedance-1-0-pro-fast-251015"]


def key():
    k = os.environ.get("ARK_API_KEY")
    if k:
        return k
    sys.exit("ARK_API_KEY not set: export ARK_API_KEY=<your ModelArk API key>")


def call(method, path, body=None, timeout=180):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body else None,
                                 method=method, headers={"Content-Type": "application/json",
                                                         "Authorization": "Bearer " + key()})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf8", "replace")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw[:600]}


def err_code(body):
    e = body.get("error") if isinstance(body, dict) else None
    return (e.get("code"), e.get("message", "")[:200]) if isinstance(e, dict) else (None, json.dumps(body)[:200])


def image_ref(s):
    """path → data URI; asset://… or http(s) passes through."""
    if s.startswith(("asset://", "http://", "https://", "data:")):
        return s
    mime = mimetypes.guess_type(s)[0] or "image/png"
    return f"data:{mime};base64," + base64.b64encode(open(s, "rb").read()).decode()


def download(url, out):
    urllib.request.urlretrieve(url, out)


# ---------------- commands ----------------
def cmd_models(_):
    st, body = call("GET", "/models")
    if st != 200:
        sys.exit(f"GET /models -> {st} {json.dumps(body)[:300]}")
    for m in body.get("data", []):
        print(m.get("id") or m.get("name"))


def cmd_probe(_):
    cmd_models(_)
    px = base64.b64encode(bytes.fromhex(
        "ffd8ffe000104a46494600010100000100010000ffdb004300ff"
        "c00011080001000103012200021101031101ffc4001f0000010501"
        "01010101010100000000000000000102030405060708090a0bffda"
        "0008010100003f00d2cf20ffd9")).decode()
    print("\nsubmitting one throwaway task per video model (a rejection costs nothing):")
    for m in VIDEO_CANDIDATES:
        txt = "a still object" if "dreamina" in m else "a still object --resolution 480p --duration 5 --ratio 9:16"
        st, body = call("POST", "/contents/generations/tasks", {"model": m, "content": [
            {"type": "text", "text": txt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{px}"}}]})
        code, msg = err_code(body)
        # InvalidParameter means the request got PAST the model gate (2.5 rejects the 1px probe image)
        tag = "OPEN" if st in (200, 201) and body.get("id") else ("OPEN (param check)" if code == "InvalidParameter" else (code or f"HTTP {st}"))
        print(f"  {m:<38} {tag:<24} {'' if tag == 'OPEN' else msg}")
        if tag == "OPEN":
            call("DELETE", f"/contents/generations/tasks/{body['id']}")


def cmd_image(a):
    prompt = sys.stdin.read().strip()
    st, body = call("POST", "/images/generations", {
        "model": a.model or IMG, "prompt": prompt, "size": a.size, "response_format": "url",
        "watermark": False, "sequential_image_generation": "disabled"}, timeout=300)
    if st != 200:
        sys.exit(f"ERR {st} {json.dumps(body)[:400]}")
    download(body["data"][0]["url"], a.out)  # signed URL, short-lived: fetch now
    print("OK", a.out, body.get("usage"))


def cmd_video(a):
    prompt = sys.stdin.read().strip()
    model = a.model or (V25 if (a.edit or a.video or len(a.ref) > 1) else V15)
    content = []
    is25 = "2-5" in model or "2-0" in model
    if is25:
        content.append({"type": "text", "text": prompt})
    else:  # 1.5-pro takes sizing as flags in the prompt text
        flags = [f"--resolution {a.res}", f"--duration {a.dur}"]
        if a.ratio: flags.append(f"--ratio {a.ratio}")
        if a.camerafixed: flags.append("--camerafixed true")
        content.append({"type": "text", "text": f"{prompt} {' '.join(flags)}"})
    if a.still:
        content.append({"type": "image_url", "image_url": {"url": image_ref(a.still)}, "role": "first_frame"})
    for r in a.ref:
        content.append({"type": "image_url", "image_url": {"url": image_ref(r)}, "role": "reference_image"})
    if a.video:
        if not a.video.startswith("http"):
            sys.exit("reference_video must be a web URL (base64 is refused) — sign a GCS object")
        content.append({"type": "video_url", "video_url": {"url": a.video}, "role": "reference_video"})
    body = {"model": model, "content": content, "generate_audio": bool(a.audio), "watermark": False}
    if is25:
        body.update({"resolution": a.res, "output_format": "mp4"})
        if a.edit:
            body.update({"omni_reference_task_type": "edit", "ratio": "adaptive", "duration": -1})
        else:
            body["duration"] = a.dur
            if a.ratio and not a.still: body["ratio"] = a.ratio  # with first_frame the ratio follows the image
    st, r = call("POST", "/contents/generations/tasks", body)
    print("submit", st, json.dumps(r)[:300], flush=True)
    if "id" not in r:
        code, msg = err_code(r)
        sys.exit(f"FAILED {code}: {msg}")
    t0 = time.time()
    while time.time() - t0 < a.timeout:
        st, s = call("GET", f"/contents/generations/tasks/{r['id']}")
        status = s.get("status")
        if status == "succeeded":
            download(s["content"]["video_url"], a.out)
            print("saved", a.out, "usage", s.get("usage"))
            return
        if status in ("failed", "cancelled") or st >= 400:
            sys.exit(f"FAILED {json.dumps(s)[:600]}")
        time.sleep(15)
    sys.exit("timeout")


p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
sub = p.add_subparsers(dest="cmd", required=True)
sub.add_parser("models").set_defaults(f=cmd_models)
sub.add_parser("probe").set_defaults(f=cmd_probe)
pi = sub.add_parser("image"); pi.add_argument("out"); pi.add_argument("--size", default="2560x1920")
pi.add_argument("--model"); pi.set_defaults(f=cmd_image)
pv = sub.add_parser("video"); pv.add_argument("paths", nargs="+", help="[still.png] out.mp4")
pv.add_argument("--model"); pv.add_argument("--res", default="720p"); pv.add_argument("--dur", type=int, default=5)
pv.add_argument("--ratio"); pv.add_argument("--ref", action="append", default=[])
pv.add_argument("--video"); pv.add_argument("--edit", action="store_true"); pv.add_argument("--audio", action="store_true")
pv.add_argument("--camerafixed", action="store_true"); pv.add_argument("--timeout", type=int, default=1800)
pv.set_defaults(f=cmd_video)
a = p.parse_args()
if a.cmd == "video":
    a.out = a.paths[-1]; a.still = a.paths[0] if len(a.paths) > 1 else None
a.f(a)
