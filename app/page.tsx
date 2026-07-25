"use client";

import { FormEvent, useMemo, useState } from "react";
import { analyzeCityImprint } from "../lib/analyzer";
import { CITIES, QUESTIONS, SAMPLE_ANSWERS } from "../lib/city-data";
import { downloadShareCard, shareResult } from "../lib/export-image";
import type { AnalysisResult, CityKey, ImageCategory } from "../lib/types";

const CATEGORY_LABELS: Record<ImageCategory, string> = {
  spatial: "空间骨架",
  sensory: "感官气候",
  cultural: "文化密码",
  social: "生活关系",
  emotional: "情绪色调",
  narrative: "个人叙事",
};

const CATEGORY_MARKS: Record<ImageCategory, string> = {
  spatial: "坐标",
  sensory: "体感",
  cultural: "在地",
  social: "相处",
  emotional: "心境",
  narrative: "故事",
};

type Screen = "intro" | "questions" | "analyzing" | "result";

function Brand() {
  return (
    <div className="brand" aria-label="城市潜像">
      <span className="brand-mark" aria-hidden="true">
        潜
      </span>
      <span>
        <strong>城市潜像</strong>
        <small>CITY AFTERIMAGE</small>
      </span>
    </div>
  );
}

function Header({ onReset }: { onReset?: () => void }) {
  return (
    <header className="site-header">
      <Brand />
      <div className="header-actions">
        <span className="privacy-note">
          <i aria-hidden="true" />
          回答仅停留在此设备
        </span>
        {onReset ? (
          <button className="text-button" type="button" onClick={onReset}>
            重新开始
          </button>
        ) : null}
      </div>
    </header>
  );
}

