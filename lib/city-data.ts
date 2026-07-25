import type { CityConfig, CityKey, Question } from "./types";

export const CITIES: Record<CityKey, CityConfig> = {
  wuhan: {
    name: "武汉",
    romanized: "WUHAN",
    caption: "两江三镇",
    signature: ["江", "桥", "轮渡", "汉口", "武昌", "热干面", "过早", "里份"],
    declarationTail: "被江水切开，又被日常重新缝合",
  },
  beijing: {
    name: "北京",
    romanized: "BEIJING",
    caption: "城门与胡同",
    signature: ["胡同", "中轴线", "环路", "城墙", "西山", "豆汁", "大院", "地铁"],
    declarationTail: "在秩序与生活的缝隙里慢慢展开",
  },
  shanghai: {
    name: "上海",
    romanized: "SHANGHAI",
    caption: "弄堂与江岸",
    signature: ["弄堂", "梧桐", "黄浦江", "苏州河", "石库门", "沪语", "早咖", "地铁"],
    declarationTail: "把细密的日常折进流动的街道",
  },
  chengdu: {
    name: "成都",
    romanized: "CHENGDU",
    caption: "茶馆与雨雾",
    signature: ["茶馆", "盖碗茶", "坝坝", "串串", "麻将", "锦江", "龙门阵", "盆地"],
    declarationTail: "让时间在潮湿与热闹之间松下来",
  },
  guangzhou: {
    name: "广州",
    romanized: "GUANGZHOU",
    caption: "骑楼与榕荫",
    signature: ["骑楼", "珠江", "早茶", "粤语", "榕树", "糖水", "城中村", "凉茶"],
    declarationTail: "在湿热空气里保留自己的生活尺度",
  },
};

export const QUESTIONS: Question[] = [
  {
    id: "first-frame",
    shortTitle: "第一帧",
    category: "emotional",
    kicker: "不要想景点，先等一个画面浮上来。",
    prompt: "闭上眼睛想到{city}，最先出现的画面是什么？",
    help: "可以是一个地点、一段动作，或某个很普通的瞬间。",
    placeholder: "例如：凌晨过江时，出租车窗外的灯被雨拉得很长……",
  },
  {
    id: "route",
    shortTitle: "一条路",
    category: "spatial",
    kicker: "一条真实走过的路，比完整地图更接近你。",
    prompt: "如果带一个重要的人认识{city}，你会带 TA 从哪里走到哪里？",
    help: "写出起点、终点，以及你为什么选这条路线。",
    placeholder: "例如：从老街的早餐摊走到江边，绕开游客最多的那条路……",
  },
  {
    id: "body",
    shortTitle: "身体记忆",
    category: "sensory",
    kicker: "身体通常比语言更早记住一座城市。",
    prompt: "{city}留在你身体上的感觉，是什么？",
    help: "想想声音、气味、温度、风、光线或皮肤触感。",
    placeholder: "例如：潮气贴在后背，空调外机的热风突然扑过来……",
  },
  {
    id: "local-code",
    shortTitle: "地方密码",
    category: "cultural",
    kicker: "有些词一开口，城市就出现了。",
    prompt: "有什么说法、味道或习惯，是你心里{city}的地方密码？",
    help: "不必解释得很完整，最好补上它出现的场景。",
    placeholder: "例如：老板催你快点，却顺手给你多装了一份……",
  },
  {
    id: "people",
    shortTitle: "人与人",
    category: "social",
    kicker: "城市性格常藏在陌生人如何相处里。",
    prompt: "在{city}，哪个人与人相处的瞬间让你印象很深？",
    help: "可以是善意、距离感、争执、默契，或一句没说出口的话。",
    placeholder: "例如：问路的人语气很冲，但一直把我送到路口……",
  },
  {
    id: "time",
    shortTitle: "它最像自己",
    category: "sensory",
    kicker: "一座城市在不同时间，会变成不同的物种。",
    prompt: "什么时候的{city}，最像它自己？",
    help: "可以是一天中的时刻，也可以是季节、天气或某个节日。",
    placeholder: "例如：梅雨季的傍晚，路灯刚亮，树叶像刷了一层油……",
  },
  {
    id: "absence",
    shortTitle: "不能拿走",
    category: "emotional",
    kicker: "拿掉最重要的东西，城市的骨架才会显出来。",
    prompt: "如果拿走一样东西，{city}就不再是你认识的那座城，会是什么？",
    help: "它可以是实体，也可以是一种口音、节奏或生活方式。",
    placeholder: "例如：不是某座地标，而是大家愿意在街边坐下来的习惯……",
  },
  {
    id: "my-story",
    shortTitle: "我的证据",
    category: "narrative",
    kicker: "最后，把城市和你自己系在一起。",
    prompt: "讲一个只有你和{city}知道的小故事。",
    help: "第一次到达、一次告别、某段通勤，或一个从未告诉别人的地点。",
    placeholder: "例如：离开那天，我故意提前一站下车，又走了一遍每天回家的路……",
  },
];

