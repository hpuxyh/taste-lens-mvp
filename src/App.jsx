import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Camera,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  Flame,
  Heart,
  ImagePlus,
  MessageCircle,
  ScanSearch,
  Settings2,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Upload,
} from "lucide-react";

const ANALYSIS_API_URL =
  "https://taste-lens-api.hpuxyh-taste-lens.workers.dev/api/analyze-food";
const API_HEALTH_URL =
  "https://taste-lens-api.hpuxyh-taste-lens.workers.dev/api/health";

const sampleImages = {
  crispyChicken: svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#f2e4d2"/>
      <ellipse cx="450" cy="660" rx="330" ry="250" fill="#fff8ef"/>
      <ellipse cx="450" cy="660" rx="285" ry="205" fill="#fff1dd"/>
      <g fill="#c7772f" stroke="#8f471e" stroke-width="8">
        <path d="M258 565c24-94 155-117 211-37 63-60 184-32 209 56 28 99-48 183-143 178-47 67-160 64-202-9-86 6-133-82-75-188z"/>
        <path d="M487 433c64-62 178-22 181 67 4 96-115 144-181 74-44 30-108 7-119-45-13-63 61-115 119-96z"/>
        <path d="M229 712c12-73 96-114 157-73 59 39 52 134-12 166-68 34-158-17-145-93z"/>
      </g>
      <g fill="none" stroke="#d94f3d" stroke-width="22" stroke-linecap="round">
        <path d="M272 541c93 44 208 49 324 16"/>
        <path d="M329 706c77 33 184 27 279-18"/>
      </g>
      <g fill="#ffe2a8" opacity=".75">
        <circle cx="339" cy="514" r="24"/>
        <circle cx="540" cy="617" r="18"/>
        <circle cx="420" cy="765" r="22"/>
      </g>
    </svg>
  `),
  malaNoodle: svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#efe5d7"/>
      <ellipse cx="450" cy="630" rx="340" ry="270" fill="#2f3c43"/>
      <ellipse cx="450" cy="590" rx="300" ry="210" fill="#fff7e6"/>
      <ellipse cx="450" cy="590" rx="265" ry="180" fill="#c8422d"/>
      <g fill="none" stroke="#f6d06a" stroke-width="22" stroke-linecap="round">
        <path d="M254 572c106-84 278 86 392-1"/>
        <path d="M259 638c118-84 255 73 382-7"/>
        <path d="M305 500c96-50 208 62 304 8"/>
      </g>
      <g fill="#283f2f">
        <circle cx="320" cy="503" r="34"/>
        <circle cx="613" cy="652" r="30"/>
        <circle cx="523" cy="469" r="24"/>
      </g>
      <g fill="#fae7bb">
        <circle cx="361" cy="681" r="16"/>
        <circle cx="576" cy="548" r="15"/>
        <circle cx="471" cy="646" r="12"/>
      </g>
    </svg>
  `),
  lemonDessert: svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#ecf2ec"/>
      <ellipse cx="450" cy="665" rx="330" ry="235" fill="#ffffff"/>
      <circle cx="450" cy="610" r="220" fill="#c9904c"/>
      <circle cx="450" cy="610" r="178" fill="#f9d761"/>
      <circle cx="450" cy="610" r="118" fill="#fff3a8"/>
      <path d="M448 395a214 214 0 0 1 213 214H448z" fill="#ffe67b" opacity=".75"/>
      <g fill="#fffaf0">
        <circle cx="376" cy="540" r="34"/>
        <circle cx="524" cy="550" r="31"/>
        <circle cx="461" cy="710" r="38"/>
      </g>
      <g fill="#d2a840">
        <circle cx="350" cy="710" r="11"/>
        <circle cx="570" cy="672" r="10"/>
        <circle cx="482" cy="480" r="9"/>
      </g>
    </svg>
  `),
  greenBowl: svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#e7ede7"/>
      <ellipse cx="450" cy="650" rx="340" ry="265" fill="#f7f5ea"/>
      <ellipse cx="450" cy="610" rx="292" ry="205" fill="#dfe8c9"/>
      <g>
        <circle cx="310" cy="548" r="78" fill="#4d9656"/>
        <circle cx="451" cy="506" r="83" fill="#76b65f"/>
        <circle cx="586" cy="574" r="72" fill="#2f7a59"/>
        <circle cx="365" cy="682" r="78" fill="#8fc56a"/>
        <circle cx="534" cy="692" r="82" fill="#5ba765"/>
      </g>
      <g fill="#f2d26b">
        <circle cx="421" cy="606" r="18"/>
        <circle cx="567" cy="646" r="16"/>
        <circle cx="330" cy="623" r="15"/>
      </g>
      <g fill="#f7f1df">
        <rect x="424" y="430" width="54" height="230" rx="27" transform="rotate(32 451 545)"/>
        <rect x="490" y="457" width="42" height="190" rx="21" transform="rotate(63 511 552)"/>
      </g>
    </svg>
  `),
};

