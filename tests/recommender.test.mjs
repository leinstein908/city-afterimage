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
