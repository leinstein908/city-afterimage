import { CITIES, QUESTIONS } from "./city-data";
import type {
  AnalysisProvider,
  AnalysisResult,
  CityKey,
  ImageCategory,
  ImageNode,
} from "./types";

const NODE_POSITIONS = [
  { x: 30, y: 24 },
  { x: 68, y: 18 },
  { x: 77, y: 48 },
  { x: 58, y: 74 },
  { x: 25, y: 72 },
  { x: 15, y: 47 },
  { x: 47, y: 42 },
  { x: 44, y: 88 },
];

const CONCRETE_TERMS = [
  "凌晨",
  "傍晚",
  "清晨",
  "早晨",
  "夜里",
  "下雨",
  "暴雨",
  "冬天",
  "夏天",
  "春天",
  "秋天",
  "桥",
  "路口",
  "街",
  "巷",
  "江",
  "河",
  "湖",
  "轮渡",
  "公交",
  "地铁",
  "车窗",
  "老板",
  "大叔",
  "早餐",
  "气味",
  "潮气",
  "口音",
  "树",
  "风",
  "光",
  "雨",
  "船",
  "店",
];

const GENERIC_TERMS = ["很美", "很快", "很慢", "烟火气", "历史悠久", "美食很多"];

const CATEGORY_TERMS: Record<ImageCategory, string[]> = {
  spatial: [
    "汉口",
    "武昌",
    "江滩",
    "粮道街",
    "昙华林",
    "胡同",
    "环路",
    "弄堂",
    "苏州河",
    "锦江",
    "珠江",
    "骑楼",
    "桥",
    "轮渡",
    "街",
    "路口",
    "地铁",
  ],
  sensory: [
    "江风",
    "潮气",
    "热风",
    "油锅",
    "香樟",
    "起雾",
    "暴雨",
    "树影",
    "气味",
    "灯",
    "湿热",
    "雨",
    "风",
    "声音",
  ],
  cultural: [
    "过早",
    "热干面",
    "面窝",
    "豆汁",
    "沪语",
    "早咖",
    "盖碗茶",
    "龙门阵",
    "早茶",
    "粤语",
    "凉茶",
    "口音",
    "早餐",
  ],
  social: ["嘴硬", "热心", "带路", "陌生人", "大叔", "老板", "熟客", "善意", "招呼"],
  emotional: [
    "告别",
    "遥远",
    "自由",
    "孤独",
    "不舍",
    "想起",
    "抵达",
    "变小",
    "没睡",
    "日常",
  ],
  narrative: [
    "第一次",
    "离开",
    "辞职",
    "工作",
    "回家",
    "住过",
    "每天",
    "后来",
    "那天",
    "我",
  ],
};

const FALLBACK_LABELS = [
  "最先浮现的画面",
  "带人认识的那条路",
  "身体记住的气候",
  "只有这里成立的暗号",
  "陌生人的相处方式",
  "城市最像自己的时刻",
  "不能被拿走的骨架",
  "我与这座城的证据",
];

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

