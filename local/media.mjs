// Turns a reel video you dropped into the Reel inbox into text the scout can read:
// a transcript of what is said and a few still frames of what is shown. Everything
// runs on this computer with ffmpeg and a local Whisper; nothing is uploaded.
//
//   brew install ffmpeg openai-whisper      (the simplest setup on a Mac)
//
// Also works with whisper.cpp (`brew install whisper-cpp`) when WHISPER_MODEL points
// at a ggml model file. SKILL_GARDEN_WHISPER_MODEL picks the openai-whisper model
// (default "base"). The video itself is deleted once it has been read.
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

export const MAX_VIDEO = 300 * 1024 * 1024;
export const VIDEO_TYPES = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "video/x-m4v": "m4v" };
const FRAMES = 6;
const LIMIT_TRANSCRIPT = 20000;

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: 15 * 60e3, maxBuffer: 16 * 1024 * 1024, ...opts }, (err, stdout, stderr) => {
      if (err) { err.stderr = String(stderr || ""); reject(err); } else resolve(String(stdout || ""));
    });
  });
}
const has = (cmd) => run(cmd, ["--help"], { timeout: 20e3 }).then(() => true, (e) => e.code !== "ENOENT");

/** Which tools are installed, so the page can say what's missing. */
export async function tools() {
  const [ffmpeg, whisper, whisperCpp] = await Promise.all([has("ffmpeg"), has("whisper"), has("whisper-cli")]);
  const model = process.env.WHISPER_MODEL && fs.existsSync(process.env.WHISPER_MODEL) ? process.env.WHISPER_MODEL : null;
  const transcriber = whisper ? "whisper" : whisperCpp && model ? "whisper-cli" : null;
  return { ffmpeg, transcriber, ready: ffmpeg && !!transcriber };
}

async function duration(file) {
  try {
    const out = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { timeout: 60e3 });
    return Number(out.trim()) || 0;
  } catch { return 0; }
}

async function transcribe(kind, wav, dir) {
  if (kind === "whisper") {
    await run("whisper", [wav, "--model", process.env.SKILL_GARDEN_WHISPER_MODEL || "base", "--output_format", "txt", "--output_dir", dir, "--fp16", "False", "--verbose", "False"]);
  } else {
    await run("whisper-cli", ["-m", process.env.WHISPER_MODEL, "-f", wav, "-nt", "-otxt", "-of", path.join(dir, "audio")]);
  }
  const txt = path.join(dir, "audio.txt");
  return fs.existsSync(txt) ? fs.readFileSync(txt, "utf8").replace(/\s+\n/g, "\n").trim() : "";
}

/**
 * Read one video. Writes frames to <dir>/frame-N.jpg and returns
 * { transcript, frames: ["media/<id>/frame-1.jpg", …], seconds }.
 */
export async function processVideo(video, dir, rel) {
  const t = await tools();
  if (!t.ffmpeg) throw new Error("ffmpeg isn't installed. In Terminal: brew install ffmpeg openai-whisper");
  const seconds = await duration(video);
  const wav = path.join(dir, "audio.wav");
  await run("ffmpeg", ["-y", "-v", "error", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav]).catch(() => null); // a silent video has no audio track
  let transcript = "";
  if (fs.existsSync(wav)) {
    if (!t.transcriber) throw new Error("No transcriber found. In Terminal: brew install openai-whisper");
    transcript = (await transcribe(t.transcriber, wav, dir)).slice(0, LIMIT_TRANSCRIPT);
    fs.rmSync(wav, { force: true });
    fs.rmSync(path.join(dir, "audio.txt"), { force: true });
  }
  // Evenly spaced stills show on-screen text, code and UI the narration skips.
  const frames = [];
  const span = seconds || 30;
  for (let k = 0; k < FRAMES; k++) {
    const at = ((k + 0.5) * span) / FRAMES;
    const out = path.join(dir, `frame-${k + 1}.jpg`);
    try {
      await run("ffmpeg", ["-y", "-v", "error", "-ss", at.toFixed(2), "-i", video, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", "4", out], { timeout: 120e3 });
      if (fs.existsSync(out)) frames.push(`${rel}/frame-${k + 1}.jpg`);
    } catch { /* past the end of a short clip */ }
  }
  return { transcript, frames, seconds: Math.round(seconds) };
}
