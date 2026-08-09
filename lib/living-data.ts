import type {
  LifestyleAxis,
  LivingCircle,
  PlaceOption,
  PriorityCard,
  ProfessionHero,
  SceneDuel,
} from "./living-types";

export const AXIS_LABELS: Record<LifestyleAxis, string> = {
  convenience: "省心密度",
  calm: "安静余量",
  social: "人间热度",
  texture: "城市纹理",
  nature: "自然呼吸",
  exploration: "周末半径",
};

export const PROFESSION_HEROES: ProfessionHero[] = [
  {
    id: "technology",
    title: "代码筑城者",
    profession: "互联网 / 研发",
    motto: "把复杂留给工作，把生活还给自己。",
    icon: "⌘",
    defaultWork: {
      startTime: "09:30",
      endTime: "19:00",
      overtime: "sometimes",
      commuteMode: "transit",
      maxCommuteMinutes: 40,
    },
  },
  {
    id: "design",
    title: "灵感制造者",
    profession: "设计 / 内容",
    motto: "需要秩序，也需要街角不断发生新鲜事。",
    icon: "✦",
    defaultWork: {
      startTime: "10:00",
      endTime: "19:00",
      overtime: "sometimes",
      commuteMode: "transit",
      maxCommuteMinutes: 40,
    },
  },
  {
    id: "healthcare",
    title: "白衣守夜人",
    profession: "医护 / 健康",
    motto: "时间可能不规律，回家的路必须可靠。",
    icon: "+",
    defaultWork: {
      startTime: "08:00",
      endTime: "18:00",
      overtime: "often",
      commuteMode: "transit",
      maxCommuteMinutes: 30,
    },
  },
  {
    id: "education",
    title: "知识点灯人",
    profession: "教育 / 研究",
    motto: "平日专注，周末把时间慢慢打开。",
    icon: "¶",
    defaultWork: {
      startTime: "08:30",
      endTime: "17:30",
      overtime: "rare",
      commuteMode: "transit",
      maxCommuteMinutes: 35,
    },
  },
  {
    id: "finance",
    title: "数字掌舵者",
    profession: "金融 / 咨询",
    motto: "工作讲效率，生活要在下班后立刻开始。",
    icon: "↗",
    defaultWork: {
      startTime: "09:00",
      endTime: "19:30",
      overtime: "often",
      commuteMode: "transit",
      maxCommuteMinutes: 35,
    },
  },
  {
    id: "flexible",
    title: "城市游牧者",
    profession: "自由职业 / 灵活办公",
    motto: "没有固定工位，整座城市都是工作与生活的桌面。",
    icon: "∞",
    defaultWork: {
      startTime: "10:00",
      endTime: "18:00",
      overtime: "rare",
      commuteMode: "walking",
      maxCommuteMinutes: 30,
    },
  },
];

export const PRESET_PLACES: PlaceOption[] = [
  {
    id: "preset-optics",
    name: "光谷软件园",
    district: "洪山区",
    address: "关山大道与南湖大道附近",
    lng: 114.421,
    lat: 30.475,
    source: "fixture",
  },
  {
    id: "preset-hankou",
    name: "武汉天地商务区",
    district: "江岸区",
    address: "沿江大道与黄浦大街附近",
    lng: 114.309,
    lat: 30.607,
    source: "fixture",
  },
  {
    id: "preset-wuchang",
    name: "中南路商务区",
    district: "武昌区",
    address: "中南路地铁站附近",
    lng: 114.332,
    lat: 30.537,
    source: "fixture",
  },
];