const sampleFoods = [
  {
    id: "crispy-chicken",
    title: "甜辣炸鸡",
    image: sampleImages.crispyChicken,
    seed: {
      foodName: "甜辣炸鸡",
      confidence: 82,
      scores: {
        sweet: 7,
        spicy: 5,
        salty: 6,
        sour: 1,
        bitter: 1,
        umami: 6,
        greasy: 8,
        numbing: 1,
      },
      textures: ["外脆", "裹酱", "肉嫩", "油润"],
      aromas: ["炸物香", "蒜香", "甜辣酱香"],
      similar: ["韩式炸鸡", "糖醋里脊", "辣味烤翅"],
      warnings: ["可能偏油", "可能含蒜"],
      description:
        "甜辣酱和炸物香会先出来，后段是油润、轻辣和一点蒜香。",
    },
  },
  {
    id: "mala-noodle",
    title: "麻辣拌面",
    image: sampleImages.malaNoodle,
    seed: {
      foodName: "麻辣拌面",
      confidence: 76,
      scores: {
        sweet: 2,
        spicy: 8,
        salty: 7,
        sour: 2,
        bitter: 1,
        umami: 7,
        greasy: 6,
        numbing: 6,
      },
      textures: ["劲道", "挂汁", "油润", "脆配菜"],
      aromas: ["花椒香", "辣椒油香", "芝麻香"],
      similar: ["麻辣香锅", "担担面", "红油抄手"],
      warnings: ["可能较辣", "可能含花生或芝麻"],
      description:
        "红油、花椒和咸鲜调味比较突出，面条会有挂汁感和明显辣感。",
    },
  },
  {
    id: "lemon-dessert",
    title: "柠檬奶油塔",
    image: sampleImages.lemonDessert,
    seed: {
      foodName: "柠檬奶油塔",
      confidence: 79,
      scores: {
        sweet: 8,
        spicy: 0,
        salty: 1,
        sour: 5,
        bitter: 1,
        umami: 1,
        greasy: 4,
        numbing: 0,
      },
      textures: ["酥皮", "顺滑", "轻酸", "奶油感"],
      aromas: ["奶香", "柑橘香", "黄油香"],
      similar: ["柠檬派", "芝士蛋糕", "黄油曲奇"],
      warnings: ["可能含奶制品", "甜度偏高"],
      description:
        "黄油酥皮、奶香和柠檬酸感比较明显，甜度高但不一定厚重。",
    },
  },
  {
    id: "green-bowl",
    title: "香草蔬菜碗",
    image: sampleImages.greenBowl,
    seed: {
      foodName: "香草蔬菜碗",
      confidence: 74,
      scores: {
        sweet: 3,
        spicy: 1,
        salty: 3,
        sour: 4,
        bitter: 3,
        umami: 3,
        greasy: 2,
        numbing: 0,
      },
      textures: ["爽脆", "多汁", "清淡", "颗粒感"],
      aromas: ["青草香", "橄榄油香", "柠檬香"],
      similar: ["凯撒沙拉", "牛油果碗", "希腊沙拉"],
      warnings: ["可能有生冷口感", "草本味较明显"],
      description:
        "蔬菜水分和清爽酸感会更明显，草本香气可能带一点轻微苦感。",
    },
  },
];

const defaultMemory = {
  liked: "韩式炸鸡、糖醋里脊、芝士蛋糕、日式咖喱、珍珠奶茶",
  familiar: "麻辣烫、烧烤、番茄牛腩、沙县拌面、奶茶",
  disliked: "香菜、苦瓜、太腥的海鲜、内脏、太油",
};

const defaultProfile = {
  spiceTolerance: "medium",
  intensity: "normal",
  sweetSavory: "balanced",
};

const providerOptions = [
  { id: "dashscope", name: "阿里百炼", label: "Qwen-VL 图片味道分析" },
];

const flavorLabels = {
  sweet: "甜",
  spicy: "辣",
  salty: "咸",
  sour: "酸",
  bitter: "苦",
  umami: "鲜",
  greasy: "油润",
  numbing: "麻",
};

