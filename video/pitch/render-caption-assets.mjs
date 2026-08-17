import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const pitchDir = path.dirname(fileURLToPath(import.meta.url));
const captionsDir = path.join(pitchDir, "captions");
const slidesDir = path.join(pitchDir, "slides");

export const cues = [
  { start: 0.00, end: 4.60, en: "Moving to an unfamiliar city looks like a housing search.", zh: "搬去一座陌生城市，看起来是在找房。" },
  { start: 4.60, end: 10.00, en: "But what you repeat every day isn't a listing. It's an ordinary day.", zh: "但你每天重复的不是一条房源，而是一个普通日常。" },
  { start: 10.00, end: 14.20, en: "Most tools ask about rent, commute, and bedrooms.", zh: "大多数工具只问租金、通勤和户型。" },
  { start: 14.20, end: 22.00, en: "They miss what makes daily life work: if work ends at seven thirty, can you still eat, unwind, meet a friend, or reach a park?", zh: "它们漏掉了决定日常能否成立的问题：七点半下班后，你还能吃饭、放松、见朋友，或走进公园吗？" },
  { start: 22.00, end: 28.70, en: "City Afterimage is a relocation agent. Users set work, commute, and who and what they want nearby.", zh: "城市潜像是一款迁居决策 Agent。用户设定工作、通勤，以及想靠近的人与地点。" },
  { start: 28.70, end: 36.00, en: "Then they choose between real-life scenes. Before showing a place name, it turns those choices into a lifestyle profile.", zh: "再在具体生活场景中做选择。地名出现前，Agent 会把这些选择转成生活画像。" },
  { start: 36.00, end: 43.70, en: "That order matters. First, users check whether the profile feels true, and can remove or change anything that doesn't.", zh: "这个顺序很重要。用户先判断画像像不像自己，也能删改不准确的内容。" },
  { start: 43.70, end: 52.00, en: "Then the agent connects it to Wuhan coordinates, routes, nearby facilities, and twenty-two curated neighborhood clusters.", zh: "确认后，Agent 才把画像连接到武汉坐标、路线、周边设施和 22 个策展生活圈。" },
  { start: 52.00, end: 60.50, en: "It returns three choices: best overall fit, least daily friction, and a feasible step toward the life they want.", zh: "它给出三种选择：综合最合拍、日常最省力，以及现实可行又更接近向往生活的地方。" },
  { start: 60.50, end: 69.00, en: "Each includes an evidence passport with sources, a clear trade-off, and a simulated weekday and weekend.", zh: "每个选择都有标注来源的证据护照、明确妥协，以及模拟的工作日和周末。" },
  { start: 69.00, end: 76.50, en: "The user can push back. Tighten the commute limit from forty to thirty-five minutes, or reject one piece of evidence.", zh: "用户可以反驳：把通勤上限从 40 分钟收紧到 35 分钟，或否定一条证据。" },
  { start: 76.50, end: 82.00, en: "The recommendation, its evidence, and the simulated day all update together.", zh: "推荐、证据和模拟的一天会同步更新。" },
  { start: 82.00, end: 87.00, en: "For one mover, City Afterimage combines the work of a local guide, relocation agent, and data analyst.", zh: "城市潜像为一个异地入职者组合了本地向导、迁居顾问和数据分析师的能力。" },
  { start: 87.00, end: 90.00, en: "It never claims one perfect home.", zh: "但它从不声称存在唯一完美的住处。" },
];

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

function wrapEnglish(text, max = 82) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function wrapChinese(text, max = 40) {
  if (text.length <= max) return [text];
  const breaks = ["，", "。", "；", "：", "、"];
  const middle = Math.floor(text.length / 2);
  let split = -1;
  for (let offset = 0; offset < text.length; offset += 1) {
    for (const index of [middle - offset, middle + offset]) {
      if (index > 0 && index < text.length - 1 && breaks.includes(text[index])) {
        split = index + 1;
        break;
      }
    }
    if (split !== -1) break;
  }
  if (split === -1) split = middle;
  return [text.slice(0, split), text.slice(split)];
}

function renderCaptionSvg(cue) {
  const english = wrapEnglish(cue.en);
  const chinese = wrapChinese(cue.zh);
  const enHeight = english.length * 39;
  const zhHeight = chinese.length * 33;
  const contentHeight = enHeight + zhHeight + 10;
  const startY = 842 + (190 - contentHeight) / 2 + 30;
  const enSpans = english.map((line, index) => (
    `<tspan x="960" y="${startY + index * 39}">${escapeXml(line)}</tspan>`
  )).join("");
  const zhStart = startY + enHeight + 5;
  const zhSpans = chinese.map((line, index) => (
    `<tspan x="960" y="${zhStart + index * 33}">${escapeXml(line)}</tspan>`
  )).join("");

  return Buffer.from(`
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <rect x="130" y="842" width="1660" height="190" rx="18" fill="#0b0d0a" fill-opacity="0.89" stroke="#d9ff3f" stroke-opacity="0.42" />
      <rect x="130" y="842" width="12" height="190" rx="6" fill="#d9ff3f" />
      <text text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#f4f0e4">${enSpans}</text>
      <text text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial, sans-serif" font-size="27" font-weight="650" fill="#d9ff3f">${zhSpans}</text>
    </svg>
  `);
}

function formatSrtTime(seconds) {
  const milliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const secs = Math.floor((milliseconds % 60_000) / 1000);
  const ms = milliseconds % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function makeSrt(language) {
  return cues.map((cue, index) => [
    index + 1,
    `${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}`,
    cue[language],
    "",
  ].join("\n")).join("\n");
}

await mkdir(captionsDir, { recursive: true });

for (const [index, cue] of cues.entries()) {
  const number = String(index + 1).padStart(2, "0");
  await sharp(renderCaptionSvg(cue)).png().toFile(path.join(captionsDir, `caption-${number}.png`));
}

await writeFile(path.join(pitchDir, "subtitles-en.srt"), makeSrt("en"), "utf8");
await writeFile(path.join(pitchDir, "subtitles-zh.srt"), makeSrt("zh"), "utf8");

const thumbnails = await Promise.all(Array.from({ length: 7 }, async (_, index) => (
  sharp(path.join(slidesDir, `slide-${String(index + 1).padStart(2, "0")}.png`))
    .resize(480, 270, { fit: "cover" })
    .toBuffer()
)));

const positions = [
  [0, 0], [480, 0], [960, 0], [1440, 0],
  [240, 270], [720, 270], [1200, 270],
];

await sharp({ create: { width: 1920, height: 540, channels: 3, background: "#11130f" } })
  .composite(thumbnails.map((input, index) => ({ input, left: positions[index][0], top: positions[index][1] })))
  .png()
  .toFile(path.join(pitchDir, "contact-sheet.png"));

console.log(`Rendered ${cues.length} bilingual caption cards, two SRT files, and the contact sheet.`);
