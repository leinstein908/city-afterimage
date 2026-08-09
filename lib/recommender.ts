import {
  AXIS_LABELS,
  LIVING_CIRCLES,
  SCENE_DUELS,
  WEEKDAY_CARDS,
  WEEKEND_CARDS,
} from "./living-data";
import type {
  CommuteEstimate,
  FeedbackAdjustment,
  LifestyleAfterimage,
  LifestyleAxis,
  LifestyleAxisScore,
  LivingCircle,
  Recommendation,
  RecommendationEvidence,
  RecommendationResult,
  UserProfile,
} from "./living-types";

const AXES: LifestyleAxis[] = [
  "convenience",
  "calm",
  "social",
  "texture",
  "nature",
  "exploration",
];

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

function distanceKm(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number },
) {
  const radius = 6371;
  const lat = ((to.lat - from.lat) * Math.PI) / 180;
  const lng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(lat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(lng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateCommute(profile: UserProfile, circle: LivingCircle): CommuteEstimate {
  const distance = distanceKm(circle.center, profile.officeLocation);
  const crossesRiver =
    (circle.center.lng < 114.29 && profile.officeLocation.lng > 114.31) ||
    (circle.center.lng > 114.31 && profile.officeLocation.lng < 114.29);
  const mode = profile.workPattern.commuteMode;
  const minutesByMode = {
    walking: (distance / 4.6) * 60,
    cycling: (distance / 14) * 60 + 4,
    driving: (distance / 27) * 60 + 9,
    transit: (distance / 23) * 60 + 11,
  };
  const transferPenalty = mode === "transit" ? Math.max(0, 75 - circle.features.transit) / 6 : 0;
  const riverPenalty = crossesRiver && mode !== "walking" ? 7 : 0;
  const minutes = clamp(minutesByMode[mode] + transferPenalty + riverPenalty, 6, 120);
  return {
    minutes,
    mode,
    source: "estimate",
    description: `${minutes} 分钟左右 · ${modeLabel(mode)}估算`,
  };
}

function modeLabel(mode: UserProfile["workPattern"]["commuteMode"]) {
  return {
    transit: "公共交通",
    walking: "步行",
    cycling: "骑行",
    driving: "驾车",
  }[mode];
}

function deriveAxisValues(profile: UserProfile): Record<LifestyleAxis, number> {
  const values: Record<LifestyleAxis, number> = {
    convenience: 36,
    calm: 36,
    social: 36,
    texture: 36,
    nature: 36,
    exploration: 36,
  };

  for (const choice of profile.sceneChoices) {
    const scene = SCENE_DUELS.find((item) => item.id === choice.sceneId);
    const option = scene?.options.find((item) => item.id === choice.optionId);
    if (!option) continue;
    for (const [axis, delta] of Object.entries(option.deltas)) {
      values[axis as LifestyleAxis] += delta ?? 0;
    }
  }

  const selectedCards = [
    ...WEEKDAY_CARDS.filter((card) => profile.weekdayPriorities.includes(card.id)),
    ...WEEKEND_CARDS.filter((card) => profile.weekendPriorities.includes(card.id)),
  ];
  for (const card of selectedCards) {
    for (const [axis, delta] of Object.entries(card.deltas)) {
      values[axis as LifestyleAxis] += (delta ?? 0) * 0.62;
    }
  }

  if (profile.workPattern.overtime === "often") values.convenience += 8;
  if (profile.workPattern.overtime === "rare") values.exploration += 4;
  if (profile.workPattern.maxCommuteMinutes <= 30) values.convenience += 7;

  for (const axis of AXES) {
    values[axis] = clamp(values[axis] + (profile.axisAdjustments[axis] ?? 0), 18, 94);
  }
  return values;
}

const PHRASES: Record<LifestyleAxis, [string, string]> = {
  convenience: ["愿意为目的地多走一步", "希望日常下楼就能解决"],
  calm: ["城市的声音会给你能量", "回家需要清楚的安静边界"],
  social: ["更珍惜不被打扰的私人时间", "喜欢随时有人回应的生活"],
  texture: ["偏爱清楚稳定的新街区", "需要街道留下时间和熟人"],
  nature: ["自然是偶尔出发的目的地", "水边和绿意必须进入日常"],
  exploration: ["周末更想在家附近慢下来", "需要不断发现新的城市切面"],
};

function makeAfterimage(profile: UserProfile, values: Record<LifestyleAxis, number>): LifestyleAfterimage {
  const axes: LifestyleAxisScore[] = AXES.map((axis) => ({
    id: axis,
    label: AXIS_LABELS[axis],
    value: values[axis],
    phrase: PHRASES[axis][values[axis] >= 58 ? 1 : 0],
  }));
  const ranked = [...axes].sort((a, b) => b.value - a.value);
  const late = profile.workPattern.endTime >= "19:00";
  const first = ranked[0];
  const second = ranked[1];
  const commute = profile.workPattern.maxCommuteMinutes;
  const declaration = late
    ? `你要的不是一直热闹，而是晚归后生活仍然在线；你愿意用 ${commute} 分钟通勤，换来${first.phrase.replace(/^希望|^需要|^喜欢/, "")}。`
    : `你希望工作在 ${commute} 分钟内结束，生活从出站那一刻开始；${first.phrase}，同时${second.phrase}。`;
  const completed = profile.sceneChoices.filter((choice) => choice.optionId).length;
  return {
    declaration,
    axes,
    tokens: ranked.slice(0, 4).map((axis) => ({ axis: axis.id, label: axis.phrase })),
    hardConstraints: [
      `${profile.workPattern.maxCommuteMinutes} 分钟通勤上限`,
      `${profile.workPattern.endTime} 左右下班`,
      `${modeLabel(profile.workPattern.commuteMode)}优先`,
    ],
    evidence: [
      `已完成 ${completed} 次生活场景取舍`,
      `选择了 ${profile.weekdayPriorities.length} 个工作日晚间片段`,
      profile.optionalAnchors.length
        ? `希望靠近 ${profile.optionalAnchors.map((anchor) => anchor.label).join("、")}`
        : "没有额外地点绑住你的选择",
    ],
    confidence: clamp(58 + completed * 5 + profile.weekdayPriorities.length * 2),
  };
}

function similarity(target: number, actual: number) {
  return clamp(100 - Math.abs(target - actual) * 1.08);
}

function commuteScore(minutes: number, max: number) {
  if (minutes <= max) return clamp(100 - (minutes / Math.max(10, max)) * 36, 58, 100);
  return clamp(53 - (minutes - max) * 3.2, 0, 53);
}

function anchorScore(profile: UserProfile, circle: LivingCircle) {
  if (!profile.optionalAnchors.length) return 76;
  const average =
    profile.optionalAnchors.reduce(
      (sum, anchor) => sum + clamp(100 - distanceKm(circle.center, anchor.place) * 8, 0, 100),
      0,
    ) / profile.optionalAnchors.length;
  return clamp(average);
}

function buildEvidence(
  profile: UserProfile,
  circle: LivingCircle,
  commute: CommuteEstimate,
  values: Record<LifestyleAxis, number>,
): RecommendationEvidence[] {
  const axisDetail: Record<LifestyleAxis, string> = {
    convenience: `${circle.poi.breakfast}和${circle.poi.evening}能把过早、晚饭与日常补给放在熟悉半径里。`,
    calm: `${circle.poi.nature}为下班后的恢复留出一段安静路程，和你对“回家边界”的选择相符。`,
    social: `以${circle.poi.evening}为夜间落点，临时见面不需要再为一次聚会跨城。`,
    texture: `${circle.poi.culture}与${circle.poi.breakfast}会进入每天经过的路线，而不只是周末打卡。`,
    nature: `${circle.poi.nature}可以进入日常步行，水边与绿意不必等到一次专门远行。`,
    exploration: `${circle.poi.culture}持续提供新的城市切面，周末仍然有值得出门的理由。`,
  };
  const axisEvidence = AXES.map((axis) => ({
    id: `${circle.id}-${axis}`,
    axis,
    label: AXIS_LABELS[axis],
    detail: axisDetail[axis],
    impact: similarity(values[axis], circle.features[axis]),
  })).sort((a, b) => b.impact - a.impact);
  const evidence: RecommendationEvidence[] = [
    {
      id: `${circle.id}-commute`,
      axis: "commute",
      label: commute.minutes <= profile.workPattern.maxCommuteMinutes ? "通勤在底线以内" : "通勤需要妥协",
      detail: `${commute.description}，你的上限是 ${profile.workPattern.maxCommuteMinutes} 分钟`,
      impact: commuteScore(commute.minutes, profile.workPattern.maxCommuteMinutes),
    },
    ...axisEvidence.slice(0, 2),
  ];
  if (profile.optionalAnchors.length) {
    evidence.push({
      id: `${circle.id}-anchor`,
      axis: "anchor",
      label: "重要的人和地方仍在半径里",
      detail: `已将 ${profile.optionalAnchors.map((anchor) => anchor.label).join("、")} 纳入距离计算`,
      impact: anchorScore(profile, circle),
    });
  }
  return evidence;
}

function makeWeekday(profile: UserProfile, circle: LivingCircle, commute: CommuteEstimate) {
  const leaveTime = profile.workPattern.endTime;
  const homeHour = Math.min(23, Number(leaveTime.slice(0, 2)) + Math.ceil(commute.minutes / 60));
  const selected = profile.weekdayPriorities;
  const middle = selected.includes("exercise")
    ? { title: `在${circle.poi.nature}动一动`, detail: "不用把运动变成另一次远征。" }
    : selected.includes("see-friend")
      ? { title: `在${circle.poi.evening}临时见面`, detail: "朋友一句话，今晚仍然来得及。" }
      : selected.includes("walk-home")
        ? { title: `绕过${circle.poi.culture}再回家`, detail: "用一小段步行把工作留在路上。" }
        : { title: "回到自己的安静边界", detail: "不安排，也是一项被认真保护的安排。" };
  return {
    title: "一个不必燃烧自己的工作日",
    subtitle: `以下班时间 ${leaveTime} 为起点的普通星期三`,
    stops: [
      { time: leaveTime, title: "工作真正结束", detail: `${commute.description}，路线在你的现实约束中。` },
      { time: `${String(homeHour).padStart(2, "0")}:10`, title: middle.title, detail: middle.detail },
      { time: `${String(Math.min(23, homeHour + 1)).padStart(2, "0")}:20`, title: `在${circle.poi.evening}附近吃好晚饭`, detail: "晚归也不把生活压缩成外卖盒。" },
      { time: "22:40", title: "回到 1.5 公里生活半径", detail: "今晚没有为了日常再换乘一次。" },
    ],
  };
}

function makeWeekend(profile: UserProfile, circle: LivingCircle) {
  const selected = profile.weekendPriorities;
  const noon = selected.includes("friends")
    ? { title: `在${circle.poi.culture}附近见朋友`, detail: "不用提前计算最后一班车。" }
    : selected.includes("exhibition")
      ? { title: `从${circle.poi.culture}开始一次新发现`, detail: "给下周留一件可以谈论的新事。" }
      : { title: `在${circle.poi.nature}边慢下来`, detail: "没有打卡任务，只让视线变远。" };
  return {
    title: "一个不会被攻略占满的周末",
    subtitle: "不是度假，是住在这里以后会反复发生的星期六",
    stops: [
      { time: "09:10", title: `去${circle.poi.breakfast}吃一份熟悉的早餐`, detail: "周末第一件事不需要提前预约。" },
      { time: "11:00", title: noon.title, detail: noon.detail },
      { time: "15:40", title: `走到${circle.poi.nature}`, detail: "把自然放进日常，而不是一年一次的计划。" },
      { time: "19:00", title: "在熟悉半径里结束一天", detail: "明天还可以再来，不必一次拥有全部。" },
    ],
  };
}

interface ScoredCircle {
  circle: LivingCircle;
  commute: CommuteEstimate;
  total: number;
  breakdown: Recommendation["scoreBreakdown"];
  evidence: RecommendationEvidence[];
  mismatch: LifestyleAxis;
}

export type CommuteOverrides = Partial<Record<string, CommuteEstimate>>;

function scoreCircles(
  profile: UserProfile,
  values: Record<LifestyleAxis, number>,
  overrides: CommuteOverrides = {},
): ScoredCircle[] {
  return LIVING_CIRCLES.map((circle) => {
    const commute = overrides[circle.id] ?? estimateCommute(profile, circle);
    const commuteFit = commuteScore(commute.minutes, profile.workPattern.maxCommuteMinutes);
    const facilities = clamp(
      similarity(values.convenience, circle.features.convenience) * 0.42 +
        circle.features.walkability * 0.26 +
        circle.features.transit * 0.18 +
        circle.features.lateFood * 0.14,
    );
    const rhythm = clamp(
      (similarity(values.calm, circle.features.calm) +
        similarity(values.exploration, circle.features.exploration) +
        similarity(values.convenience, circle.features.convenience)) /
        3,
    );
    const social = similarity(values.social, circle.features.social);
    const textureNature = clamp(
      (similarity(values.texture, circle.features.texture) +
        similarity(values.nature, circle.features.nature)) /
        2,
    );
    const anchor = anchorScore(profile, circle);
    const total = clamp(
      commuteFit * 0.35 +
        facilities * 0.25 +
        rhythm * 0.15 +
        social * 0.1 +
        textureNature * 0.1 +
        anchor * 0.05,
    );
    const mismatch = [...AXES].sort(
      (left, right) =>
        similarity(values[left], circle.features[left]) -
        similarity(values[right], circle.features[right]),
    )[0];
    return {
      circle,
      commute,
      total,
      breakdown: {
        commute: commuteFit,
        facilities,
        rhythm,
        social,
        textureNature,
        anchor,
      },
      evidence: buildEvidence(profile, circle, commute, values),
      mismatch,
    };
  });
}

function toRecommendation(
  profile: UserProfile,
  item: ScoredCircle,
  role: Recommendation["role"],
): Recommendation {
  const roleLabel = { match: "最合拍", easy: "最省力", growth: "最可能长成的你" }[role];
  const mismatchValue = item.circle.features[item.mismatch];
  const tradeoff =
    item.commute.minutes > profile.workPattern.maxCommuteMinutes
      ? `需要接受比通勤底线多 ${item.commute.minutes - profile.workPattern.maxCommuteMinutes} 分钟，这是它最真实的代价。`
      : mismatchValue < 50
        ? `${AXIS_LABELS[item.mismatch]}不是这里的强项，不能期待它同时满足所有想象。`
        : `这里没有明显短板，但也意味着生活更均衡、个性不会极端。`;
  return {
    role,
    roleLabel,
    circle: item.circle,
    score: item.total,
    scoreBreakdown: item.breakdown,
    commute: item.commute,
    evidence: item.evidence,
    tradeoff,
    weekday: makeWeekday(profile, item.circle, item.commute),
    weekend: makeWeekend(profile, item.circle),
  };
}

export function recommendLivingCircles(
  profile: UserProfile,
  overrides: CommuteOverrides = {},
  dataMode: RecommendationResult["dataMode"] = "fixture",
): RecommendationResult {
  const values = deriveAxisValues(profile);
  const afterimage = makeAfterimage(profile, values);
  const scored = scoreCircles(profile, values, overrides).sort((a, b) => b.total - a.total);
  const match = scored[0];
  const easy = [...scored]
    .filter((item) => item.circle.id !== match.circle.id)
    .sort(
      (a, b) =>
        b.breakdown.commute * 0.62 + b.breakdown.facilities * 0.38 -
        (a.breakdown.commute * 0.62 + a.breakdown.facilities * 0.38),
    )[0];
  const growth = [...scored]
    .filter((item) => ![match.circle.id, easy.circle.id].includes(item.circle.id))
    .filter((item) => item.breakdown.commute >= 35)
    .sort((a, b) => {
      const growthA =
        a.total * 0.45 +
        a.circle.features.exploration * 0.22 +
        a.circle.features.texture * 0.18 +
        a.circle.features.nature * 0.15;
      const growthB =
        b.total * 0.45 +
        b.circle.features.exploration * 0.22 +
        b.circle.features.texture * 0.18 +
        b.circle.features.nature * 0.15;
      return growthB - growthA;
    })[0] ?? scored[2];
  const dayCode = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return {
    code: `WH-${dayCode}-${profile.officeLocation.id.slice(-4).toUpperCase()}`,
    dataMode,
    afterimage,
    recommendations: [
      toRecommendation(profile, match, "match"),
      toRecommendation(profile, easy, "easy"),
      toRecommendation(profile, growth, "growth"),
    ],
  };
}

export function applyFeedback(
  profile: UserProfile,
  feedback: FeedbackAdjustment,
): UserProfile {
  const next: UserProfile = {
    ...profile,
    workPattern: { ...profile.workPattern },
    axisAdjustments: { ...profile.axisAdjustments },
  };
  const delta = feedback.direction === "like" ? 8 : -10;
  if (feedback.axis === "commute") {
    next.workPattern.maxCommuteMinutes = clamp(
      next.workPattern.maxCommuteMinutes + (feedback.direction === "like" ? 5 : -5),
      15,
      75,
    );
  } else if (feedback.axis !== "anchor") {
    next.axisAdjustments[feedback.axis] = clamp(
      (next.axisAdjustments[feedback.axis] ?? 0) + delta,
      -24,
      24,
    );
  }
  return next;
}
