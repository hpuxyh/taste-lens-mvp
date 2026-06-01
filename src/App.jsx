import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Camera,
  Check,
  ChevronRight,
  Code2,
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

const sampleFoods = [
  {
    id: "crispy-chicken",
    title: "甜辣炸鸡",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb36?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
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
  { id: "qwen", name: "Qwen", label: "视觉主模型" },
  { id: "doubao", name: "豆包", label: "速度备选" },
  { id: "kimi", name: "Kimi", label: "表达层" },
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
  const [view, setView] = useState("memory");
  const [memory, setMemory] = useState(defaultMemory);
  const [profile, setProfile] = useState(defaultProfile);
  const [provider, setProvider] = useState("qwen");
  const [visualSource, setVisualSource] = useState(initialSource);
  const [analysisSource, setAnalysisSource] = useState(initialSource);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  function analyzeSource(source) {
    setVisualSource(source);
    setView("report");
    setIsAnalyzing(true);
    setFeedback("");

    window.setTimeout(() => {
      setAnalysisSource(source);
      setIsAnalyzing(false);
    }, 720);
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const image = await readFileAsDataUrl(file);
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
          onChange={(event) => handleFile(event.target.files?.[0])}
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

function CaptureView({ source, report, onUploadClick, onAnalyze, onSampleSelect }) {
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

function ReportView({ isAnalyzing, image, report, feedback, onFeedback, onCapture }) {
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
          <span>可信度 {report.confidence}%</span>
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
  const userComparisons = buildUserComparisons(base, memoryProfile);
  const personalTranslation = buildPersonalTranslation(base, userComparisons, memoryProfile, match);

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
  return {
    model_provider: provider,
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