function Intro({
  city,
  onCityChange,
  onStart,
  onDemo,
}: {
  city: CityKey;
  onCityChange: (city: CityKey) => void;
  onStart: () => void;
  onDemo: () => void;
}) {
  return (
    <main className="intro-shell">
      <Header />
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>城市认知实验 · 01</span>
            <span>约 3 分钟</span>
          </div>
          <h1>
            一座城市，
            <br />
            先在你<span>心里</span>成形。
          </h1>
          <p className="hero-lead">
            八个问题，唤醒你关于一座城的路线、气味、方言与记忆。
            我们把这些碎片显影为一张只属于你的城市认知地图。
          </p>

          <div className="city-picker" role="group" aria-label="选择一座城市">
            <p>先选择一座你熟悉的城市</p>
            <div className="city-grid">
              {(Object.keys(CITIES) as CityKey[]).map((key) => (
                <button
                  type="button"
                  key={key}
                  aria-pressed={city === key}
                  className={city === key ? "city-option active" : "city-option"}
                  onClick={() => onCityChange(key)}
                >
                  <strong>{CITIES[key].name}</strong>
                  <span>{CITIES[key].caption}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="intro-actions">
            <button className="primary-button" type="button" onClick={onStart}>
              开始显影 <span aria-hidden="true">↗</span>
            </button>
            <button className="secondary-button" type="button" onClick={onDemo}>
              直接体验示例
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-label="个人城市意象图示意">
          <div className="poster-sheet">
            <div className="poster-index">NO. 027</div>
            <div className="contour contour-one" />
            <div className="contour contour-two" />
            <div className="river-stroke river-one" />
            <div className="river-stroke river-two" />
            <div className="poster-node node-a">
              <i />
              <span>过江的风</span>
            </div>
            <div className="poster-node node-b">
              <i />
              <span>清晨的碱水味</span>
            </div>
            <div className="poster-node node-c">
              <i />
              <span>凌晨的轮渡</span>
            </div>
            <div className="poster-center">
              <span>一座城</span>
              <strong>在身体里留下的回声</strong>
            </div>
            <div className="poster-caption">
              <span>空间不是经纬度，</span>
              <span>而是记忆之间的距离。</span>
            </div>
          </div>
          <p className="visual-note">
            <span>↑</span> 每一个节点，都来自一句真实回答
          </p>
        </div>
      </section>

      <section className="method-strip" aria-label="生成方法">
        <div>
          <span>01</span>
          <p>
            <strong>唤醒</strong>
            从场景而非常识开始
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            <strong>提取</strong>
            识别空间与非物质意象
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            <strong>显影</strong>
            生成不可替换的私人地图
          </p>
        </div>
      </section>
    </main>
  );
}

function Questions({
  city,
  answers,
  questionIndex,
  onAnswer,
  onBack,
  onNext,
  onReset,
  onFillDemo,
}: {
  city: CityKey;
  answers: string[];
  questionIndex: number;
  onAnswer: (answer: string) => void;
  onBack: () => void;
  onNext: () => void;
  onReset: () => void;
  onFillDemo: () => void;
}) {
  const question = QUESTIONS[questionIndex];
  const isLast = questionIndex === QUESTIONS.length - 1;
  const answer = answers[questionIndex] ?? "";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (answer.trim()) onNext();
  };

  return (
    <main className="question-shell">
      <Header onReset={onReset} />
      <div className="question-layout">
        <aside className="progress-rail">
          <div className="rail-city">
            <span>正在显影</span>
            <strong>{CITIES[city].name}</strong>
            <small>{CITIES[city].romanized}</small>
          </div>
          <ol>
            {QUESTIONS.map((item, index) => (
              <li
                key={item.id}
                className={
                  index === questionIndex
                    ? "current"
                    : index < questionIndex
                      ? "complete"
                      : ""
                }
              >
                <span>{index < questionIndex ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.shortTitle}</strong>
                  <small>{CATEGORY_LABELS[item.category]}</small>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="demo-fill" onClick={onFillDemo}>
            一键填入演示答案
          </button>
        </aside>

        <section className="question-stage">
          <div className="question-meta">
            <span>
              QUESTION {String(questionIndex + 1).padStart(2, "0")} /{" "}
              {String(QUESTIONS.length).padStart(2, "0")}
            </span>
            <span className={`category-chip ${question.category}`}>
              {CATEGORY_MARKS[question.category]} · {CATEGORY_LABELS[question.category]}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="question-card">
            <p className="question-kicker">{question.kicker}</p>
            <h2>{question.prompt.replace("{city}", CITIES[city].name)}</h2>
            <p className="question-help">{question.help}</p>
            <label htmlFor="answer">你的回答</label>
            <textarea
              id="answer"
              value={answer}
              onChange={(event) => onAnswer(event.target.value)}
              placeholder={question.placeholder.replace("{city}", CITIES[city].name)}
              autoFocus
              maxLength={360}
            />
            <div className="answer-footer">
              <span>{answer.length} / 360</span>
              <span>写一个具体瞬间，比写“很有烟火气”更有用</span>
            </div>
            <div className="question-actions">
              <button
                className="back-button"
                type="button"
                onClick={onBack}
                disabled={questionIndex === 0}
              >
                ← 上一题
              </button>
              <button className="primary-button" type="submit" disabled={!answer.trim()}>
                {isLast ? "生成我的城市潜像" : "继续"} <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
          <div className="question-progress">
            <span style={{ width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%` }} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Analyzing({ city }: { city: CityKey }) {
  return (
    <main className="analyzing-screen">
      <Brand />
      <div className="developing-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <p>正在冲洗你的记忆底片</p>
      <h2>{CITIES[city].name}，正在显影……</h2>
      <div className="analysis-steps" aria-label="正在分析">
        <span>提取空间锚点</span>
        <span>辨认感官线索</span>
        <span>计算个人独特性</span>
      </div>
    </main>
  );
}

function CognitiveMap({ result }: { result: AnalysisResult }) {
  const lines = result.nodes.slice(1).map((node, index) => {
    const previous = result.nodes[index];
    const dx = node.x - previous.x;
    const dy = node.y - previous.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return {
      key: `${previous.id}-${node.id}`,
      left: previous.x,
      top: previous.y,
      width: length,
      transform: `rotate(${angle}deg)`,
    };
  });

  return (
    <div className="cognitive-map">
      <div className="map-coordinate top">熟悉 / 具体</div>
      <div className="map-coordinate bottom">隐约 / 情绪</div>
      <div className="map-ring ring-one" />
      <div className="map-ring ring-two" />
      <div className="map-river" />
      <div className="map-river second" />
      {lines.map((line) => (
        <span
          className="map-connection"
          key={line.key}
          style={{
            left: `${line.left}%`,
            top: `${line.top}%`,
            width: `${line.width}%`,
            transform: line.transform,
          }}
        />
      ))}
      {result.nodes.map((node, index) => (
        <div
          className={`map-node ${node.category} ${index === 0 ? "primary" : ""}`}
          key={node.id}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <span className="node-dot">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{node.label}</strong>
            <small>{CATEGORY_LABELS[node.category]}</small>
          </div>
        </div>
      ))}
      <div className="map-center-stamp">
        <span>{result.city}</span>
        <strong>MY CITY</strong>
      </div>
    </div>
  );
}

function ResultView({
  result,
  onReset,
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  const [shareStatus, setShareStatus] = useState("");

  const handleShare = async () => {
    const status = await shareResult(result);
    setShareStatus(
      status === "shared"
        ? "已打开系统分享"
        : status === "downloaded"
          ? "分享图已下载"
          : "已取消分享",
    );
  };

  return (
    <main className="result-shell">
      <Header onReset={onReset} />
      <section className="result-heading">
        <div>
          <div className="eyebrow">
            <span>你的城市潜像 · {result.code}</span>
            <span>本地规则引擎</span>
          </div>
          <p className="result-overline">{result.city} / PRIVATE CITY IMPRINT</p>
          <h1>“{result.declaration}”</h1>
          <p>
            这不是一张导航地图。节点越靠近中心，代表它越能定义你心里的
            {result.city}；节点间的距离，代表记忆之间的关联。
          </p>
        </div>
        <div className="result-actions">
          <button className="primary-button" type="button" onClick={handleShare}>
            生成分享图 <span aria-hidden="true">↗</span>
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              downloadShareCard(result);
              setShareStatus("PNG 已保存");
            }}
          >
            下载 PNG
          </button>
          <small aria-live="polite">{shareStatus}</small>
        </div>
      </section>

      <section className="score-row" aria-label="城市潜像评分">
        <div>
          <span>自我识别度</span>
          <strong>{result.scores.recognition}</strong>
          <small>/ 100</small>
          <i style={{ width: `${result.scores.recognition}%` }} />
        </div>
        <div>
          <span>个人独特性</span>
          <strong>{result.scores.uniqueness}</strong>
          <small>/ 100</small>
          <i style={{ width: `${result.scores.uniqueness}%` }} />
        </div>
        <div>
          <span>城市区分度</span>
          <strong>{result.scores.distinctiveness}</strong>
          <small>/ 100</small>
          <i style={{ width: `${result.scores.distinctiveness}%` }} />
        </div>
        <p>
          <span>核心意象</span>
          <strong>{result.nodes.length}</strong>
          <small>个节点</small>
        </p>
      </section>

      <section className="result-grid" id="share-card">
        <article className="map-panel">
          <div className="panel-title">
            <div>
              <span>01 / 认知拓扑</span>
              <strong>记忆不是按比例尺生长的</strong>
            </div>
            <span className="map-legend">中心 → 定义这座城</span>
          </div>
          <CognitiveMap result={result} />
        </article>

        <aside className="insight-panel">
          <div className="panel-title">
            <div>
              <span>02 / 意象切片</span>
              <strong>被算法保留下来的细节</strong>
            </div>
          </div>
          <ol className="image-slices">
            {result.nodes.slice(0, 5).map((node, index) => (
              <li key={node.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div className="slice-heading">
                    <strong>{node.label}</strong>
                    <small className={node.category}>
                      {CATEGORY_LABELS[node.category]}
                    </small>
                  </div>
                  <p>“{node.quote}”</p>
                  <div className="slice-score">
                    <span>重要度 {node.importance}</span>
                    <span>独特性 {node.uniqueness}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="trace-note">
            <span>证据可追溯</span>
            每一个节点均来自你的原始回答，生成过程没有添加新的城市事实。
          </div>
        </aside>
      </section>

      <section className="result-footer">
        <div>
          <span>你的个人路径</span>
          <p>{result.path.join(" → ")}</p>
        </div>
        <div>
          <span>潜像注脚</span>
          <p>{result.footnote}</p>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [city, setCity] = useState<CityKey>("wuhan");
  const [answers, setAnswers] = useState<string[]>(() =>
    Array(QUESTIONS.length).fill(""),
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const answeredCount = useMemo(
    () => answers.filter((answer) => answer.trim()).length,
    [answers],
  );

  const reset = () => {
    setScreen("intro");
    setQuestionIndex(0);
    setAnswers(Array(QUESTIONS.length).fill(""));
    setResult(null);
  };

  const generate = (sourceAnswers = answers) => {
    setScreen("analyzing");
    window.setTimeout(() => {
      setResult(analyzeCityImprint(city, sourceAnswers));
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1250);
  };

  const fillDemo = (jumpToResult = false) => {
    const demoAnswers = SAMPLE_ANSWERS[city];
    setAnswers(demoAnswers);
    if (jumpToResult) generate(demoAnswers);
  };

  if (screen === "intro") {
    return (
      <Intro
        city={city}
        onCityChange={setCity}
        onStart={() => setScreen("questions")}
        onDemo={() => fillDemo(true)}
      />
    );
  }

  if (screen === "questions") {
    return (
      <Questions
        city={city}
        answers={answers}
        questionIndex={questionIndex}
        onAnswer={(answer) =>
          setAnswers((current) =>
            current.map((item, index) => (index === questionIndex ? answer : item)),
          )
        }
        onBack={() => setQuestionIndex((index) => Math.max(0, index - 1))}
        onNext={() => {
          if (questionIndex === QUESTIONS.length - 1) {
            generate();
          } else {
            setQuestionIndex((index) => index + 1);
          }
        }}
        onReset={reset}
        onFillDemo={() => {
          fillDemo();
          setQuestionIndex(Math.min(answeredCount, QUESTIONS.length - 1));
        }}
      />
    );
  }

  if (screen === "analyzing") return <Analyzing city={city} />;
  if (result) return <ResultView result={result} onReset={reset} />;
  return null;
}