export const SCENE_DUELS: SceneDuel[] = [
  {
    id: "late-return",
    chapter: "星期三 · 19:40",
    prompt: "忙完一天，你更希望回家路上发生什么？",
    options: [
      {
        id: "warm-street",
        title: "灯还亮着，饭还热着",
        detail: "不必做攻略，晚归也能在楼下好好吃顿饭。",
        time: "19:40",
        art: "street",
        deltas: { convenience: 18, social: 10 },
      },
      {
        id: "quiet-green",
        title: "先经过一段安静的树荫",
        detail: "让白天的噪声在进门前慢慢退下去。",
        time: "19:40",
        art: "green",
        deltas: { calm: 18, nature: 8 },
      },
    ],
  },
  {
    id: "daily-radius",
    chapter: "星期四 · 18:30",
    prompt: "哪一种便利，更接近你真正会使用的生活？",
    options: [
      {
        id: "downstairs",
        title: "步行十分钟，日常全部解决",
        detail: "菜场、药店、健身和晚饭都在熟悉的半径里。",
        time: "18:30",
        art: "blocks",
        deltas: { convenience: 20, calm: 3 },
      },
      {
        id: "metro-choice",
        title: "坐几站地铁，换更多选择",
        detail: "目的地值得出发，生活不必全挤在楼下。",
        time: "18:30",
        art: "metro",
        deltas: { exploration: 18, social: 5 },
      },
    ],
  },
  {
    id: "social-distance",
    chapter: "星期五 · 21:10",
    prompt: "这一刻，哪一边更像你想保留的能量？",
    options: [
      {
        id: "friends-nearby",
        title: "朋友一句话，就能临时见面",
        detail: "不用提前一周约，城市里总有人回应。",
        time: "21:10",
        art: "people",
        deltas: { social: 20, convenience: 6 },
      },
      {
        id: "private-room",
        title: "关上门，今晚只属于自己",
        detail: "附近可以热闹，但家必须有清楚的边界。",
        time: "21:10",
        art: "window",
        deltas: { calm: 20, texture: 3 },
      },
    ],
  },
  {
    id: "city-texture",
    chapter: "周六 · 09:20",
    prompt: "醒来以后，你更愿意走进哪一种街道？",
    options: [
      {
        id: "old-street",
        title: "熟摊、旧树和有来历的街角",
        detail: "城市不是背景，它会在日常里留下时间。",
        time: "09:20",
        art: "oldtown",
        deltas: { texture: 22, social: 4 },
      },
      {
        id: "new-order",
        title: "清楚、明亮、效率稳定的新街区",
        detail: "路线简单、设施齐全，生活不需要额外解释。",
        time: "09:20",
        art: "modern",
        deltas: { convenience: 14, calm: 8 },
      },
    ],
  },
  {
    id: "weekend-air",
    chapter: "周日 · 16:00",
    prompt: "一周快结束时，你更需要哪一种恢复？",
    options: [
      {
        id: "water-green",
        title: "走到水边，让视线变远",
        detail: "公园、湖岸或江滩，是生活里真实会去的空白。",
        time: "16:00",
        art: "river",
        deltas: { nature: 22, calm: 7 },
      },
      {
        id: "new-event",
        title: "去看一件本周没见过的事",
        detail: "展览、新店、演出，给下周留一点新话题。",
        time: "16:00",
        art: "gallery",
        deltas: { exploration: 20, texture: 8 },
      },
    ],
  },
  {
    id: "adaptive-rhythm",
    chapter: "加试 · 08:10",
    prompt: "如果只能长期保留一个，你会选哪边？",
    options: [
      {
        id: "known-breakfast",
        title: "老板记得你的那份早餐",
        detail: "重复不是无聊，是生活开始有了熟人和默契。",
        time: "08:10",
        art: "breakfast",
        deltas: { texture: 14, social: 12 },
      },
      {
        id: "fast-start",
        title: "出门即上路，不浪费一分钟",
        detail: "稳定交通和清楚路线，比邻里熟悉更重要。",
        time: "08:10",
        art: "commute",
        deltas: { convenience: 20, exploration: 3 },
      },
    ],
  },
];

export const WEEKDAY_CARDS: PriorityCard[] = [
  { id: "late-meal", title: "认真吃顿晚饭", detail: "晚归也不将就", icon: "饭", deltas: { convenience: 12, social: 4 } },
  { id: "exercise", title: "动一动", detail: "跑步、球场或健身", icon: "动", deltas: { nature: 7, convenience: 7 } },
  { id: "see-friend", title: "临时见个朋友", detail: "不需要跨城赴约", icon: "见", deltas: { social: 14 } },
  { id: "walk-home", title: "走一段再回家", detail: "把工作留在路上", icon: "走", deltas: { calm: 8, texture: 6 } },
  { id: "quiet-home", title: "安静窝回家", detail: "给自己完整一晚", icon: "静", deltas: { calm: 14 } },
  { id: "small-event", title: "看场电影或演出", detail: "平日也保留新鲜感", icon: "新", deltas: { exploration: 12, texture: 4 } },
];

