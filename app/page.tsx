"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  PRESET_PLACES,
  PROFESSION_HEROES,
  SCENE_DUELS,
  WEEKDAY_CARDS,
  WEEKEND_CARDS,
} from "../lib/living-data";
import { FACILITY_FILTERS } from "../lib/map-data";
import { applyFeedback, recommendLivingCircles } from "../lib/recommender";
import { buildReplanDelta } from "../lib/replan";
import { shareLivingCover } from "../lib/living-export";
import type {
  FeedbackAdjustment,
  FacilityCategory,
  LifestyleAxis,
  MapContext,
  PersonalAnchor,
  PlaceOption,
  ProfessionId,
  Recommendation,
  RecommendationEvidence,
  RecommendationResult,
  UserProfile,
} from "../lib/living-types";
import type { QuickTuneKind, ReplanDelta } from "../lib/replan";

type Screen =
  | "intro"
  | "hero"
  | "anchors"
  | "scenes"
  | "edit"
  | "mirror"
  | "developing"
  | "result";

const INITIAL_HERO = PROFESSION_HEROES[0];

function freshProfile(): UserProfile {
  return {
    profession: INITIAL_HERO.id,
    workPattern: { ...INITIAL_HERO.defaultWork },
    officeLocation: PRESET_PLACES[0],
    optionalAnchors: [],
    sceneChoices: [],
    weekdayPriorities: [],
    weekendPriorities: [],
    axisAdjustments: {},
  };
}

function judgeProfile(): UserProfile {
  const hero = PROFESSION_HEROES.find((item) => item.id === "design") ?? INITIAL_HERO;
  return {
    profession: hero.id,
    workPattern: { ...hero.defaultWork, endTime: "19:30", maxCommuteMinutes: 40 },
    officeLocation: PRESET_PLACES[0],
    optionalAnchors: [{ id: "judge-anchor", label: "常见的朋友", place: PRESET_PLACES[2] }],
    sceneChoices: SCENE_DUELS.map((scene, index) => ({ sceneId: scene.id, optionId: scene.options[index % 2].id })),
    weekdayPriorities: ["late-meal", "walk-home", "see-friend"],
    weekendPriorities: ["slow-breakfast", "park", "exhibition"],
    axisAdjustments: {},
  };
}

const CHAPTERS = [
  { id: "reality", label: "现实", screens: ["hero", "anchors"] },
  { id: "trial", label: "试住", screens: ["scenes", "edit", "mirror"] },
  { id: "reveal", label: "显影", screens: ["developing", "result"] },
] as const;

function Brand() {
  return (
    <div className="brand" aria-label="城市潜像">
      <span className="brand-seal">潜</span>
      <span>
        <strong>城市潜像</strong>
        <small>LIVE INTO MY DAY</small>
      </span>
    </div>
  );
}

function CatCompanion({
  line,
  variant = "dock",
}: {
  line: string;
  variant?: "dock" | "result" | "inline";
}) {
  return (
    <aside className={`cat-companion cat-${variant}`} aria-live="polite" aria-label="猫猫生活向导">
      <div className="cat-portrait"><img src="/cat-guide-potential.png" alt="举起前爪、好奇地陪用户探索武汉生活圈的黑白猫向导" /></div>
      <div className="cat-bubble"><small>猫猫观察员 · 潜潜</small><p>{line}</p></div>
    </aside>
  );
}

