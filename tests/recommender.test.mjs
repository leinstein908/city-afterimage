import assert from "node:assert/strict";
import test from "node:test";

// These source-level checks complement the server-render test without adding a TS runtime loader.
test("the recommendation contract keeps the three distinct result roles", async () => {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../lib/recommender.ts", import.meta.url), "utf8"),
  );
  assert.match(source, /toRecommendation\(profile, match, "match"\)/);
  assert.match(source, /toRecommendation\(profile, easy, "easy"\)/);
  assert.match(source, /toRecommendation\(profile, growth, "growth"\)/);
  assert.match(source, /maxCommuteMinutes/);
  assert.match(source, /applyFeedback/);
});

test("the Wuhan fixture contains at least 18 living circles", async () => {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../lib/living-data.ts", import.meta.url), "utf8"),
  );
  const ids = [...source.matchAll(/seed\(\{ id: "([^"]+)"/g)].map((match) => match[1]);
  assert.ok(ids.length >= 18, `expected at least 18 circles, received ${ids.length}`);
  assert.equal(new Set(ids).size, ids.length, "living-circle ids should be unique");
});

test("Huawei Wuhan Research Institute keeps a verified offline location and nearby circle", async () => {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../lib/living-data.ts", import.meta.url), "utf8"),
  );
  assert.match(source, /verified-huawei-wuhan-research/);
  assert.match(source, /九峰三路 207 号/);
  assert.match(source, /lng: 114\.535074/);
  assert.match(source, /lat: 30\.49298/);
  assert.match(source, /id: "future-tech"/);
});

test("the result map exposes real map providers and honest fallback states", async () => {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../lib/map-data.ts", import.meta.url), "utf8"),
  );
  assert.match(source, /高德实时路网与周边设施/);
  assert.match(source, /OpenStreetMap 实时开放路网与设施/);
  assert.match(source, /不伪造精确点位/);
});

test("judge mode, evidence passport and visible replanning stay in the competition build", async () => {
  const page = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  );
  const replan = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../lib/replan.ts", import.meta.url), "utf8"),
  );
  assert.match(page, /URLSearchParams\(window\.location\.search\)\.get\("judge"\) !== "1"/);
  assert.match(page, /EVIDENCE PASSPORT/);
  assert.match(page, /通勤再收紧 5 分钟/);
  assert.match(page, /内置演示坐标/);
  assert.match(replan, /buildReplanDelta/);
  assert.match(replan, /changedRoles/);
});

test("Huawei aliases resolve before generic offline hashing", async () => {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../app/api/places/route.ts", import.meta.url), "utf8"),
  );
  assert.match(source, /华为武汉研究所/);
  assert.match(source, /华为武汉研发基地/);
  assert.match(source, /verifiedFixtureMatches/);
  assert.match(source, /verified\.length \? verified : FIXTURE_SEARCH_PLACES/);
});

test("public copy does not claim unauthorized platform integrations", async () => {
  const read = (path) => import("node:fs/promises").then((fs) =>
    fs.readFile(new URL(path, import.meta.url), "utf8"),
  );
  const publicCopy = `${await read("../README.md")}\n${await read("../OPENARENA.md")}`;
  assert.match(publicCopy, /does \*\*not\*\* scrape or claim real-time access/i);
  assert.match(publicCopy, /Do not use:[\s\S]*scientifically proven perfect neighborhood/i);
  assert.match(publicCopy, /Do not use:[\s\S]*real-time all-platform data/i);
});
