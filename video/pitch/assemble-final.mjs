import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pitchDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(pitchDir, "../..");
const workDir = path.join(pitchDir, "work");
const visual = path.join(workDir, "visual.mp4");
const narration = path.join(workDir, "narration.wav");
const captionsDir = path.join(pitchDir, "captions");
const output = path.join(projectDir, "public/video-pitch/city-afterimage-openarena-90s.mp4");

const segments = [
  [0.0, 4.6], [4.6, 5.4], [10.0, 4.2], [14.2, 7.8],
  [22.0, 6.7], [28.7, 7.3], [36.0, 7.7], [43.7, 8.3],
  [52.0, 8.5], [60.5, 8.5], [69.0, 7.5], [76.5, 5.5],
  [82.0, 5.0], [87.0, 3.0],
];

function run(args) {
  const result = spawnSync("ffmpeg", args, { cwd: projectDir, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const [index, [start, duration]] of segments.entries()) {
  const number = String(index + 1).padStart(2, "0");
  run([
    "-hide_banner", "-loglevel", "error", "-stats", "-y",
    "-ss", String(start), "-i", visual,
    "-loop", "1", "-framerate", "30", "-i", path.join(captionsDir, `caption-${number}.png`),
    "-filter_complex", "[0:v][1:v]overlay=0:0:shortest=1,format=yuv420p[outv]",
    "-map", "[outv]", "-an", "-t", String(duration), "-r", "30",
    "-c:v", "libx264", "-preset", "fast", "-crf", "21",
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1", "-g", "60",
    path.join(workDir, `captioned-${number}.mp4`),
  ]);
}

const concatList = segments.map((_, index) => (
  `file 'captioned-${String(index + 1).padStart(2, "0")}.mp4'`
)).join("\n") + "\n";
const concatPath = path.join(workDir, "captioned-concat.txt");
writeFileSync(concatPath, concatList, "utf8");

const captionedVisual = path.join(workDir, "captioned-visual.mp4");
run([
  "-hide_banner", "-loglevel", "error", "-stats", "-y",
  "-f", "concat", "-safe", "0", "-i", concatPath,
  "-c", "copy", captionedVisual,
]);

run([
  "-hide_banner", "-loglevel", "error", "-stats", "-y",
  "-i", captionedVisual, "-i", narration,
  "-map", "0:v:0", "-map", "1:a:0",
  "-c:v", "copy", "-filter:a", "volume=-3dB",
  "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
  "-t", "90", "-movflags", "+faststart", output,
]);

const probe = spawnSync("ffprobe", [
  "-v", "error",
  "-show_entries", "stream=codec_name,width,height,pix_fmt,r_frame_rate,sample_rate,channels",
  "-show_entries", "format=duration,size",
  "-of", "default=noprint_wrappers=1",
  output,
], { cwd: projectDir, encoding: "utf8" });

if (probe.status !== 0) process.exit(probe.status ?? 1);
console.log(probe.stdout.trim());
console.log(`Video written to ${output}`);