function ShellHeader({ screen, judgeMode, onReset }: { screen: Screen; judgeMode: boolean; onReset: () => void }) {
  const active = CHAPTERS.findIndex((chapter) => chapter.screens.includes(screen as never));
  return (
    <header className="site-header">
      <Brand />
      {screen !== "intro" ? (
        <nav className="chapter-nav" aria-label="体验章节">
          {CHAPTERS.map((chapter, index) => (
            <span key={chapter.id} className={index === active ? "active" : index < active ? "done" : ""}>
              <i>{index < active ? "✓" : `0${index + 1}`}</i>
              {chapter.label}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="header-side">
        {judgeMode ? <span className="judge-badge">JUDGE · 90 SEC</span> : null}
        <span className="privacy"><i />刷新即清除</span>
        {screen !== "intro" ? <button className="link-button" onClick={onReset}>重新开始</button> : null}
      </div>
    </header>
  );
}

function Intro({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return (
    <main className="intro-screen">
      <div className="intro-grid">
        <section className="intro-copy">
          <p className="issue-line"><span>武汉生活实验 · 01</span><span>EXPLAINABLE RELOCATION AGENT</span></p>
          <h1>先别选房，<br />先试住<span>一天。</span></h1>
          <p className="intro-lead">
            工作把你带到武汉，生活应该把你留在哪里？不用填长问卷，做几次真实取舍，让适合你的生活圈自己显影。
          </p>
          <div className="intro-actions">
            <button className="primary-button" onClick={onStart}>进入试住 <span>↗</span></button>
            <button className="ghost-button judge-entry" onClick={onDemo}><b>90 秒评委模式</b><small>JUDGE DEMO →</small></button>
          </div>
          <div className="intro-promises">
            <span>不是房源广告</span><span>不保存地址</span><span>结果可校正</span>
          </div>
        </section>
        <section className="cover-art" aria-label="生活圈杂志封面示意">
          <div className="cover-top"><span>PRIVATE ISSUE</span><span>WH / 027</span></div>
          <p className="cover-kicker">CITY AFTERIMAGE</p>
          <h2>住进<br />我的一天</h2>
          <div className="cover-map">
            <i className="river river-a" /><i className="river river-b" />
            <span className="map-ring ring-a" /><span className="map-ring ring-b" /><span className="map-ring ring-c" />
            <b className="map-dot dot-a">工作</b><b className="map-dot dot-b">晚饭</b><b className="map-dot dot-c">周末</b>
          </div>
          <p className="cover-quote">“让普通的一天，成为选择城市的证据。”</p>
          <div className="cover-sticker">WUHAN<br />LIFE<br />CIRCLE</div>
        </section>
      </div>
      <div className="method-ticker" aria-hidden="true">
        <span>选择职业英雄</span><b>→</b><span>试住生活片段</span><b>→</b><span>确认生活潜像</span><b>→</b><span>揭晓三个生活圈</span>
      </div>
    </main>
  );
}

function StepHeading({ label, title, intro }: { label: string; title: string; intro: string }) {
  return (
    <div className="step-heading">
      <p>{label}</p>
      <h1>{title}</h1>
      <span>{intro}</span>
    </div>
  );
}

function HeroStep({
  profile,
  onHero,
  onWork,
  onNext,
}: {
  profile: UserProfile;
  onHero: (id: ProfessionId) => void;
  onWork: (work: Partial<UserProfile["workPattern"]>) => void;
  onNext: () => void;
}) {
  return (
    <main className="flow-page hero-step">
      <StepHeading label="现实 / 选择英雄" title="你以什么身份来到武汉？" intro="称号负责开场，真实班表才负责推荐。选择后请把默认节奏改成你的实际情况。" />
      <section className="hero-card-grid">
        {PROFESSION_HEROES.map((hero) => (
          <button key={hero.id} className={profile.profession === hero.id ? "hero-card selected" : "hero-card"} onClick={() => onHero(hero.id)} aria-pressed={profile.profession === hero.id}>
            <span className="hero-icon">{hero.icon}</span>
            <small>{hero.profession}</small>
            <strong>{hero.title}</strong>
            <p>{hero.motto}</p>
            <i>{profile.profession === hero.id ? "已选择" : "选择此英雄"}</i>
          </button>
        ))}
      </section>
      <section className="work-calibration">
        <div><small>真人校准</small><h2>职业不是性格，请告诉我真实的一天。</h2></div>
        <label>到岗<input type="time" value={profile.workPattern.startTime} onChange={(event) => onWork({ startTime: event.target.value })} /></label>
        <label>下班<input type="time" value={profile.workPattern.endTime} onChange={(event) => onWork({ endTime: event.target.value })} /></label>
        <label>加班<select value={profile.workPattern.overtime} onChange={(event) => onWork({ overtime: event.target.value as UserProfile["workPattern"]["overtime"] })}><option value="rare">很少</option><option value="sometimes">偶尔</option><option value="often">经常</option></select></label>
        <button className="primary-button compact" onClick={onNext}>钉住现实坐标 <span>→</span></button>
      </section>
    </main>
  );
}

function PlaceSearch({
  title,
  selected,
  onSelect,
  showPresets = false,
}: {
  title: string;
  selected?: PlaceOption;
  onSelect: (place: PlaceOption) => void;
  showPresets?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<PlaceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"live" | "fixture" | null>(null);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(query.trim())}`);
      const payload = (await response.json()) as { places: PlaceOption[]; mode: "live" | "fixture" };
      setPlaces(payload.places);
      setMode(payload.mode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="place-search">
      <div className="place-label"><span>{title}</span>{selected ? <small>已定位 · {selected.source === "amap" ? "高德实时地图" : selected.id.startsWith("verified-") ? "公开地图校验" : "演示数据"}</small> : null}</div>
      <form onSubmit={search}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入公司、地铁站或地址" aria-label={`${title}地址`} />
        <button type="submit" disabled={loading}>{loading ? "定位中" : "搜索"}</button>
      </form>
      {showPresets ? <div className="preset-row">{PRESET_PLACES.map((place) => <button key={place.id} onClick={() => onSelect(place)} className={selected?.id === place.id ? "active" : ""}>{place.name}</button>)}</div> : null}
      {places.length ? <div className="search-results" role="listbox" aria-label="地址搜索结果">
        <p>{mode === "live" ? "高德实时结果（校验地点优先）" : places.some((place) => place.id.startsWith("verified-")) ? "公开地图校验结果" : "演示定位结果"}</p>
        {places.map((place) => <button key={place.id} onClick={() => { onSelect(place); setPlaces([]); setQuery(place.name); }}><strong>{place.name}{place.id.startsWith("verified-") ? <i>已校验</i> : null}</strong><span>{place.district} · {place.address}</span></button>)}
      </div> : null}
      {selected ? <div className="selected-place"><i /> <strong>{selected.name}</strong><span>{selected.district} · {selected.address}</span></div> : null}
    </div>
  );
}

function AnchorStep({
  profile,
  anchorSlots,
  onOffice,
  onAnchorSlots,
  onAnchor,
  onAnchorLabel,
  onWork,
  onBack,
  onNext,
}: {
  profile: UserProfile;
  anchorSlots: number;
  onOffice: (place: PlaceOption) => void;
  onAnchorSlots: (count: number) => void;
  onAnchor: (index: number, place: PlaceOption) => void;
  onAnchorLabel: (index: number, label: string) => void;
  onWork: (work: Partial<UserProfile["workPattern"]>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <main className="flow-page anchor-step">
      <StepHeading label="现实 / 放置锚点" title="先钉住不能移动的东西。" intro="公司决定每天的起点；重要的人和地方，决定一座城里什么值得靠近。" />
      <div className="anchor-layout">
        <section className="address-panel">
          <PlaceSearch title="01 · 公司地址（必填）" selected={profile.officeLocation} onSelect={onOffice} showPresets />
          <div className="commute-controls">
            <label>主要通勤方式<select value={profile.workPattern.commuteMode} onChange={(event) => onWork({ commuteMode: event.target.value as UserProfile["workPattern"]["commuteMode"] })}><option value="transit">公共交通</option><option value="walking">步行</option><option value="cycling">骑行</option><option value="driving">驾车</option></select></label>
            <label>最长能接受<strong>{profile.workPattern.maxCommuteMinutes} 分钟</strong><input type="range" min="15" max="75" step="5" value={profile.workPattern.maxCommuteMinutes} onChange={(event) => onWork({ maxCommuteMinutes: Number(event.target.value) })} /></label>
          </div>
          {Array.from({ length: anchorSlots }).map((_, index) => {
            const anchor = profile.optionalAnchors[index];
            return <div className="optional-anchor" key={index}>
              <div className="anchor-title-row"><input value={anchor?.label ?? (index === 0 ? "重要的人" : "常去的地方")} onChange={(event) => onAnchorLabel(index, event.target.value)} aria-label={`锚点 ${index + 1} 标签`} /><button onClick={() => onAnchorSlots(anchorSlots - 1)}>移除</button></div>
              <PlaceSearch title={`0${index + 2} · 可选生活锚点`} selected={anchor?.place} onSelect={(place) => onAnchor(index, place)} />
            </div>;
          })}
          {anchorSlots < 2 ? <button className="add-anchor" onClick={() => onAnchorSlots(anchorSlots + 1)}>＋ 添加一个想靠近的人或地方</button> : null}
        </section>
        <aside className="anchor-map" aria-label="空间锚点示意">
          <div className="coordinate-grid" /><i className="map-river river-one" /><i className="map-river river-two" />
          <span className="anchor-pin office-pin"><b>工作</b><small>{profile.officeLocation.name}</small></span>
          {profile.optionalAnchors.slice(0, anchorSlots).map((anchor, index) => <span className={`anchor-pin life-pin pin-${index}`} key={anchor.id}><b>{anchor.label}</b><small>{anchor.place.name}</small></span>)}
          <p>地点只用于本次计算，刷新后清除。使用实时搜索时，查询会发送给高德地图。</p>
        </aside>
      </div>
      <div className="flow-actions"><button className="back-button" onClick={onBack}>← 返回</button><button className="primary-button compact" onClick={onNext}>开始试住 <span>→</span></button></div>
    </main>
  );
}

function SceneArt({ type }: { type: string }) {
  return <div className={`scene-art art-${type}`} aria-hidden="true">
    <i className="art-label">WUHAN / ORDINARY DAY</i>
    <span className="art-atmosphere" />
    <span className="art-object object-a" />
    <span className="art-object object-b" />
    <span className="art-object object-c" />
    <span className="art-ground" />
    <span className="art-figure figure-a" />
    <span className="art-figure figure-b" />
  </div>;
}

function GrowingRail({ profile }: { profile: UserProfile }) {
  const picked = profile.sceneChoices
    .map((choice) => SCENE_DUELS.find((scene) => scene.id === choice.sceneId)?.options.find((option) => option.id === choice.optionId)?.title)
    .filter(Boolean) as string[];
  return <aside className="growing-rail" aria-live="polite"><p>正在形成的生活潜像</p><div className="signal-orbit"><i /><i /><i /><span>{picked.length || "·"}</span></div><div className="growing-tags">{picked.slice(-4).map((item) => <span key={item}>{item}</span>)}{!picked.length ? <small>每次取舍，都会留下一个信号。</small> : null}</div><b>{picked.length ? `已留下 ${picked.length} 条生活证据` : "地名将在最后显影"}</b></aside>;
}

function SceneStep({
  profile,
  index,
  onChoose,
  onSkip,
  onBack,
}: {
  profile: UserProfile;
  index: number;
  onChoose: (optionId: string) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const scene = SCENE_DUELS[index];
  return (
    <main className="scene-page">
      <section className="scene-stage">
        <div className="scene-heading"><p>{scene.chapter}</p><h1>{scene.prompt}</h1><span>别选更正确的，选你真的会长期使用的。</span></div>
        <div className="duel-grid">
          {scene.options.map((option, optionIndex) => <button className="scene-option" key={option.id} onClick={() => onChoose(option.id)}>
            <SceneArt type={option.art} />
            <div className="scene-copy"><small>{option.time} · 选择 {optionIndex === 0 ? "A" : "B"}</small><h2>{option.title}</h2><p>{option.detail}</p><span>住进这一边 ↗</span></div>
          </button>)}
        </div>
        <div className="scene-controls"><button onClick={onBack}>← 上一步</button><span>{Array.from({ length: SCENE_DUELS.length }).map((_, dot) => <i key={dot} className={dot <= index ? "active" : ""} />)}</span><button onClick={onSkip}>这一幕不确定，跳过 →</button></div>
      </section>
      <GrowingRail profile={profile} />
    </main>
  );
}

function PriorityPicker({
  title,
  subtitle,
  cards,
  selected,
  onToggle,
}: {
  title: string;
  subtitle: string;
  cards: typeof WEEKDAY_CARDS;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return <section className="priority-section"><div className="priority-title"><div><small>{subtitle}</small><h2>{title}</h2></div><span>{selected.length} / 3 已选择</span></div><div className="priority-grid">{cards.map((card) => { const order = selected.indexOf(card.id); return <button key={card.id} className={order >= 0 ? "selected" : ""} onClick={() => onToggle(card.id)} aria-pressed={order >= 0}><i>{order >= 0 ? order + 1 : card.icon}</i><strong>{card.title}</strong><span>{card.detail}</span></button>; })}</div></section>;
}

function EditDayStep({
  profile,
  onToggle,
  onBack,
  onGenerate,
  loading,
}: {
  profile: UserProfile;
  onToggle: (kind: "weekday" | "weekend", id: string) => void;
  onBack: () => void;
  onGenerate: () => void;
  loading: boolean;
}) {
  const ready = profile.weekdayPriorities.length === 3 && profile.weekendPriorities.length === 3;
  return <main className="flow-page edit-step"><StepHeading label="试住 / 剪辑一天" title="时间有限，你真正舍不得什么？" intro="不是制定完美计划。每一边只能留下三个片段，选择顺序也会成为偏好证据。" /><PriorityPicker title="一个普通的工作日晚间" subtitle="WED · AFTER WORK" cards={WEEKDAY_CARDS} selected={profile.weekdayPriorities} onToggle={(id) => onToggle("weekday", id)} /><PriorityPicker title="一个不赶时间的周末上午" subtitle="SAT · SLOW HOURS" cards={WEEKEND_CARDS} selected={profile.weekendPriorities} onToggle={(id) => onToggle("weekend", id)} /><div className="flow-actions"><button className="back-button" onClick={onBack}>← 回到上一幕</button><button className="primary-button compact" onClick={onGenerate} disabled={!ready || loading}>{loading ? "正在读取生活信号…" : "看看你想过的生活"} <span>→</span></button></div></main>;
}

function MirrorStep({
  result,
  judgeMode,
  onAdjust,
  onBack,
  onReveal,
}: {
  result: RecommendationResult;
  judgeMode: boolean;
  onAdjust: (axis: LifestyleAxis, delta: number) => void;
  onBack: () => void;
  onReveal: () => void;
}) {
  return <main className="mirror-page">
    {judgeMode ? <section className="judge-guide" aria-label="Judge mode step one"><b>JUDGE MODE · STEP 1 / 3</b><span>Read the life profile before any neighborhood name is revealed.</span><p>先判断“这像不像我”，避免被熟悉地名反向影响选择。</p></section> : null}
    <div className="mirror-eyebrow">地点揭晓之前 / 先审一遍这份生活初稿</div>
    <section className="mirror-card">
      <div className="mirror-signal"><i />{result.afterimage.evidence[0]}</div>
      <p className="mirror-label">你的生活潜像</p>
      <h1>“{result.afterimage.declaration}”</h1>
      <div className="mirror-statements">
        {result.afterimage.axes.map((axis, index) => {
          const level = axis.value >= 72 ? "核心偏好" : axis.value >= 55 ? "有所偏爱" : "仍可调整";
          return <article key={axis.id}>
            <span className="statement-index">0{index + 1}</span>
            <div><small>{axis.label} · {level}</small><strong>{axis.phrase}</strong><p>来自你的场景选择与一天剪辑</p></div>
            <aside><button onClick={() => onAdjust(axis.id, 8)} aria-label={`${axis.phrase}很像我`}>像我</button><button onClick={() => onAdjust(axis.id, -8)} aria-label={`${axis.phrase}不像我`}>不像我</button></aside>
          </article>;
        })}
      </div>
      <div className="constraint-row"><b>现实底线</b>{result.afterimage.hardConstraints.map((item) => <span key={item}>{item}</span>)}</div>
    </section>
    <p className="mirror-help">不用修改参数。哪句话不成立，就直接告诉我们“不像我”。确认之后，武汉地名才会出现。</p>
    <div className="mirror-actions"><button className="back-button" onClick={onBack}>← 再想想</button><button className="primary-button" onClick={onReveal}>{judgeMode ? "揭晓三个生活圈" : "确认，这是我"} <span>{judgeMode ? "REVEAL →" : "开始显影 ↗"}</span></button></div>
  </main>;
}

function Developing() {
  return <main className="developing-page" aria-live="polite"><div className="developing-sheet"><span className="wash wash-a" /><span className="wash wash-b" /><span className="wash wash-c" /><i className="develop-river" /><div className="develop-copy"><small>DEVELOPING YOUR WUHAN</small><h1>生活正在<br />地图上显影</h1><p>先放入现实，再让向往找到位置。</p></div></div></main>;
}

function fitLabel(score: number) {
  if (score >= 85) return "高度合拍";
  if (score >= 83) return "合拍";
  if (score >= 80) return "有潜力";
  return "值得试住";
}

function worldPoint(point: { lng: number; lat: number }, zoom: number) {
  const size = 256 * 2 ** zoom;
  const sin = Math.sin((point.lat * Math.PI) / 180);
  return {
    x: ((point.lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
}

function mapPercent(point: { lng: number; lat: number }, center: { lng: number; lat: number }, zoom: number) {
  const origin = worldPoint(center, zoom);
  const target = worldPoint(point, zoom);
  return {
    left: 50 + ((target.x - origin.x) / 750) * 100,
    top: 50 + ((target.y - origin.y) / 500) * 100,
  };
}

function OsmTileLayer({ center, zoom, onError }: { center: { lng: number; lat: number }; zoom: number; onError: () => void }) {
  const world = worldPoint(center, zoom);
  const centerTileX = Math.floor(world.x / 256);
  const centerTileY = Math.floor(world.y / 256);
  const tiles = [];
  for (let y = centerTileY - 2; y <= centerTileY + 2; y += 1) {
    for (let x = centerTileX - 2; x <= centerTileX + 2; x += 1) {
      tiles.push({ x, y });
    }
  }
  return <div className="osm-tile-layer" aria-hidden="true">{tiles.map((tile) => {
    const left = 50 + (((tile.x * 256) - world.x) / 750) * 100;
    const top = 50 + (((tile.y * 256) - world.y) / 500) * 100;
    return <img
      key={`${zoom}-${tile.x}-${tile.y}`}
      src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
      alt=""
      onError={onError}
      style={{ left: `${left}%`, top: `${top}%` }}
    />;
  })}</div>;
}

function facilityMark(category: FacilityCategory) {
  return FACILITY_FILTERS.find((item) => item.id === category)?.mark ?? "点";
}

type MapEvidenceStatus = { context: MapContext | null; loading: boolean; failed: boolean };

function RealLifeMap({ active, onStatus }: { active: Recommendation; onStatus?: (status: MapEvidenceStatus) => void }) {
  const [contextState, setContextState] = useState<{ circleId: string; value: MapContext | null; failed: boolean } | null>(null);
  const [category, setCategory] = useState<FacilityCategory | "all">("all");
  const [zoom, setZoom] = useState(15);
  const [mapError, setMapError] = useState<{ circleId: string; count: number }>({ circleId: "", count: 0 });

  useEffect(() => {
    let current = true;
    onStatus?.({ context: null, loading: true, failed: false });
    fetch(`/api/map/context?circleId=${encodeURIComponent(active.circle.id)}`)
      .then((response) => {
        if (!response.ok) throw new Error("map context unavailable");
        return response.json() as Promise<MapContext>;
      })
      .then((payload) => {
        if (current) {
          setContextState({ circleId: active.circle.id, value: payload, failed: false });
          onStatus?.({ context: payload, loading: false, failed: false });
        }
      })
      .catch(() => {
        if (current) {
          setContextState({ circleId: active.circle.id, value: null, failed: true });
          onStatus?.({ context: null, loading: false, failed: true });
        }
      });
    return () => { current = false; };
  }, [active.circle.id, onStatus]);

  const loading = contextState?.circleId !== active.circle.id;
  const context = loading ? null : contextState?.value ?? null;
  const mapErrorCount = mapError.circleId === active.circle.id ? mapError.count : 0;
  const recordMapError = () => setMapError((current) => current.circleId === active.circle.id ? { ...current, count: current.count + 1 } : { circleId: active.circle.id, count: 1 });
  const facilities = (context?.facilities ?? []).filter((item) => category === "all" || item.category === category);
  const plotted = facilities.filter((item) => item.coordinate);
  const unplotted = facilities.filter((item) => !item.coordinate);
  const radiusPixels = context ? 1500 / ((Math.cos((context.center.lat * Math.PI) / 180) * 156543.03392) / 2 ** zoom) : 0;

  return <section className="real-map" aria-label={`${active.circle.name}真实路网与公共设施`}>
    <div className="map-toolbar">
      <div><small>以真实坐标为中心</small><strong>{active.circle.name} · 约 1.5 km 生活半径</strong></div>
      <div className="map-zoom" aria-label="地图缩放"><button onClick={() => setZoom((value) => Math.max(13, value - 1))} aria-label="缩小地图">−</button><span>{zoom}</span><button onClick={() => setZoom((value) => Math.min(17, value + 1))} aria-label="放大地图">＋</button></div>
    </div>
    <div className="facility-filters" aria-label="筛选周边公共设施">{FACILITY_FILTERS.map((filter) => <button key={filter.id} className={category === filter.id ? "active" : ""} aria-pressed={category === filter.id} onClick={() => setCategory(filter.id)}><i>{filter.mark}</i>{filter.label}</button>)}</div>
    <div className="map-canvas">
      {loading ? <div className="map-state">正在读取真实路网与周边设施…</div> : null}
      {context?.baseMap === "amap-static" ? <img className="amap-static" src={`/api/map/static?lng=${context.center.lng}&lat=${context.center.lat}&zoom=${zoom}`} alt="高德道路底图" onError={() => setMapError({ circleId: active.circle.id, count: 8 })} /> : null}
      {context?.baseMap === "osm-tiles" ? <OsmTileLayer center={context.center} zoom={zoom} onError={recordMapError} /> : null}
      {context ? <span className="catchment-ring" style={{ width: `${(radiusPixels / 750) * 200}%`, height: `${(radiusPixels / 500) * 200}%` }} aria-hidden="true" /> : null}
      {context ? plotted.map((facility) => {
        const position = mapPercent(facility.coordinate!, context.center, zoom);
        if (position.left < -5 || position.left > 105 || position.top < -5 || position.top > 105) return null;
        return <span className={`facility-pin facility-${facility.category}`} key={facility.id} style={{ left: `${position.left}%`, top: `${position.top}%` }} title={facility.name}><i>{facilityMark(facility.category)}</i><b>{facility.name}</b></span>;
      }) : null}
      <span className="circle-center"><i />{active.circle.name}</span>
      {!loading && (!context || mapErrorCount > 6) ? <div className="map-state map-failed"><strong>路网底图暂时没加载出来</strong><span>推荐仍可查看；我们不会用抽象线条假装真实地图。联网后重试即可。</span><button onClick={() => setMapError({ circleId: active.circle.id, count: 0 })}>重试底图</button></div> : null}
      {context ? <div className={`map-source mode-${context.mode}`}><b>{context.sourceLabel}</b><span>{context.note}</span></div> : null}
      {context?.baseMap === "osm-tiles" ? <a className="map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a> : null}
    </div>
    <div className="facility-list" aria-live="polite">
      <div><small>{category === "all" ? "当前可见设施" : FACILITY_FILTERS.find((item) => item.id === category)?.label}</small><strong>{facilities.length ? `${facilities.length} 处` : "暂无可核验结果"}</strong></div>
      {facilities.slice(0, 6).map((facility) => <article key={`list-${facility.id}`}><i>{facilityMark(facility.category)}</i><span><b>{facility.name}</b><small>{facility.distanceMeters ? `约 ${facility.distanceMeters} m · ` : ""}{facility.source === "amap" ? "高德实时" : facility.source === "osm" ? "开放地图" : facility.coordinateVerified ? "公开位置校验" : "演示名称，不展示点位"}</small></span></article>)}
      {unplotted.length ? <p>有 {unplotted.length} 条设施只有名称级演示数据，因此没有放上地图。</p> : null}
    </div>
  </section>;
}

function DayTimeline({ simulation }: { simulation: Recommendation["weekday"] }) {
  return <div className="day-timeline"><div className="timeline-heading"><small>{simulation.subtitle}</small><h3>{simulation.title}</h3></div>{simulation.stops.map((stop) => <div className="timeline-stop" key={`${simulation.title}-${stop.time}`}><time>{stop.time}</time><i /><span><strong>{stop.title}</strong><small>{stop.detail}</small></span></div>)}</div>;
}

function evidenceVisual(evidence: RecommendationEvidence) {
  const meta: Record<string, { mark: string; short: string }> = {
    commute: { mark: "通", short: "通勤" },
    anchor: { mark: "近", short: "锚点" },
    convenience: { mark: "省", short: "省心" },
    calm: { mark: "静", short: "安静" },
    social: { mark: "夜", short: "热度" },
    texture: { mark: "街", short: "街区" },
    nature: { mark: "绿", short: "自然" },
    exploration: { mark: "游", short: "周末" },
  };
  return meta[evidence.axis] ?? { mark: "证", short: "证据" };
}

function evidenceStrength(impact: number) {
  if (impact >= 82) return "强证据";
  if (impact >= 68) return "较匹配";
  return "需权衡";
}

function evidenceSource(evidence: RecommendationEvidence, active: Recommendation) {
  if (evidence.axis === "commute") return active.commute.source === "amap" ? "高德路线" : "模型估算";
  if (evidence.axis === "anchor") return "用户生活锚点";
  return "用户取舍 × 策展特征";
}

function EvidencePassport({
  profile,
  active,
  mapStatus,
}: {
  profile: UserProfile;
  active: Recommendation;
  mapStatus: MapEvidenceStatus;
}) {
  const addressSource = profile.officeLocation.source === "amap" ? "高德地址检索" : profile.officeLocation.id.startsWith("verified-") ? "已核验演示坐标" : "内置演示坐标";
  const facilitySource = mapStatus.context?.sourceLabel ?? (mapStatus.failed ? "接口失败 · 未伪造点位" : "正在核验来源");
  return <section className="evidence-passport" aria-label="推荐证据护照">
    <header><span>证据护照</span><b>EVIDENCE PASSPORT</b><p>Evidence-backed, explainable decision — 每条结论都能追到来源与限制。</p></header>
    <div className="passport-grid">
      <article><i>你</i><small>用户证据</small><strong>{profile.sceneChoices.length} 组场景 · 2 段一天</strong><span>{profile.workPattern.maxCommuteMinutes} 分钟通勤底线</span></article>
      <article><i>址</i><small>工作锚点</small><strong>{addressSource}</strong><span>精确地址不进分享封面</span></article>
      <article><i>路</i><small>通勤证据</small><strong>{active.commute.source === "amap" ? "高德实时路线" : "模型估算"}</strong><span>{active.commute.source === "amap" ? "当前请求返回" : "不伪造精确路线"}</span></article>
      <article><i>点</i><small>周边设施</small><strong>{facilitySource}</strong><span>{mapStatus.context ? "地图面板逐项标注" : "失败时完整降级"}</span></article>
      <article><i>模</i><small>推荐模型</small><strong>结构化偏好排序</strong><span>用户取舍 × 策展生活圈特征</span></article>
    </div>
  </section>;
}

function ReplanDeltaBar({ delta }: { delta: ReplanDelta }) {
  return <section id="replan-delta" className="replan-delta" aria-live="polite">
    <header><div><small>REPLAN DELTA / 反驳后的即时重规划</small><strong>{delta.conditionLabel}</strong></div><p><del>{delta.beforeCondition}</del><i>→</i><ins>{delta.afterCondition}</ins></p></header>
    <div className="replan-roles">{delta.roles.map((role) => <article key={role.role} className={role.changed ? "changed" : "stable"}><small>{role.roleLabel}</small><span><del>{role.before}</del><i>→</i><strong>{role.after}</strong></span><b>{role.changed ? "已换位" : "仍稳定"}</b></article>)}</div>
  </section>;
}

function ResultPage({
  profile,
  result,
  judgeMode,
  replanDelta,
  onFeedback,
  onQuickTune,
  onRestart,
}: {
  profile: UserProfile;
  result: RecommendationResult;
  judgeMode: boolean;
  replanDelta: ReplanDelta | null;
  onFeedback: (recommendation: Recommendation, evidenceIndex: number, direction: "like" | "dislike") => Promise<void>;
  onQuickTune: (kind: QuickTuneKind) => Promise<ReplanDelta | null>;
  onRestart: () => void;
}) {
  const [activeRole, setActiveRole] = useState<Recommendation["role"]>("match");
  const [day, setDay] = useState<"weekday" | "weekend">("weekday");
  const [shareState, setShareState] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("我先不替你下结论。看证据，哪里不像就敲我一下。");
  const [tuning, setTuning] = useState(false);
  const [mapStatus, setMapStatus] = useState<MapEvidenceStatus>({ context: null, loading: true, failed: false });
  const highlightReplan = Boolean(replanDelta);
  const active = result.recommendations.find((item) => item.role === activeRole) ?? result.recommendations[0];
  const hero = PROFESSION_HEROES.find((item) => item.id === profile.profession) ?? INITIAL_HERO;
  const share = async () => {
    const state = await shareLivingCover(result, hero.title);
    setShareState(state === "shared" ? "已分享" : state === "downloaded" ? "封面已下载" : "");
  };
  const respond = async (index: number, direction: "like" | "dislike") => {
    const evidence = active.evidence[index];
    setFeedbackNote(direction === "like" ? `记下了：“${evidence.label}”确实戳中你。` : `收到，“${evidence.label}”不算你的证据，我重新排。`);
    await onFeedback(active, index, direction);
    setFeedbackNote(direction === "like" ? "重算完成。喜欢不是投票，它会真的改变推荐权重。" : "重算完成。看看前三名和妥协点有没有跟着动。");
  };
  const tune = async (kind: QuickTuneKind) => {
    setTuning(true);
    setFeedbackNote(kind === "commute" ? "把通勤绳子再收紧五分钟，看看谁会掉队。" : kind === "nature" ? "给周末多添一点风和绿，我再排一次。" : "把晚归后的吃饭和灯火往前提，我再算一次。");
    const delta = await onQuickTune(kind);
    setActiveRole("match");
    setTuning(false);
    setFeedbackNote(delta?.catLine ?? "新一轮显影完成。城市没变，你刚刚把生活优先级说得更清楚了。");
    if (delta) window.requestAnimationFrame(() => {
      document.getElementById("replan-delta")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  };
  return <main className="result-page">
    {judgeMode ? <section className="judge-guide judge-result-guide" aria-label="Judge mode steps two and three"><b>JUDGE MODE · STEP 2 / 3</b><span>Inspect the real map, evidence passport and an ordinary day.</span><p>最后向下点击一次 “通勤再收紧 5 分钟”，看 Agent 如何接受反驳并重规划。</p></section> : null}
    <section className="result-hero">
      <div className="result-title"><p><span>{result.dataMode === "live" ? "高德实时通勤" : "通勤为本地估算"}</span>EVIDENCE-BACKED, EXPLAINABLE DECISION</p><h1>你不是在选一间房，<br />而是在选<span>普通的一天。</span></h1><blockquote>{result.afterimage.declaration}</blockquote></div>
      <aside className="result-verdict"><small>首选生活圈 · {result.recommendations[0].roleLabel}</small><strong>{result.recommendations[0].circle.name}</strong><b>{fitLabel(result.recommendations[0].score)}</b><span>{result.code}</span></aside>
      <div className="result-facts"><span><small>通勤关系</small><b>{result.recommendations[0].commute.description}</b></span><span><small>日常半径</small><b>约 1.5 km</b></span><span><small>首要依据</small><b>{result.recommendations[0].evidence[0]?.label}</b></span></div>
    </section>
    {replanDelta ? <ReplanDeltaBar delta={replanDelta} /> : null}
    <EvidencePassport profile={profile} active={active} mapStatus={mapStatus} />
    <section className="result-map-section"><RealLifeMap active={active} onStatus={setMapStatus} /><div className="recommendation-tabs">{result.recommendations.map((item, index) => <button key={item.role} className={[item.role === activeRole ? "active" : "", highlightReplan && replanDelta?.changedRoles.includes(item.role) ? "replan-changed" : ""].filter(Boolean).join(" ")} onClick={() => setActiveRole(item.role)} aria-pressed={item.role === activeRole}><i>0{index + 1}</i><span><small>{item.roleLabel}</small><strong>{item.circle.name}</strong><em>{fitLabel(item.score)}</em></span></button>)}</div></section>
    <section key={`detail-${replanDelta?.id ?? "initial"}`} className={`recommendation-detail ${highlightReplan ? "replan-highlight" : ""}`}>
      <div className="circle-intro"><p>{active.roleLabel} / {active.circle.district}</p><h2>{active.circle.name}</h2><span>{active.circle.tagline}</span><div className="circle-proof"><small>生活证据</small><b>{active.circle.poi.breakfast}</b><b>{active.circle.poi.evening}</b><b>{active.circle.poi.nature}</b></div><div className="commute-chip">{active.commute.description}<small>你的上限 {profile.workPattern.maxCommuteMinutes} 分钟 · {active.commute.source === "amap" ? "高德路线" : "模型估算，不伪造路线"}</small></div><CatCompanion variant="result" line={`我会推荐这里，也会提醒你：${active.tradeoff}`} /></div>
      <div className="evidence-panel"><div className="evidence-heading"><p>为什么是这里 / WHY HERE</p><span>扫图标、看强度，再决定像不像你</span></div>{active.evidence.map((evidence, index) => { const visual = evidenceVisual(evidence); return <article key={evidence.id} className={`evidence-card axis-${evidence.axis}`}><span className="evidence-icon">{visual.mark}</span><div className="evidence-copy"><small>{visual.short} · {evidenceStrength(evidence.impact)} <b className="evidence-source">{evidenceSource(evidence, active)}</b></small><strong>{evidence.label}</strong><span>{evidence.detail}</span><div className="evidence-meter" role="img" aria-label={`${evidence.label}证据强度 ${evidence.impact}%`}><i style={{ width: `${evidence.impact}%` }} /></div></div><aside><button aria-label={`喜欢${evidence.label}`} onClick={() => respond(index, "like")}>喜欢</button><button aria-label={`${evidence.label}不像我`} onClick={() => respond(index, "dislike")}>不像我</button></aside></article>; })}<div className="cat-feedback"><span>潜潜追问</span><p>{feedbackNote}</p></div><div className="tradeoff"><b>它的代价</b><span>{active.tradeoff}</span></div></div>
    </section>
    <section key={`day-${replanDelta?.id ?? "initial"}`} className={`day-section ${highlightReplan ? "replan-highlight" : ""}`}><div className="day-switch"><div><p>SIMULATED ORDINARY DAY · 试住 {active.circle.name}</p><h2>不是电影，是会反复发生的普通日常。</h2></div><span><button className={day === "weekday" ? "active" : ""} onClick={() => setDay("weekday")}>周中一天</button><button className={day === "weekend" ? "active" : ""} onClick={() => setDay("weekend")}>周末一天</button></span></div><DayTimeline simulation={day === "weekday" ? active.weekday : active.weekend} /></section>
    <section className="play-again-section"><CatCompanion variant="inline" line={feedbackNote} /><div><small>{judgeMode ? "JUDGE MODE · STEP 3 / 3" : "REPLAN WHEN YOU DISAGREE"}</small><h2>让城市再回答你一次。</h2></div><div className="tune-actions"><button className={judgeMode ? "judge-action" : ""} disabled={tuning || profile.workPattern.maxCommuteMinutes <= 15} onClick={() => tune("commute")}><i>通</i><span><b>通勤再收紧 5 分钟</b><small>{judgeMode ? "CLICK TO REPLAN · 舞台动作" : "看远距离候选是否明显下降"}</small></span></button><button disabled={tuning} onClick={() => tune("nature")}><i>绿</i><span><b>周末多一点自然</b><small>给水边、公园和安静加权</small></span></button><button disabled={tuning} onClick={() => tune("night")}><i>夜</i><span><b>晚归也要生活在线</b><small>提高夜间餐饮和省心密度</small></span></button></div></section>
    <section className="share-section"><div><small>PRIVATE CITY MAGAZINE</small><h2>把这一期私人城市杂志带走。</h2><p>封面不会出现你的公司地址，只保留生活宣言、首选生活圈和一天剪影。</p></div><button className="primary-button" onClick={share}>{shareState || "生成我的杂志封面"} <span>↗</span></button><button className="back-button" onClick={onRestart}>重新试住</button></section><footer><Brand /><p>生活圈约 1.5 公里，推荐来自结构化偏好、路线估算与武汉生活设施数据。它是探索起点，不是房源或价格承诺。</p></footer>
    <section className="privacy-disclosure"><b>这次用了什么数据？</b><span>公司地址与生活锚点只留在当前页面内存，刷新即清除。地图处会逐项标明高德实时、OpenStreetMap 或本地演示数据；只有写着“高德路线”的通勤才是实时路线，其余均为模型估算。精确公司地址不会进入分享封面或发送给叙事模型。本项目提供的是有证据支撑的可解释决策，不承诺“绝对最佳住处”。</span></section>
  </main>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [profile, setProfile] = useState<UserProfile>(freshProfile);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [anchorSlots, setAnchorSlots] = useState(0);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [judgeMode, setJudgeMode] = useState(false);
  const [replanDelta, setReplanDelta] = useState<ReplanDelta | null>(null);
  const [catLine, setCatLine] = useState("别急着答得漂亮。选那个你真的会重复过的日常。");

  const selectedHero = useMemo(
    () => PROFESSION_HEROES.find((hero) => hero.id === profile.profession) ?? INITIAL_HERO,
    [profile.profession],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, sceneIndex]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("judge") !== "1") return;
    const timeout = window.setTimeout(() => {
      const demo = judgeProfile();
      setJudgeMode(true);
      setProfile(demo);
      setResult(recommendLivingCircles(demo));
      setCatLine("Judge demo ready. 先审潜像，再揭晓地点，最后收紧一次通勤。");
      setScreen("mirror");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const reset = () => {
    setProfile(freshProfile());
    setSceneIndex(0);
    setAnchorSlots(0);
    setResult(null);
    setReplanDelta(null);
    setJudgeMode(false);
    window.history.replaceState(null, "", window.location.pathname);
    setCatLine("新一局。城市很大，我们先把你的一天说清楚。");
    setScreen("intro");
  };

  const updateWork = (work: Partial<UserProfile["workPattern"]>) =>
    setProfile((current) => ({ ...current, workPattern: { ...current.workPattern, ...work } }));

  const selectHero = (id: ProfessionId) => {
    const hero = PROFESSION_HEROES.find((item) => item.id === id) ?? INITIAL_HERO;
    setProfile((current) => ({ ...current, profession: id, workPattern: { ...hero.defaultWork } }));
    setCatLine(`${hero.title}，称号我记住了。接下来用真实班表拆掉职业刻板印象。`);
  };

  const setAnchorSlotCount = (count: number) => {
    setAnchorSlots(count);
    setProfile((current) => ({ ...current, optionalAnchors: current.optionalAnchors.slice(0, count) }));
  };

  const updateAnchor = (index: number, place?: PlaceOption, label?: string) => {
    setProfile((current) => {
      const anchors = [...current.optionalAnchors];
      const existing = anchors[index];
      const nextPlace = place ?? existing?.place;
      if (!nextPlace) return current;
      anchors[index] = {
        id: existing?.id ?? `anchor-${index}-${Date.now()}`,
        label: label ?? existing?.label ?? (index === 0 ? "重要的人" : "常去的地方"),
        place: nextPlace,
      };
      return { ...current, optionalAnchors: anchors.filter(Boolean) as PersonalAnchor[] };
    });
  };

  const chooseScene = (optionId: string | null) => {
    const scene = SCENE_DUELS[sceneIndex];
    const option = scene.options.find((item) => item.id === optionId);
    setCatLine(option ? `“${option.title}”——好，这是一条会影响排名的生活证据。` : "不确定也算诚实。空白不会被我擅自补成偏好。");
    setProfile((current) => ({
      ...current,
      sceneChoices: [
        ...current.sceneChoices.filter((choice) => choice.sceneId !== scene.id),
        { sceneId: scene.id, optionId },
      ],
    }));
    if (sceneIndex >= SCENE_DUELS.length - 1) setScreen("edit");
    else setSceneIndex((current) => current + 1);
  };

  const togglePriority = (kind: "weekday" | "weekend", id: string) => {
    const key = kind === "weekday" ? "weekdayPriorities" : "weekendPriorities";
    const card = [...WEEKDAY_CARDS, ...WEEKEND_CARDS].find((item) => item.id === id);
    setCatLine(card ? `“${card.title}”进片单。时间有限，留下谁比喜欢谁更诚实。` : catLine);
    setProfile((current) => {
      const selected = current[key];
      const next = selected.includes(id) ? selected.filter((item) => item !== id) : selected.length < 3 ? [...selected, id] : selected;
      return { ...current, [key]: next };
    });
  };

  const generate = async (nextProfile = profile) => {
    setLoading(true);
    setCatLine("我在把你的取舍翻译成城市条件，不会拿职业名直接猜性格。");
    try {
      const response = await fetch("/api/living-circles/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextProfile),
      });
      const recommendation = response.ok
        ? ((await response.json()) as RecommendationResult)
        : recommendLivingCircles(nextProfile);
      setResult(recommendation);
      setScreen("mirror");
    } catch {
      setResult(recommendLivingCircles(nextProfile));
      setScreen("mirror");
    } finally {
      setLoading(false);
    }
  };

  const adjustAxis = (axis: LifestyleAxis, delta: number) => {
    const next = {
      ...profile,
      axisAdjustments: {
        ...profile.axisAdjustments,
        [axis]: Math.max(-24, Math.min(24, (profile.axisAdjustments[axis] ?? 0) + delta)),
      },
    };
    setProfile(next);
    setResult(recommendLivingCircles(next));
    setCatLine(delta > 0 ? "收到，这句像你，我把它的声音放大一点。" : "收到，这句不像你。删掉一句套话，比多答一题有用。");
  };

  const reveal = () => {
    setScreen("developing");
    window.setTimeout(() => setScreen("result"), 1800);
  };

  const feedback = async (recommendation: Recommendation, evidenceIndex: number, direction: "like" | "dislike") => {
    setReplanDelta(null);
    const evidence = recommendation.evidence[evidenceIndex];
    const adjustment: FeedbackAdjustment = {
      recommendationRole: recommendation.role,
      evidenceId: evidence.id,
      axis: evidence.axis,
      direction,
    };
    try {
      const response = await fetch("/api/living-circles/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, feedback: adjustment }),
      });
      const payload = (await response.json()) as { profile: UserProfile; result: RecommendationResult };
      setProfile(payload.profile);
      setResult(payload.result);
    } catch {
      const next = applyFeedback(profile, adjustment);
      setProfile(next);
      setResult(recommendLivingCircles(next));
    }
  };

  const quickTune = async (kind: QuickTuneKind): Promise<ReplanDelta | null> => {
    const previousProfile = profile;
    const previousResult = result;
    const next: UserProfile = {
      ...profile,
      workPattern: { ...profile.workPattern },
      axisAdjustments: { ...profile.axisAdjustments },
    };
    if (kind === "commute") next.workPattern.maxCommuteMinutes = Math.max(15, next.workPattern.maxCommuteMinutes - 5);
    if (kind === "nature") next.axisAdjustments.nature = Math.min(24, (next.axisAdjustments.nature ?? 0) + 10);
    if (kind === "night") {
      next.axisAdjustments.convenience = Math.min(24, (next.axisAdjustments.convenience ?? 0) + 8);
      next.axisAdjustments.social = Math.min(24, (next.axisAdjustments.social ?? 0) + 4);
    }
    setProfile(next);
    let nextResult: RecommendationResult;
    try {
      if (judgeMode) throw new Error("judge mode uses a deterministic local evidence snapshot");
      const response = await fetch("/api/living-circles/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error("recalculate failed");
      nextResult = (await response.json()) as RecommendationResult;
    } catch {
      nextResult = recommendLivingCircles(next);
    }
    setResult(nextResult);
    if (!previousResult) return null;
    const delta = buildReplanDelta(kind, previousProfile, next, previousResult, nextResult);
    setReplanDelta(delta);
    return delta;
  };

  const loadDemo = () => {
    const demo = judgeProfile();
    setJudgeMode(true);
    setReplanDelta(null);
    const url = new URL(window.location.href);
    url.searchParams.set("judge", "1");
    window.history.replaceState(null, "", url);
    setProfile(demo);
    setResult(recommendLivingCircles(demo));
    setCatLine("示例已装好。先审潜像，别急着被地名带跑。");
    setScreen("mirror");
  };

  return <div className={`app-shell screen-${screen} ${judgeMode ? "judge-mode" : ""}`}>
    <ShellHeader screen={screen} judgeMode={judgeMode} onReset={reset} />
    {screen === "intro" ? <Intro onStart={() => setScreen("hero")} onDemo={loadDemo} /> : null}
    {screen === "hero" ? <HeroStep profile={profile} onHero={selectHero} onWork={updateWork} onNext={() => setScreen("anchors")} /> : null}
    {screen === "anchors" ? <AnchorStep profile={profile} anchorSlots={anchorSlots} onOffice={(officeLocation) => { setProfile((current) => ({ ...current, officeLocation })); setCatLine(`${officeLocation.name}钉住了。放心，它只用来算这一次。`); }} onAnchorSlots={setAnchorSlotCount} onAnchor={(index, place) => { updateAnchor(index, place); setCatLine("生活锚点也记下了。重要的人和地方，本来就会改变一座城的距离。"); }} onAnchorLabel={(index, label) => updateAnchor(index, undefined, label)} onWork={updateWork} onBack={() => setScreen("hero")} onNext={() => { setSceneIndex(0); setCatLine("现实坐标够了。现在别答道理，跟我试住几个晚上。"); setScreen("scenes"); }} /> : null}
    {screen === "scenes" ? <SceneStep profile={profile} index={sceneIndex} onChoose={(option) => chooseScene(option)} onSkip={() => chooseScene(null)} onBack={() => sceneIndex === 0 ? setScreen("anchors") : setSceneIndex((current) => current - 1)} /> : null}
    {screen === "edit" ? <EditDayStep profile={profile} onToggle={togglePriority} onBack={() => { setSceneIndex(SCENE_DUELS.length - 1); setScreen("scenes"); }} onGenerate={() => generate()} loading={loading} /> : null}
    {screen === "mirror" && result ? <MirrorStep result={result} judgeMode={judgeMode} onAdjust={adjustAxis} onBack={() => setScreen("edit")} onReveal={reveal} /> : null}
    {screen === "developing" ? <Developing /> : null}
    {screen === "result" && result ? <ResultPage profile={profile} result={result} judgeMode={judgeMode} replanDelta={replanDelta} onFeedback={feedback} onQuickTune={quickTune} onRestart={reset} /> : null}
    {!["intro", "developing", "result"].includes(screen) ? <CatCompanion line={catLine} /> : null}
    <span className="sr-only" aria-live="polite">当前职业英雄：{selectedHero.title}</span>
  </div>;
}