export const WEEKEND_CARDS: PriorityCard[] = [
  { id: "slow-breakfast", title: "慢慢过早", detail: "熟悉摊位和一杯热饮", icon: "早", deltas: { texture: 9, social: 5 } },
  { id: "park", title: "去水边或公园", detail: "把视线放远", icon: "风", deltas: { nature: 14, calm: 4 } },
  { id: "market", title: "逛菜场做顿饭", detail: "把生活握在手里", icon: "菜", deltas: { convenience: 8, texture: 7 } },
  { id: "exhibition", title: "看展与新店", detail: "需要新的城市刺激", icon: "展", deltas: { exploration: 14 } },
  { id: "friends", title: "和朋友待半天", detail: "不计算结束时间", icon: "友", deltas: { social: 14 } },
  { id: "nothing", title: "什么也不安排", detail: "在家附近慢下来", icon: "空", deltas: { calm: 14 } },
];

type CircleSeed = Omit<LivingCircle, "catchmentRadiusKm">;

const seed = (circle: CircleSeed): LivingCircle => ({ ...circle, catchmentRadiusKm: 1.5 });

export const LIVING_CIRCLES: LivingCircle[] = [
  seed({ id: "future-tech", name: "未来科技城", district: "江夏区", tagline: "把研发园区通勤压短，让周末向东湖与光谷展开", center: { lng: 114.531, lat: 30.493 }, mapPosition: { x: 91, y: 68 }, features: { convenience: 72, calm: 73, social: 49, texture: 28, nature: 78, exploration: 61, transit: 86, lateFood: 62, walkability: 68 }, poi: { breakfast: "未来科技城园区早餐", evening: "光谷七路生活配套", nature: "武汉植物园光谷园区", culture: "未来科技城公共空间" } }),
  seed({ id: "guanshan", name: "关山大道", district: "洪山区", tagline: "高密度效率与年轻夜晚", center: { lng: 114.414, lat: 30.49 }, mapPosition: { x: 79, y: 67 }, features: { convenience: 91, calm: 42, social: 76, texture: 38, nature: 48, exploration: 70, transit: 78, lateFood: 92, walkability: 78 }, poi: { breakfast: "保利广场周边早餐铺", evening: "关山大道夜间餐饮", nature: "南湖绿道", culture: "光谷青年活动空间" } }),
  seed({ id: "software-park", name: "光谷软件园", district: "洪山区", tagline: "把通勤省下来的时间还给自己", center: { lng: 114.421, lat: 30.475 }, mapPosition: { x: 82, y: 72 }, features: { convenience: 80, calm: 50, social: 70, texture: 30, nature: 58, exploration: 58, transit: 70, lateFood: 84, walkability: 70 }, poi: { breakfast: "软件园园区早餐", evening: "软件园中路餐饮", nature: "汤逊湖沿岸", culture: "光谷创意街区" } }),
  seed({ id: "optics-valley", name: "光谷广场", district: "洪山区", tagline: "交通、商业与年轻人的交汇", center: { lng: 114.402, lat: 30.506 }, mapPosition: { x: 75, y: 62 }, features: { convenience: 90, calm: 34, social: 84, texture: 48, nature: 42, exploration: 82, transit: 94, lateFood: 94, walkability: 82 }, poi: { breakfast: "鲁巷广场早餐", evening: "世界城步行街", nature: "关山公园", culture: "光谷步行街" } }),
  seed({ id: "jiedaokou", name: "街道口", district: "洪山区", tagline: "大学、商业与不睡的街", center: { lng: 114.347, lat: 30.526 }, mapPosition: { x: 60, y: 58 }, features: { convenience: 94, calm: 28, social: 92, texture: 68, nature: 38, exploration: 92, transit: 95, lateFood: 97, walkability: 89 }, poi: { breakfast: "珞狮路过早铺", evening: "街道口夜食", nature: "武汉大学林荫道", culture: "大学片区书店与影院" } }),
  seed({ id: "huquan", name: "虎泉", district: "洪山区", tagline: "烟火日常与地铁便利并存", center: { lng: 114.371, lat: 30.518 }, mapPosition: { x: 66, y: 60 }, features: { convenience: 90, calm: 38, social: 84, texture: 72, nature: 38, exploration: 74, transit: 91, lateFood: 96, walkability: 87 }, poi: { breakfast: "虎泉街早餐摊", evening: "虎泉夜市", nature: "卓刀泉公园", culture: "虎泉老街" } }),
  seed({ id: "zhongnan", name: "中南路", district: "武昌区", tagline: "一站切换工作与城市生活", center: { lng: 114.333, lat: 30.537 }, mapPosition: { x: 56, y: 53 }, features: { convenience: 96, calm: 35, social: 84, texture: 62, nature: 45, exploration: 87, transit: 98, lateFood: 91, walkability: 90 }, poi: { breakfast: "中南二路早餐", evening: "中南商圈餐饮", nature: "洪山公园", culture: "中南剧场" } }),
  seed({ id: "xiaoguishan", name: "小龟山", district: "武昌区", tagline: "在市中心留一块安静坡地", center: { lng: 114.322, lat: 30.549 }, mapPosition: { x: 52, y: 49 }, features: { convenience: 78, calm: 78, social: 58, texture: 82, nature: 67, exploration: 70, transit: 85, lateFood: 66, walkability: 76 }, poi: { breakfast: "小龟山社区早餐", evening: "民主路家常菜", nature: "小龟山公园", culture: "昙华林街区" } }),
  seed({ id: "fruit-lake", name: "水果湖", district: "武昌区", tagline: "成熟、安静，日常自有秩序", center: { lng: 114.345, lat: 30.56 }, mapPosition: { x: 58, y: 46 }, features: { convenience: 84, calm: 74, social: 56, texture: 76, nature: 84, exploration: 63, transit: 78, lateFood: 66, walkability: 84 }, poi: { breakfast: "水果湖社区过早", evening: "东一路家常餐饮", nature: "水果湖与东湖岸线", culture: "省博与东湖文化片区" } }),
  seed({ id: "xudong", name: "徐东", district: "武昌区", tagline: "跨江、商业与社区生活的平衡点", center: { lng: 114.341, lat: 30.59 }, mapPosition: { x: 57, y: 36 }, features: { convenience: 91, calm: 48, social: 76, texture: 54, nature: 64, exploration: 73, transit: 91, lateFood: 86, walkability: 80 }, poi: { breakfast: "徐东社区早餐", evening: "销品茂周边餐饮", nature: "沙湖公园", culture: "湖北大学片区" } }),
  seed({ id: "jiyuqiao", name: "积玉桥", district: "武昌区", tagline: "江景、通勤与现代城市界面", center: { lng: 114.31, lat: 30.563 }, mapPosition: { x: 48, y: 43 }, features: { convenience: 89, calm: 57, social: 72, texture: 61, nature: 82, exploration: 78, transit: 96, lateFood: 78, walkability: 85 }, poi: { breakfast: "和平大道早餐铺", evening: "绿地缤纷城餐饮", nature: "武昌江滩", culture: "四美塘文化公园" } }),
  seed({ id: "liangdao", name: "粮道街", district: "武昌区", tagline: "把武汉的旧日常住进每天", center: { lng: 114.304, lat: 30.547 }, mapPosition: { x: 46, y: 50 }, features: { convenience: 88, calm: 35, social: 88, texture: 98, nature: 60, exploration: 92, transit: 76, lateFood: 90, walkability: 92 }, poi: { breakfast: "粮道街过早", evening: "胭脂路家常小馆", nature: "蛇山步道", culture: "昙华林与老城街巷" } }),
  seed({ id: "jianghan", name: "江汉路", district: "江汉区", tagline: "把整座城市放在步行范围", center: { lng: 114.293, lat: 30.582 }, mapPosition: { x: 43, y: 37 }, features: { convenience: 98, calm: 18, social: 98, texture: 90, nature: 70, exploration: 99, transit: 98, lateFood: 99, walkability: 98 }, poi: { breakfast: "统一街过早", evening: "江汉路夜间餐饮", nature: "汉口江滩", culture: "江汉关与历史街区" } }),
  seed({ id: "lihuangpi", name: "黎黄陂路", district: "江岸区", tagline: "老建筑、咖啡与江边的慢速切换", center: { lng: 114.303, lat: 30.594 }, mapPosition: { x: 46, y: 32 }, features: { convenience: 86, calm: 48, social: 85, texture: 99, nature: 78, exploration: 96, transit: 87, lateFood: 86, walkability: 97 }, poi: { breakfast: "胜利街早餐铺", evening: "一元路街区餐饮", nature: "汉口江滩", culture: "黎黄陂路历史街区" } }),
  seed({ id: "wuhan-tiandi", name: "武汉天地", district: "江岸区", tagline: "成熟社区与精致城市生活", center: { lng: 114.309, lat: 30.607 }, mapPosition: { x: 48, y: 27 }, features: { convenience: 94, calm: 56, social: 86, texture: 74, nature: 75, exploration: 90, transit: 92, lateFood: 91, walkability: 93 }, poi: { breakfast: "永清街社区早餐", evening: "武汉天地餐饮", nature: "汉口江滩", culture: "壹方与天地街区" } }),
  seed({ id: "taipei-road", name: "台北路", district: "江岸区", tagline: "成熟生活半径里的汉口烟火", center: { lng: 114.276, lat: 30.599 }, mapPosition: { x: 38, y: 30 }, features: { convenience: 92, calm: 49, social: 88, texture: 86, nature: 45, exploration: 82, transit: 83, lateFood: 95, walkability: 91 }, poi: { breakfast: "台北路社区早餐", evening: "台北路夜食", nature: "西北湖绿化广场", culture: "台北院子与老社区" } }),
  seed({ id: "cbd", name: "王家墩 CBD", district: "江汉区", tagline: "高效换乘与现代公园生活", center: { lng: 114.252, lat: 30.594 }, mapPosition: { x: 32, y: 32 }, features: { convenience: 92, calm: 61, social: 72, texture: 35, nature: 72, exploration: 72, transit: 98, lateFood: 80, walkability: 84 }, poi: { breakfast: "商务区早餐店", evening: "泛海城市广场餐饮", nature: "武汉 CBD 公园", culture: "商务区公共艺术" } }),
  seed({ id: "changqing", name: "常青花园", district: "东西湖区", tagline: "稳定社区、绿意和可预期的日常", center: { lng: 114.238, lat: 30.654 }, mapPosition: { x: 28, y: 14 }, features: { convenience: 83, calm: 85, social: 61, texture: 58, nature: 83, exploration: 48, transit: 90, lateFood: 68, walkability: 82 }, poi: { breakfast: "常青花园社区早餐", evening: "常青生活广场", nature: "常青公园", culture: "社区文化中心" } }),
  seed({ id: "gutian", name: "古田", district: "硚口区", tagline: "宽松生活与汉口西部的务实日常", center: { lng: 114.205, lat: 30.602 }, mapPosition: { x: 18, y: 29 }, features: { convenience: 80, calm: 69, social: 64, texture: 62, nature: 58, exploration: 52, transit: 88, lateFood: 73, walkability: 74 }, poi: { breakfast: "古田社区早餐", evening: "古田四路餐饮", nature: "张毕湖公园", culture: "汉口里街区" } }),
  seed({ id: "zhongjiacun", name: "钟家村", district: "汉阳区", tagline: "老汉阳的生活感与跨江便利", center: { lng: 114.266, lat: 30.549 }, mapPosition: { x: 35, y: 49 }, features: { convenience: 92, calm: 49, social: 84, texture: 88, nature: 74, exploration: 84, transit: 97, lateFood: 91, walkability: 91 }, poi: { breakfast: "西大街过早", evening: "钟家村夜间餐饮", nature: "汉阳江滩", culture: "古琴台与归元片区" } }),
  seed({ id: "wangjiawan", name: "王家湾", district: "汉阳区", tagline: "商圈效率与成熟社区并行", center: { lng: 114.208, lat: 30.559 }, mapPosition: { x: 19, y: 46 }, features: { convenience: 95, calm: 42, social: 80, texture: 52, nature: 45, exploration: 72, transit: 98, lateFood: 91, walkability: 83 }, poi: { breakfast: "王家湾社区早餐", evening: "摩尔城周边餐饮", nature: "龙阳湖公园", culture: "汉阳商圈活动" } }),
  seed({ id: "sixin", name: "四新", district: "汉阳区", tagline: "新社区、开阔尺度与公园日常", center: { lng: 114.228, lat: 30.515 }, mapPosition: { x: 24, y: 59 }, features: { convenience: 77, calm: 80, social: 55, texture: 25, nature: 82, exploration: 48, transit: 77, lateFood: 68, walkability: 67 }, poi: { breakfast: "四新社区早餐", evening: "四新生活区餐饮", nature: "墨水湖公园", culture: "汉阳公共文化空间" } }),
];

export const FIXTURE_SEARCH_PLACES: PlaceOption[] = [
  {
    id: "verified-huawei-wuhan-research",
    name: "华为武汉研究所",
    district: "江夏区",
    address: "九峰三路 207 号（公开地图校验位置）",
    lng: 114.535074,
    lat: 30.49298,
    source: "fixture" as const,
  },
  {
    id: "verified-huawei-wuhan-base-b",
    name: "华为武汉研究所 B 区",
    district: "江夏区",
    address: "九峰三路与光谷七路附近（公开地图校验位置）",
    lng: 114.53036,
    lat: 30.49264,
    source: "fixture" as const,
  },
  ...PRESET_PLACES,
  ...LIVING_CIRCLES.map((circle) => ({
    id: `circle-${circle.id}`,
    name: circle.name,
    district: circle.district,
    address: `${circle.name}生活圈中心`,
    ...circle.center,
    source: "fixture" as const,
  })),
];