const profileOptions = {
  spiceTolerance: [
    { value: "none", label: "不辣" },
    { value: "mild", label: "微辣" },
    { value: "medium", label: "中辣" },
    { value: "hot", label: "重辣" },
  ],
  intensity: [
    { value: "light", label: "清淡" },
    { value: "normal", label: "正常" },
    { value: "heavy", label: "重口" },
  ],
  sweetSavory: [
    { value: "sweet", label: "偏甜" },
    { value: "balanced", label: "平衡" },
    { value: "savory", label: "咸鲜" },
  ],
};

const initialSource = {
  type: "sample",
  ...sampleFoods[0],
};

function App() {
  const fileInputRef = useRef(null);
  const [view, setView] = useState("capture");
  const [memory, setMemory] = useState(defaultMemory);
  const [profile, setProfile] = useState(defaultProfile);
  const [provider, setProvider] = useState("dashscope");
  const [visualSource, setVisualSource] = useState(initialSource);
  const [analysisSource, setAnalysisSource] = useState(initialSource);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("local");
  const [feedback, setFeedback] = useState("");

  const report = useMemo(
    () => buildReport(analysisSource, memory, profile, provider),
    [analysisSource, memory, profile, provider]
  );

  function updateMemory(key, value) {
    setMemory((current) => ({ ...current, [key]: value }));
  }

  function updateProfile(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function analyzeSource(source) {
    setVisualSource(source);
    setView("report");
    setIsAnalyzing(true);
    setFeedback("");
    setAnalysisMode("aliyun");

    try {
      if (source.type !== "upload") {
        await wait(520);
        setAnalysisSource({ ...source, modelSource: "sample" });
        setAnalysisMode("sample");
        return;
      }

      const modelSeed = await requestModelAnalysis(source, memory, profile);
      setAnalysisSource({
        ...source,
        title: modelSeed.foodName || source.title,
        seed: modelSeed,
        modelSource: "aliyun",
      });
      setAnalysisMode("aliyun");
    } catch (error) {
      console.warn("TasteLens model fallback", error);
      setAnalysisSource({
        ...source,
        modelSource: "local",
        modelError: error instanceof Error ? error.message : "model_failed",
      });
      setAnalysisMode("local");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const image = await resizeImageDataUrl(await readFileAsDataUrl(file));
    const clues = await analyzeImagePixels(image);
    analyzeSource({
      id: `upload-${Date.now()}`,
      title: file.name.replace(/\.[^.]+$/, "") || "上传图片",
      image,
      clues,
      type: "upload",
    });
  }

  return (
    <div className="page">
      <div className="phone-shell">
        <header className="topbar">
          <button
            className="brand-button"
            type="button"
            onClick={() => setView("memory")}
          >
            <span>
              <Sparkles size={18} />
            </span>
            TasteLens
          </button>
          <button className="model-pill" type="button" onClick={() => setView("memory")}>
            <Bot size={15} />
            {providerOptions.find((item) => item.id === provider)?.name}
          </button>
        </header>

        <main className="screen">
          {view === "memory" && (
            <MemoryView
              memory={memory}
              profile={profile}
              provider={provider}
              onMemoryChange={updateMemory}
              onProfileChange={updateProfile}
              onProviderChange={setProvider}
              onNext={() => setView("capture")}
            />
          )}

          {view === "capture" && (
            <CaptureView
              source={visualSource}
              report={report}
              analysisMode={analysisMode}
              onUploadClick={() => fileInputRef.current?.click()}
              onAnalyze={() => analyzeSource(visualSource)}
              onSampleSelect={analyzeSource}
            />
          )}

          {view === "report" && (
            <ReportView
              isAnalyzing={isAnalyzing}
              image={analysisSource.image}
              report={report}
              analysisMode={analysisMode}
              feedback={feedback}
              onFeedback={setFeedback}
              onCapture={() => setView("capture")}
            />
          )}
        </main>

        <nav className="bottom-tabs" aria-label="主导航">
          <TabButton
            active={view === "memory"}
            icon={Settings2}
            label="味觉"
            onClick={() => setView("memory")}
          />
          <TabButton
            active={view === "capture"}
            icon={Camera}
            label="拍照"
            onClick={() => setView("capture")}
          />
          <TabButton
            active={view === "report"}
            icon={Star}
            label="报告"
            badge={`${report.match}%`}
            onClick={() => setView("report")}
          />
        </nav>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function MemoryView({
  memory,
  profile,
  provider,
  onMemoryChange,
  onProfileChange,
  onProviderChange,
  onNext,
}) {
  const parsed = parseTasteMemory(memory);

  return (
    <section className="flow-stack">
      <div className="hero-card">
        <div className="hero-copy">
          <span>味觉记忆</span>
          <h1>我的味觉地图</h1>
        </div>
        <div className="memory-strip">
          {parsed.likedFoods.slice(0, 4).map((food) => (
            <span key={food}>{food}</span>
          ))}
        </div>
      </div>

      <div className="input-group">
        <MemoryField
          label="喜欢"
          value={memory.liked}
          onChange={(value) => onMemoryChange("liked", value)}
        />
        <MemoryField
          label="熟悉"
          value={memory.familiar}
          onChange={(value) => onMemoryChange("familiar", value)}
        />
        <MemoryField
          label="避开"
          value={memory.disliked}
          onChange={(value) => onMemoryChange("disliked", value)}
        />
      </div>

      <section className="section-block">
        <SectionTitle icon={Flame} title="口味上限" />
        <SegmentedControl
          options={profileOptions.spiceTolerance}
          value={profile.spiceTolerance}
          onChange={(value) => onProfileChange("spiceTolerance", value)}
        />
        <SegmentedControl
          options={profileOptions.intensity}
          value={profile.intensity}
          onChange={(value) => onProfileChange("intensity", value)}
        />
        <SegmentedControl
          options={profileOptions.sweetSavory}
          value={profile.sweetSavory}
          onChange={(value) => onProfileChange("sweetSavory", value)}
        />
      </section>

      <section className="section-block">
        <SectionTitle icon={Bot} title="模型" />
        <div className="model-status-card">
          <div>
            <strong>已接入阿里百炼</strong>
            <span>前端发图片给后端代理，密钥只保存在 Worker Secret。</span>
          </div>
          <a href={API_HEALTH_URL} target="_blank" rel="noreferrer">
            接口状态
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="provider-grid">
          {providerOptions.map((option) => (
            <button
              className={provider === option.id ? "active" : ""}
              key={option.id}
              type="button"
              onClick={() => onProviderChange(option.id)}
            >
              <strong>{option.name}</strong>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="primary-action" type="button" onClick={onNext}>
        继续拍照
        <ChevronRight size={18} />
      </button>
    </section>
  );
}

function MemoryField({ label, value, onChange }) {
  return (
    <label className="memory-field">
      <span>{label}</span>
      <textarea
        value={value}
        rows={2}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function CaptureView({
  source,
  report,
  analysisMode,
  onUploadClick,
  onAnalyze,
  onSampleSelect,
}) {
  return (
    <section className="flow-stack">
      <div className="capture-stage">
        <img src={source.image} alt={source.title} />
        <div className="stage-glass">
          <span>{source.title}</span>
          <strong>{report.match}%</strong>
        </div>
      </div>

      <div className="capture-actions">
        <button className="primary-action" type="button" onClick={onUploadClick}>
          <Upload size={18} />
          拍照 / 上传
        </button>
        <button className="ghost-action" type="button" onClick={onAnalyze}>
          <ScanSearch size={18} />
          分析
        </button>
      </div>

      <div className="model-status-line">
        <Bot size={15} />
        <span>
          {analysisMode === "aliyun"
            ? "阿里百炼视觉模型已连接"
            : "优先调用阿里百炼，失败时本地备用"}
        </span>
        <a href={API_HEALTH_URL} target="_blank" rel="noreferrer">
          查看
        </a>
      </div>

      <section className="section-block">
        <SectionTitle icon={ImagePlus} title="示例" />
        <div className="sample-row">
          {sampleFoods.map((food) => (
            <button key={food.id} type="button" onClick={() => onSampleSelect(food)}>
              <img src={food.image} alt={food.title} />
              <span>{food.title}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mini-report">
        <div>
          <span>当前判断</span>
          <strong>{report.foodName}</strong>
        </div>
        <div>
          <span>主味道</span>
          <strong>{getTopFlavorLabels(report.scores).slice(0, 2).join(" / ")}</strong>
        </div>
      </div>
    </section>
  );
}

function ReportView({
  isAnalyzing,
  image,
  report,
  analysisMode,
  feedback,
  onFeedback,
  onCapture,
}) {
  if (isAnalyzing) return <AnalyzingView />;

  const topFlavors = getTopFlavorLabels(report.scores).slice(0, 3);

  return (
    <section className="flow-stack report-view">
      <div className="result-hero">
        <img src={image} alt={report.foodName} />
        <div className="result-score">
          <span>可能喜欢</span>
          <strong>{report.match}%</strong>
        </div>
      </div>

      <div className="result-title">
        <div>
          <span>
            {analysisMode === "aliyun"
              ? "阿里视觉模型"
              : analysisMode === "sample"
                ? "示例内置分析"
                : "本地备用分析"}{" "}
            · 可信度{" "}
            {report.confidence}%
          </span>
          <h2>{report.foodName}</h2>
        </div>
        <button type="button" onClick={onCapture}>
          <Camera size={17} />
        </button>
      </div>

      <div className="quick-cards">
        <InfoCard label="像" value={report.userComparisons[0]?.food || report.similar[0]} />
        <InfoCard label="味道" value={topFlavors.join(" / ")} />
        <InfoCard label="建议" value={getVerdict(report.match)} />
      </div>

      <section className="translation-panel">
        <SectionTitle icon={MessageCircle} title="味觉翻译" />
        <p>{report.personalTranslation}</p>
        <div className="comparison-list">
          {report.userComparisons.slice(0, 3).map((item) => (
            <div key={item.food}>
              <span>{item.food}</span>
              <strong>{item.similarity}%</strong>
              <p>{item.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionTitle icon={Sparkles} title="味道刻度" />
        <div className="flavor-bars">
          {Object.entries(report.scores).map(([key, value]) => (
            <div className="flavor-bar" key={key}>
              <span>{flavorLabels[key]}</span>
              <i>
                <b style={{ width: `${value * 10}%` }} />
              </i>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="tag-cloud">
        {[...report.textures, ...report.aromas].slice(0, 8).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="warning-line">
        <AlertTriangle size={17} />
        <span>{report.warnings.join(" / ")}。图片无法判断食品安全。</span>
      </div>

      <details className="json-card">
        <summary>
          <Code2 size={16} />
          图片识别 JSON
        </summary>
        <pre>{JSON.stringify(report.modelJson, null, 2)}</pre>
      </details>

      <div className="feedback-row">
        <FeedbackButton
          active={feedback === "good"}
          icon={ThumbsUp}
          label="准"
          onClick={() => onFeedback("good")}
        />
        <FeedbackButton
          active={feedback === "like"}
          icon={Heart}
          label="喜欢"
          onClick={() => onFeedback("like")}
        />
        <FeedbackButton
          active={feedback === "spicy"}
          icon={Flame}
          label="更辣"
          onClick={() => onFeedback("spicy")}
        />
        <FeedbackButton
          active={feedback === "bad"}
          icon={ThumbsDown}
          label="不准"
          onClick={() => onFeedback("bad")}
        />
      </div>
    </section>
  );
}

function AnalyzingView() {
  return (
    <section className="analyzing-view">
      <div className="scan-orbit">
        <ScanSearch size={34} />
      </div>
      <h2>正在生成味道画像</h2>
      <div className="scan-steps">
        <span>图片线索</span>
        <span>味觉记忆</span>
        <span>相似味道</span>
      </div>
    </section>
  );
}

function InfoCard({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="section-title">
      <Icon size={18} />
      <h3>{title}</h3>
    </div>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="segmented-control">
      {options.map((option) => (
        <button
          className={value === option.value ? "active" : ""}
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function TabButton({ active, icon: Icon, label, badge, onClick }) {
  return (
    <button className={active ? "active" : ""} type="button" onClick={onClick}>
      <Icon size={20} />
      <span>{label}</span>
      {badge && <em>{badge}</em>}
    </button>
  );
}

function FeedbackButton({ active, icon: Icon, label, onClick }) {
  return (
    <button className={active ? "active" : ""} type="button" onClick={onClick}>
      <Icon size={16} />
      {label}
    </button>
  );
}

function buildReport(source, memory, profile, provider) {
  const base = source.seed || inferReportFromClues(source.clues || {});
  const memoryProfile = parseTasteMemory(memory);
  const match = calculateMatch(base, profile, memoryProfile);
  const providedComparisons = Array.isArray(base.userComparisons)
    ? base.userComparisons.slice(0, 5)
    : [];
  const userComparisons = providedComparisons.length
    ? providedComparisons
    : buildUserComparisons(base, memoryProfile);
  const personalTranslation =
    base.personalTranslation ||
    buildPersonalTranslation(base, userComparisons, memoryProfile, match);

  return {
    ...base,
    match,
    userComparisons,
    personalTranslation,
    modelJson: buildModelJson(base, source, provider, memoryProfile, match),
  };
}

function inferReportFromClues(clues) {
  const red = clues.red || 0;
  const golden = clues.golden || 0;
  const green = clues.green || 0;
  const creamy = clues.creamy || 0;
  const dark = clues.dark || 0;

  if (red > 0.45) {
    return {
      foodName: "红油酱汁类食物",
      confidence: 64,
      scores: {
        sweet: roundScore(2 + golden * 3),
        spicy: roundScore(5 + red * 5),
        salty: roundScore(5 + dark * 3),
        sour: roundScore(1 + green * 3),
        bitter: roundScore(1 + dark * 2),
        umami: roundScore(5 + dark * 3),
        greasy: roundScore(4 + red * 4),
        numbing: roundScore(2 + red * 4),
      },
      textures: ["挂汁", "油润", "浓郁"],
      aromas: ["辣椒香", "酱香", "熟油香"],
      similar: ["红油拌菜", "麻辣香锅", "辣酱拌饭"],
      warnings: ["可能偏辣", "可能偏油"],
      description: "红色和酱汁感较强，整体会偏辣、咸鲜和浓郁。",
    };
  }

  if (golden > 0.52 || dark > 0.48) {
    return {
      foodName: "煎炸或烘烤类食物",
      confidence: 61,
      scores: {
        sweet: roundScore(2 + creamy * 4),
        spicy: roundScore(1 + red * 4),
        salty: roundScore(4 + dark * 3),
        sour: roundScore(1 + green * 2),
        bitter: roundScore(1 + dark * 3),
        umami: roundScore(4 + golden * 3),
        greasy: roundScore(5 + golden * 4),
        numbing: 0,
      },
      textures: ["焦香", "外脆", "扎实"],
      aromas: ["烘烤香", "油脂香", "焦糖化香"],
      similar: ["炸物", "烤鸡", "酱烧肉"],
      warnings: ["可能偏油", "焦香可能带微苦"],
      description: "画面偏金黄或焦褐，通常会有焦香、油脂香和咸鲜感。",
    };
  }

  if (creamy > 0.48) {
    return {
      foodName: "奶油甜品类食物",
      confidence: 59,
      scores: {
        sweet: roundScore(6 + creamy * 4),
        spicy: 0,
        salty: 1,
        sour: roundScore(1 + green * 3),
        bitter: roundScore(1 + dark * 2),
        umami: 1,
        greasy: roundScore(3 + creamy * 3),
        numbing: 0,
      },
      textures: ["顺滑", "绵密", "柔软"],
      aromas: ["奶香", "黄油香", "甜香"],
      similar: ["奶油蛋糕", "芝士甜点", "布丁"],
      warnings: ["可能含奶制品", "甜度可能偏高"],
      description: "浅色和奶油感明显，味道会偏甜、柔和、乳脂感强。",
    };
  }

  if (green > 0.45) {
    return {
      foodName: "清爽蔬菜类食物",
      confidence: 58,
      scores: {
        sweet: roundScore(2 + green * 2),
        spicy: roundScore(red * 3),
        salty: 3,
        sour: roundScore(2 + green * 3),
        bitter: roundScore(2 + green * 2),
        umami: 3,
        greasy: roundScore(1 + golden * 2),
        numbing: 0,
      },
      textures: ["爽脆", "多汁", "清淡"],
      aromas: ["青草香", "柠檬香", "清新香"],
      similar: ["沙拉", "凉拌菜", "蔬菜碗"],
      warnings: ["可能偏生冷", "草本味可能明显"],
      description: "绿色食材占比较高，整体偏清爽，可能有酸味和草本苦感。",
    };
  }

  return {
    foodName: "混合风味料理",
    confidence: 52,
    scores: {
      sweet: 4,
      spicy: 3,
      salty: 5,
      sour: 2,
      bitter: 1,
      umami: 5,
      greasy: 4,
      numbing: 0,
    },
    textures: ["复合", "柔软", "有嚼感"],
    aromas: ["酱香", "熟食香", "轻调味"],
    similar: ["盖饭", "家常炒菜", "拌饭"],
    warnings: ["真实味道受调料比例影响较大"],
    description: "画面线索均衡，可能是中等强度的咸鲜型。",
  };
}

function calculateMatch(base, profile, memoryProfile) {
  const { scores } = base;
  const spiceLimit = {
    none: 1,
    mild: 4,
    medium: 7,
    hot: 10,
  }[profile.spiceTolerance];
  let match = 68;

  if (scores.spicy > spiceLimit) match -= (scores.spicy - spiceLimit) * 7;
  if (profile.intensity === "light") match -= Math.max(0, scores.greasy - 5) * 5;
  if (profile.intensity === "heavy") match += Math.max(scores.umami, scores.salty) >= 6 ? 8 : 0;
  if (profile.sweetSavory === "sweet") match += scores.sweet >= 6 ? 10 : -4;
  if (profile.sweetSavory === "savory") match += scores.umami >= 6 || scores.salty >= 6 ? 10 : -4;

  const traitText = [
    base.foodName,
    base.description,
    ...base.textures,
    ...base.aromas,
    ...base.similar,
    ...base.warnings,
  ].join(" ");

  memoryProfile.preferredTraits.forEach((trait) => {
    if (traitText.includes(trait)) match += 4;
  });
  memoryProfile.avoidTraits.forEach((trait) => {
    if (traitText.includes(trait)) match -= 7;
  });
  memoryProfile.likedFoods.forEach((food) => {
    if (traitText.includes(food)) match += 6;
  });
  memoryProfile.dislikedFoods.forEach((food) => {
    if (traitText.includes(food)) match -= 8;
  });

  return clamp(Math.round(match), 18, 96);
}

function parseTasteMemory(memory) {
  const likedFoods = splitFoodText(memory.liked);
  const familiarFoods = splitFoodText(memory.familiar);
  const dislikedFoods = splitFoodText(memory.disliked);

  return {
    likedFoods,
    familiarFoods,
    dislikedFoods,
    preferredTraits: inferTraitsFromFoods([...likedFoods, ...familiarFoods]),
    avoidTraits: inferAvoidTraits(dislikedFoods),
  };
}

function splitFoodText(text) {
  return text
    .split(/[、,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function inferTraitsFromFoods(foods) {
  const text = foods.join(" ");
  const traits = [];
  const rules = [
    ["炸鸡|烧烤|烤翅|薯条", ["酥脆", "焦香", "油脂香"]],
    ["糖醋|番茄|柠檬", ["酸甜", "清亮酸感"]],
    ["麻辣|火锅|麻辣烫|酸辣粉", ["麻辣", "咸鲜", "红油香"]],
    ["芝士|奶茶|蛋糕|奶油", ["奶香", "顺滑", "甜"]],
    ["咖喱", ["香料感", "浓稠", "咸鲜"]],
    ["牛腩|烤肉|肉", ["肉香", "咸鲜", "扎实"]],
  ];

  rules.forEach(([pattern, values]) => {
    if (new RegExp(pattern).test(text)) traits.push(...values);
  });

  return [...new Set(traits)].slice(0, 10);
}

function inferAvoidTraits(foods) {
  const text = foods.join(" ");
  const traits = [];
  const rules = [
    ["香菜", ["香菜", "草本味"]],
    ["苦瓜|苦", ["苦味"]],
    ["海鲜|腥", ["腥味"]],
    ["内脏", ["内脏味", "腥味"]],
    ["油|腻", ["油润"]],
    ["辣", ["过辣"]],
  ];

  rules.forEach(([pattern, values]) => {
    if (new RegExp(pattern).test(text)) traits.push(...values);
  });

  return [...new Set(traits)].slice(0, 10);
}

function buildUserComparisons(base, memoryProfile) {
  const candidates = [
    ...memoryProfile.likedFoods,
    ...memoryProfile.familiarFoods,
    ...base.similar,
  ];

  return [...new Set(candidates)].slice(0, 5).map((food, index) => {
    const directMatch = base.similar.includes(food) || base.foodName.includes(food);
    const similarity = clamp(86 - index * 7 + (directMatch ? 8 : 0), 42, 94);

    return {
      food,
      similarity,
      reason: directMatch ? "调味方向和做法接近。" : buildComparisonReason(food, base),
    };
  });
}

function buildComparisonReason(food, base) {
  if (/炸鸡|烤|烧烤|薯条/.test(food)) return `对比${base.aromas[0] || "熟食香"}和${base.textures[0] || "口感"}。`;
  if (/糖醋|番茄|柠檬/.test(food)) return "对比酸甜强度和入口清亮感。";
  if (/麻辣|火锅|麻辣烫/.test(food)) return "对比辣度、麻感和咸鲜强度。";
  if (/奶茶|蛋糕|芝士/.test(food)) return "对比甜度、奶香和顺滑感。";
  return `对比${base.textures.slice(0, 2).join("、")}和${base.aromas[0] || "香气"}。`;
}

function buildPersonalTranslation(base, comparisons, memoryProfile, match) {
  const [nearest] = comparisons;
  const avoidHit = memoryProfile.avoidTraits.find((trait) =>
    [...base.textures, ...base.aromas, ...base.warnings].join(" ").includes(trait)
  );

  if (avoidHit) return `它可能碰到你不太喜欢的「${avoidHit}」，建议先少量尝试。`;
  if (nearest && match >= 72) {
    return `它接近你熟悉的「${nearest.food}」，但${getTopFlavorLabels(base.scores)
      .slice(0, 2)
      .join("、")}会更明显。`;
  }
  if (nearest) return `可以拿「${nearest.food}」做参照，但它的调味和口感不完全重合。`;
  return "它和你的味觉记忆重合度一般，适合低风险尝一口。";
}

function buildModelJson(base, source, provider, memoryProfile, match) {
  const modelJson = {
    model_provider: provider,
    analysis_source: source.modelSource || "local",
    input_type: source.type === "upload" ? "user_photo" : "sample_photo",
    food_candidates: [
      {
        name: base.foodName,
        confidence: Number((base.confidence / 100).toFixed(2)),
      },
    ],
    ingredients: guessIngredients(base),
    cooking_methods: guessMethods(base),
    flavor_scores: base.scores,
    texture_tags: base.textures,
    aroma_tags: base.aromas,
    user_memory: {
      liked_foods: memoryProfile.likedFoods.slice(0, 5),
      familiar_foods: memoryProfile.familiarFoods.slice(0, 5),
      avoid_traits: memoryProfile.avoidTraits,
    },
    user_like_score: match,
    risk_notes: base.warnings,
  };

  if (base.modelJson && Object.keys(base.modelJson).length) {
    modelJson.model_output = base.modelJson;
  }

  if (source.modelError) {
    modelJson.model_error = source.modelError;
  }

  return modelJson;
}

function guessIngredients(base) {
  const text = `${base.foodName} ${base.description}`;
  const ingredients = [];
  if (/鸡|炸鸡/.test(text)) ingredients.push("鸡肉");
  if (/面/.test(text)) ingredients.push("面条");
  if (/奶|芝士|蛋糕|塔/.test(text)) ingredients.push("奶制品");
  if (/蔬菜|沙拉|香草/.test(text)) ingredients.push("蔬菜");
  if (/辣|红油/.test(text)) ingredients.push("辣椒或红油");
  return ingredients.length ? ingredients : ["主食材不确定"];
}

function guessMethods(base) {
  const text = `${base.foodName} ${base.description} ${base.textures.join(" ")}`;
  const methods = [];
  if (/炸|酥脆|外脆/.test(text)) methods.push("油炸");
  if (/烤|焦香/.test(text)) methods.push("烘烤或煎烤");
  if (/裹酱|挂汁|酱/.test(text)) methods.push("裹酱");
  if (/凉|清爽|沙拉/.test(text)) methods.push("凉拌");
  return methods.length ? methods : ["常规烹调"];
}

function getTopFlavorLabels(scores) {
  return Object.entries(scores)
    .filter(([key]) => key !== "bitter" && key !== "numbing")
    .sort(([, first], [, second]) => second - first)
    .map(([key, value]) => `${flavorLabels[key]} ${value}`);
}

function getVerdict(match) {
  if (match >= 82) return "很适合";
  if (match >= 72) return "值得试";
  if (match >= 58) return "先少量";
  return "谨慎";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function svgDataUrl(markup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function requestModelAnalysis(source, memory, profile) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45000);
  const imagePayload = source.image.startsWith("data:")
    ? { dataUrl: source.image }
    : { url: source.image };

  return fetch(ANALYSIS_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      image: imagePayload,
      memory,
      profile,
    }),
    signal: controller.signal,
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || `api_${response.status}`);
      }
      return data;
    })
    .finally(() => window.clearTimeout(timeout));
}

function resizeImageDataUrl(dataUrl, maxSize = 1280, quality = 0.86) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      if (scale >= 1) {
        resolve(dataUrl);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const context = canvas.getContext("2d");
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function analyzeImagePixels(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const width = 96;
      const height = Math.max(1, Math.round((img.height / img.width) * width));
      canvas.width = width;
      canvas.height = Math.min(120, height);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let red = 0;
      let golden = 0;
      let green = 0;
      let creamy = 0;
      let dark = 0;
      let count = 0;

      for (let index = 0; index < data.length; index += 16) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const brightness = (r + g + b) / 3;

        if (r > g * 1.15 && r > b * 1.2 && saturation > 0.2) red += 1;
        if (r > 145 && g > 95 && b < 95) golden += 1;
        if (g > r * 1.08 && g > b * 1.08) green += 1;
        if (r > 180 && g > 160 && b > 130 && saturation < 0.32) creamy += 1;
        if (brightness < 80) dark += 1;
        count += 1;
      }

      resolve({
        red: red / count,
        golden: golden / count,
        green: green / count,
        creamy: creamy / count,
        dark: dark / count,
      });
    };
    img.onerror = () =>
      resolve({ red: 0.2, golden: 0.3, green: 0.2, creamy: 0.2, dark: 0.2 });
    img.src = dataUrl;
  });
}

function roundScore(value) {
  return clamp(Math.round(value), 0, 10);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default App;