function compactQuote(answer: string, max = 54) {
  const clean = answer.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function countMatches(answer: string, terms: string[]) {
  return terms.filter((term) => answer.includes(term)).length;
}

function findLabel(answer: string, category: ImageCategory, index: number) {
  if (index === 1) {
    const route = answer.match(/从([^，。；]{1,9}).{0,4}(?:到|去)([^，。；]{1,9})/);
    if (route) return `${route[1]} → ${route[2]}`;
  }

  const cityTerms = Object.values(CITIES).flatMap((city) => city.signature);
  const terms = [...CATEGORY_TERMS[category], ...cityTerms].sort(
    (left, right) => right.length - left.length,
  );
  const matches = terms.filter((term) => answer.includes(term));

  if (matches.length >= 2) return `${matches[0]}与${matches[1]}`;
  if (matches.length === 1) {
    const context = answer
      .split(/[，。；！？]/)
      .find((part) => part.includes(matches[0]) && part.length <= 16);
    return context?.replace(/^(是|不是|还有|以及|我会)/, "") || matches[0];
  }

  const clause = answer
    .split(/[，。；！？]/)
    .map((part) => part.trim())
    .find((part) => part.length >= 4 && part.length <= 16);
  return clause?.replace(/^(有次|那一刻|我觉得|我会)/, "") || FALLBACK_LABELS[index];
}

function calculateNode(answer: string, index: number): ImageNode {
  const category = QUESTIONS[index].category;
  const concreteCount = countMatches(answer, CONCRETE_TERMS);
  const genericCount = countMatches(answer, GENERIC_TERMS);
  const personalSignal = /我|我的|每天|那天|曾经|后来|离开|第一次/.test(answer)
    ? 10
    : 0;
  const sensorySignal = /闻|听|皮肤|后背|眼镜|声音|气味|风|雨|热|冷|光/.test(answer)
    ? 8
    : 0;
  const importance = clamp(
    53 + Math.min(20, answer.length / 5) + concreteCount * 3 + (index === 6 ? 7 : 0),
    48,
    96,
  );
  const uniqueness = clamp(
    44 +
      Math.min(17, answer.length / 7) +
      concreteCount * 4 +
      personalSignal +
      sensorySignal -
      genericCount * 9,
    42,
    97,
  );

  return {
    id: QUESTIONS[index].id,
    label: findLabel(answer, category, index),
    quote: compactQuote(answer),
    category,
    importance,
    uniqueness,
    x: NODE_POSITIONS[index].x,
    y: NODE_POSITIONS[index].y,
  };
}

function makeDeclaration(city: CityKey, nodes: ImageNode[]) {
  const config = CITIES[city];
  const first = nodes[0]?.label || "一段记忆";
  const second =
    nodes.find((node) => node.category === "sensory" && node.id !== nodes[0]?.id)
      ?.label ||
    nodes[1]?.label ||
    "日常";

  if (city === "wuhan" && nodes.some((node) => node.label.includes("江"))) {
    return `${config.name}，是一座${first}留在身体里、${second}把三镇重新缝在一起的城市`;
  }
  return `${config.name}，是一座${first}留在身体里、${second}${config.declarationTail}的城市`;
}

function makePath(city: CityKey, answers: string[], nodes: ImageNode[]) {
  const routeAnswer = answers[1] || "";
  const route = routeAnswer.match(/从([^，。；]{1,10}).{0,5}(?:到|去)([^，。；]{1,10})/);
  if (route) {
    const middle =
      CITIES[city].signature.find(
        (term) => routeAnswer.includes(term) && term !== route[1] && term !== route[2],
      ) || nodes[2]?.label;
    return [route[1], middle, route[2]].filter(Boolean) as string[];
  }
  return nodes.slice(0, 4).map((node) => node.label);
}

export function analyzeCityImprint(
  city: CityKey,
  rawAnswers: string[],
): AnalysisResult {
  const answers = QUESTIONS.map(
    (_, index) => rawAnswers[index]?.trim() || FALLBACK_LABELS[index],
  );
  const allNodes = answers.map(calculateNode);
  const ranked = [...allNodes].sort(
    (left, right) =>
      right.importance + right.uniqueness - (left.importance + left.uniqueness),
  );
  const selectedIds = new Set(ranked.slice(0, 7).map((node) => node.id));
  const nodes = allNodes.filter((node) => selectedIds.has(node.id));

  const average = (values: number[]) =>
    clamp(values.reduce((total, value) => total + value, 0) / values.length);
  const signatureHits = CITIES[city].signature.filter((term) =>
    answers.some((answer) => answer.includes(term)),
  ).length;
  const concreteHits = countMatches(answers.join(""), CONCRETE_TERMS);
  const uniqueness = average(nodes.map((node) => node.uniqueness));
  const recognition = clamp(
    average(nodes.map((node) => node.importance)) + (answers.every(Boolean) ? 3 : 0),
  );
  const distinctiveness = clamp(
    60 + signatureHits * 4 + Math.min(14, concreteHits) - countMatches(answers.join(""), GENERIC_TERMS) * 4,
    52,
    96,
  );
  const dateCode = new Date()
    .toISOString()
    .slice(2, 10)
    .replaceAll("-", "");

  return {
    code: `${CITIES[city].romanized.slice(0, 3)}-${dateCode}-${String(
      answers.join("").length % 97,
    ).padStart(2, "0")}`,
    city: CITIES[city].name,
    cityKey: city,
    declaration: makeDeclaration(city, nodes),
    nodes,
    path: makePath(city, answers, nodes),
    scores: {
      recognition,
      uniqueness,
      distinctiveness,
    },
    footnote:
      uniqueness >= 82
        ? "你记住的不是地标，而是地标之间发生过的生活。"
        : "再多写一个具体的人、时间或身体感受，这张图会更像你。",
  };
}

export const localAnalysisProvider: AnalysisProvider = {
  async analyze(city, answers) {
    return analyzeCityImprint(city, answers);
  },
};