const wuhanAnswers = [
  "凌晨从汉口回武昌，出租车上桥以后我会把车窗开一条缝。江风很硬，灯在黑水里抖，像这座城还没睡。",
  "我会从粮道街吃完一碗热干面，穿过昙华林，再坐轮渡去汉口江滩。不是为了景点，是想让他体会一次从一座城抵达另一座城。",
  "夏天一出地铁，眼镜会立刻起雾，衣服贴在后背。空气里有潮气、油锅和香樟树被晒热后的味道。",
  "是“过早”。它不是早餐这个名词，而是端着碗站在路边，老板一边催你莫挡路，一边把面窝塞进袋子里。",
  "有次我问路，大叔嫌我说不清楚，语气像在吵架，最后却骑着电动车把我带了两个路口。嘴硬和热心同时发生。",
  "暴雨前的傍晚最像武汉。天突然压得很低，江面发白，所有人都知道雨要来了，却还在加快脚步过桥。",
  "拿走长江和过江这件事，武汉就不再是武汉。不是少了一条水，而是少了三镇之间那种遥远又不得不彼此抵达的关系。",
  "刚来武汉工作时，我每天从武昌坐公交去汉口。辞职那天我没有刷地铁，重新坐了一次轮渡，站在船尾看住过的那一边慢慢变小。",
];

function genericAnswers(city: CityKey): string[] {
  const config = CITIES[city];
  const [first, second, third, fourth] = config.signature;
  return [
    `傍晚从${first}旁边走过，天色刚暗，路上的声音忽然变得很近，那一刻我觉得这就是${config.name}。`,
    `我会从旧城区慢慢走到${second}，中间故意穿过一条没有景点的小路，让他先看到这里的人怎么生活。`,
    `夏天空气贴在皮肤上，街边的声音、树影和刚出锅的食物气味混在一起，是离开后还会突然想起的体感。`,
    `${third}不是一个可以单独解释的词，它要和早晨的店铺、熟客的招呼声放在一起，才是我认识的${config.name}。`,
    `有次陌生人嘴上说得很直接，最后却多走了一段替我带路。这里的善意常常不包装，做完就走了。`,
    `下过雨的傍晚最像它自己。路面反光，店铺刚亮灯，人群开始从通勤变回生活。`,
    `如果拿走${fourth}以及围绕它形成的生活节奏，${config.name}会变成一个名字还在、气质却消失的地方。`,
    `离开前我重新走了一次每天回家的路，没有拍照。后来最常想起的，反而是一个等红灯的普通路口。`,
  ];
}

export const SAMPLE_ANSWERS: Record<CityKey, string[]> = {
  wuhan: wuhanAnswers,
  beijing: genericAnswers("beijing"),
  shanghai: genericAnswers("shanghai"),
  chengdu: genericAnswers("chengdu"),
  guangzhou: genericAnswers("guangzhou"),
};
