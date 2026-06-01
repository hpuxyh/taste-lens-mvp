import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Camera,
  ChevronDown,
  Check,
  Code2,
  Database,
  Flame,
  Heart,
  ImagePlus,
  MessageSquareText,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Utensils,
} from "lucide-react";

const sampleFoods = [
  {
    id: "crispy-chicken",
    title: "甜辣炸鸡",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb36?auto=format&fit=crop&w=900&q=80",
    clues: { red: 0.55, golden: 0.8, green: 0.08, creamy: 0.12, dark: 0.28 },
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
      },
      textures: ["外脆", "裹酱", "肉嫩", "油润"],
      aromas: ["炸物香", "蒜香", "甜辣酱香"],
      description:
        "入口大概率先是炸衣的酥脆和油香，随后是浓稠甜辣酱，后味有一点蒜香和微微辣感。",
      similar: ["韩式炸鸡", "糖醋里脊", "辣味烤翅"],
      warnings: ["可能偏油", "可能含蒜"],
    },
  },
  {
    id: "mala-noodle",
    title: "麻辣拌面",
    image:
      "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80",
    clues: { red: 0.88, golden: 0.48, green: 0.12, creamy: 0.04, dark: 0.3 },
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
      },
      textures: ["劲道", "挂汁", "油润", "脆配菜"],
      aromas: ["花椒香", "辣椒油香", "芝麻香"],
      description:
        "整体会偏麻辣咸鲜，面条挂汁感明显，红油和花椒香会先出来，后段可能有一点芝麻或坚果香。",
      similar: ["麻辣香锅", "担担面", "红油抄手"],
      warnings: ["可能较辣", "可能含花生或芝麻"],
    },
  },
  {
    id: "lemon-dessert",
    title: "柠檬奶油塔",
    image:
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80",
    clues: { red: 0.08, golden: 0.58, green: 0.1, creamy: 0.82, dark: 0.06 },
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
      },
      textures: ["酥皮", "顺滑", "轻酸", "奶油感"],
      aromas: ["奶香", "柑橘香", "黄油香"],
      description:
        "味道会偏甜酸奶香，前段是黄油酥皮，接着是柠檬的清亮酸感，奶油会把酸味压得更柔和。",
      similar: ["柠檬派", "芝士蛋糕", "黄油曲奇"],
      warnings: ["可能含奶制品", "甜度偏高"],
    },
  },
  {
    id: "green-bowl",
    title: "香草蔬菜碗",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    clues: { red: 0.16, golden: 0.3, green: 0.86, creamy: 0.18, dark: 0.12 },
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
      },
      textures: ["爽脆", "多汁", "清淡", "颗粒感"],
      aromas: ["青草香", "橄榄油香", "柠檬香"],
      description:
        "整体会偏清爽，蔬菜的脆感和水分明显，可能带一点柠檬汁酸味、橄榄油香和轻微草本苦感。",
      similar: ["凯撒沙拉", "牛油果碗", "希腊沙拉"],
      warnings: ["可能有生冷口感", "草本味较明显"],
    },
  },
];

const defaultProfile = {
  spiceTolerance: "medium",
  intensity: "normal",
  sweetSavory: "balanced",
  avoids: ["腥味"],
};

const defaultTasteMemory = {
  liked:
    "韩式炸鸡、糖醋里脊、芝士蛋糕、日式咖喱、珍珠奶茶",
  familiar: "麻辣烫、烧烤、番茄牛腩、沙县拌面、奶茶",
  disliked: "香菜、苦瓜、太腥的海鲜、内脏、太油",
};

const modelProviders = [
  {
    id: "qwen",
    name: "Qwen 视觉",
    role: "主模型",
    description: "识别食材、做法、视觉线索并输出味道 JSON。",
  },
  {
    id: "doubao",
    name: "豆包视觉",
    role: "备选",
    description: "适合做速度、成本和中文描述对比。",
  },
  {
    id: "kimi",
    name: "Kimi 解释",
    role: "表达层",
    description: "把结构化结果翻译成用户熟悉的味道。",
  },
];

const flavorLabels = {
  sweet: "甜",
  spicy: "辣",
  salty: "咸",
  sour: "酸",
  bitter: "苦",
  umami: "鲜",
  greasy: "油润",
};

const profileOptions = {
  spiceTolerance: [
    { value: "none", label: "不吃辣" },
    { value: "mild", label: "微辣" },
    { value: "medium", label: "中辣" },
    { value: "hot", label: "很能吃" },
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
  avoids: ["太甜", "油腻", "腥味", "苦味", "奶味", "蒜味", "香菜"],
};

const initialSource = {
  type: "sample",
  ...sampleFoods[0],
};

function App() {
  const fileInputRef = useRef(null);
  const reportRef = useRef(null);
  const [profile, setProfile] = useState(defaultProfile);
  const [tasteMemory, setTasteMemory] = useState(defaultTasteMemory);
  const [selectedProvider, setSelectedProvider] = useState("qwen");
  const [visualSource, setVisualSource] = useState(initialSource);
  const [analysisSource, setAnalysisSource] = useState(initialSource);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState([]);
  const [profileOpen, setProfileOpen] = useState(true);

  const report = useMemo(
    () => buildReport(analysisSource, profile, tasteMemory, selectedProvider),
    [analysisSource, profile, tasteMemory, selectedProvider]
  );

  function scrollToReport() {
    reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function maybeScrollToReport() {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 820px)").matches
    ) {
      window.setTimeout(scrollToReport, 80);
    }
  }

  function analyzeSource(nextSource) {
    setVisualSource(nextSource);
    setIsAnalyzing(true);
    setFeedback("");

    window.setTimeout(() => {
      setAnalysisSource(nextSource);
      const nextReport = buildReport(
        nextSource,
        profile,
        tasteMemory,
        selectedProvider
      );
      setHistory((items) => [
        {
          id: `${Date.now()}-${nextSource.id || nextSource.title}`,
          image: nextSource.image,
          name: nextReport.foodName,
          match: nextReport.match,
        },
        ...items,
      ].slice(0, 4));
      setIsAnalyzing(false);
      maybeScrollToReport();
    }, 620);
  }

  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;

    const dataUrl = await readFileAsDataUrl(file);
    setVisualSource({
      id: `upload-${Date.now()}`,
      title: file.name.replace(/\.[^.]+$/, "") || "上传图片",
      image: dataUrl,
      type: "upload",
    });
    setIsAnalyzing(true);
    setFeedback("");

    const clues = await analyzeImagePixels(dataUrl);
    const uploadSource = {
      id: `upload-${Date.now()}`,
      title: file.name.replace(/\.[^.]+$/, "") || "上传图片",
      image: dataUrl,
      clues,
      type: "upload",
    };

    window.setTimeout(() => {
      setAnalysisSource(uploadSource);
      const nextReport = buildReport(
        uploadSource,
        profile,
        tasteMemory,
        selectedProvider
      );
      setHistory((items) => [
        {
          id: `${Date.now()}-${file.name}`,
          image: dataUrl,
          name: nextReport.foodName,
          match: nextReport.match,
        },
        ...items,
      ].slice(0, 4));
      setIsAnalyzing(false);
      maybeScrollToReport();
    }, 420);
  }

  function updateProfile(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function toggleAvoid(label) {
    setProfile((current) => {
      const exists = current.avoids.includes(label);
      return {
        ...current,
        avoids: exists
          ? current.avoids.filter((item) => item !== label)
          : [...current.avoids, label],
      };
    });
  }

  function updateTasteMemory(key, value) {
    setTasteMemory((current) => ({ ...current, [key]: value }));
  }

  function handleDrop(event) {
    event.preventDefault();
    const [file] = event.dataTransfer.files;
    handleFile(file);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={20} />
          </span>
          <div>
            <p>TasteLens</p>
            <span>味觉相机 MVP</span>
          </div>
        </div>
        <div className="header-pill">
          <Utensils size={16} />
          视觉推测
        </div>
      </header>

      <main className="app-grid">
        <section className="tool-panel capture-panel" aria-label="味觉相机">
          <div className="panel-title">
            <div>
              <h1>拍照看味道</h1>
              <p>酸甜苦辣咸鲜，先有个判断。</p>
            </div>
            <button
              className="icon-button"
              type="button"
              title="重新分析"
              onClick={() => analyzeSource(analysisSource)}
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div
            className="image-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <img src={visualSource.image} alt={visualSource.title} />
            <div className="dropzone-overlay">
              <Camera size={26} />
              <strong>{visualSource.title}</strong>
            </div>
          </div>

          <div className="action-row">
            <button
              className="primary-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={18} />
              拍照 / 上传
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={scrollToReport}
            >
              <Heart size={17} />
              看报告
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          <QuickSnapshot
            isAnalyzing={isAnalyzing}
            report={report}
            memory={tasteMemory}
            onViewReport={scrollToReport}
          />

          <div className="sample-strip" aria-label="示例食物">
            {sampleFoods.map((food) => (
              <button
                className={`sample-button ${
                  analysisSource.id === food.id ? "active" : ""
                }`}
                key={food.id}
                type="button"
                onClick={() => analyzeSource({ ...food, type: "sample" })}
              >
                <img src={food.image} alt={food.title} />
                <span>{food.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section
          className={`tool-panel profile-panel ${profileOpen ? "open" : ""}`}
          aria-label="个人口味"
        >
          <div className="panel-title compact">
            <div>
              <h2>我的味觉</h2>
              <p>先输入熟悉的食物，再看新味道。</p>
            </div>
            <button
              className="profile-toggle"
              type="button"
              aria-expanded={profileOpen}
              aria-controls="profile-content"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <SlidersHorizontal size={18} />
              <ChevronDown size={18} />
            </button>
          </div>

          <div
            className="profile-content"
            id="profile-content"
            hidden={!profileOpen}
          >
            <TasteMemoryEditor
              memory={tasteMemory}
              onChange={updateTasteMemory}
            />

            <ModelProviderPicker
              selectedProvider={selectedProvider}
              onSelect={setSelectedProvider}
            />

            <PreferenceGroup
              label="辣度上限"
              options={profileOptions.spiceTolerance}
              value={profile.spiceTolerance}
              onChange={(value) => updateProfile("spiceTolerance", value)}
            />
            <PreferenceGroup
              label="口味强度"
              options={profileOptions.intensity}
              value={profile.intensity}
              onChange={(value) => updateProfile("intensity", value)}
            />
            <PreferenceGroup
              label="偏好方向"
              options={profileOptions.sweetSavory}
              value={profile.sweetSavory}
              onChange={(value) => updateProfile("sweetSavory", value)}
            />

            <div className="avoid-list">
              <span className="field-label">不喜欢</span>
              <div className="chip-grid">
                {profileOptions.avoids.map((label) => (
                  <button
                    className={`chip-toggle ${
                      profile.avoids.includes(label) ? "active" : ""
                    }`}
                    key={label}
                    type="button"
                    onClick={() => toggleAvoid(label)}
                  >
                    {profile.avoids.includes(label) && <Check size={14} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {history.length > 0 && (
              <div className="history-list">
                <span className="field-label">最近</span>
                {history.map((item) => (
                  <div className="history-item" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <span>{item.name}</span>
                    <strong>{item.match}%</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section ref={reportRef} className="report-panel" aria-label="味道报告">
          {isAnalyzing ? (
            <AnalyzingCard />
          ) : (
            <TasteReport
              report={report}
              image={analysisSource.image}
              feedback={feedback}
              onFeedback={setFeedback}
            />
          )}
        </section>
      </main>

      <footer className="mobile-action-bar" aria-label="快捷操作">
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          <Camera size={19} />
          拍照
        </button>
        <button type="button" onClick={scrollToReport}>
          <Heart size={18} />
          报告 {report.match}%
        </button>
      </footer>
    </div>
  );
}

function QuickSnapshot({ isAnalyzing, report, memory, onViewReport }) {
  const topFlavors = getTopFlavorLabels(report.scores).slice(0, 3);
  const [firstReference] = parseTasteMemory(memory).likedFoods;

  return (
    <div className="quick-snapshot">
      <div>
        <span>{isAnalyzing ? "正在分析" : "快速判断"}</span>
        <strong>
          {isAnalyzing ? "生成味道画像中" : `${report.match}% ${getVerdict(report.match)}`}
        </strong>
        <p>
          {isAnalyzing
            ? "识别食材、做法和个人偏好"
            : `${topFlavors.join(" / ")} · 参照 ${firstReference || "你的味觉记忆"}`}
        </p>
      </div>
      <button type="button" onClick={onViewReport}>
        {isAnalyzing ? "稍等" : "详情"}
      </button>
    </div>
  );
}

function TasteMemoryEditor({ memory, onChange }) {
  const parsed = parseTasteMemory(memory);

  return (
    <div className="memory-editor">
      <div className="module-heading">
        <Database size={18} />
        <div>
          <h3>味觉记忆</h3>
          <p>先告诉它你熟悉什么味道。</p>
        </div>
      </div>

      <MemoryField
        label="喜欢吃"
        value={memory.liked}
        onChange={(value) => onChange("liked", value)}
      />
      <MemoryField
        label="熟悉的味道"
        value={memory.familiar}
        onChange={(value) => onChange("familiar", value)}
      />
      <MemoryField
        label="不喜欢"
        value={memory.disliked}
        onChange={(value) => onChange("disliked", value)}
      />

      <div className="memory-chips">
        {parsed.preferredTraits.slice(0, 6).map((trait) => (
          <span key={trait}>{trait}</span>
        ))}
      </div>
    </div>
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

function ModelProviderPicker({ selectedProvider, onSelect }) {
  return (
    <div className="model-picker">
      <div className="module-heading">
        <Bot size={18} />
        <div>
          <h3>模型方案</h3>
          <p>网页原型先模拟，后端可接真实 API。</p>
        </div>
      </div>

      <div className="provider-list">
        {modelProviders.map((provider) => (
          <button
            className={selectedProvider === provider.id ? "active" : ""}
            key={provider.id}
            type="button"
            onClick={() => onSelect(provider.id)}
          >
            <strong>{provider.name}</strong>
            <span>{provider.role}</span>
            <em>{provider.description}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreferenceGroup({ label, options, value, onChange }) {
  return (
    <div className="preference-group">
      <span className="field-label">{label}</span>
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
    </div>
  );
}

function AnalyzingCard() {
  return (
    <div className="report-card analyzing">
      <div className="analysis-spinner">
        <ImagePlus size={28} />
      </div>
      <h2>正在生成味道画像</h2>
      <div className="analysis-steps">
        <span>食材线索</span>
        <span>做法判断</span>
        <span>偏好匹配</span>
      </div>
    </div>
  );
}

function TasteReport({ report, image, feedback, onFeedback }) {
  const topFlavors = getTopFlavorLabels(report.scores).slice(0, 3);
  const feedbackOptions = [
    { value: "accurate", label: "准", icon: ThumbsUp },
    { value: "too-spicy", label: "更辣", icon: Flame },
    { value: "too-sweet", label: "更甜", icon: Heart },
    { value: "missed", label: "不准", icon: ThumbsDown },
  ];

  return (
    <article className="report-card">
      <div className="report-hero">
        <img src={image} alt={report.foodName} />
        <div className="match-badge">
          <span>你可能喜欢</span>
          <strong>{report.match}%</strong>
        </div>
      </div>

      <div className="report-head">
        <div>
          <span className="eyebrow">可信度 {report.confidence}%</span>
          <h2>{report.foodName}</h2>
        </div>
        <div className={`verdict ${report.match >= 72 ? "good" : "careful"}`}>
          {report.match >= 72 ? "值得尝试" : "谨慎尝试"}
        </div>
      </div>

      <div className="taste-summary">
        <div>
          <span>主味道</span>
          <strong>{topFlavors.join(" / ")}</strong>
        </div>
        <div>
          <span>第一口</span>
          <strong>{report.textures.slice(0, 2).join(" / ")}</strong>
        </div>
        <div>
          <span>建议</span>
          <strong>{getVerdict(report.match)}</strong>
        </div>
      </div>

      <div className="report-body">
        <div className="radar-wrap">
          <RadarChart scores={report.scores} />
        </div>

        <div className="score-list">
          {Object.entries(report.scores).map(([key, value]) => (
            <div className="score-row" key={key}>
              <span>{flavorLabels[key]}</span>
              <div className="score-track">
                <i style={{ width: `${value * 10}%` }} />
              </div>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <p className="flavor-copy">{report.description}</p>

      <div className="translation-card">
        <div className="module-heading">
          <MessageSquareText size={18} />
          <div>
            <h3>按你的味觉翻译</h3>
            <p>{report.personalTranslation}</p>
          </div>
        </div>
        <div className="comparison-list">
          {report.userComparisons.map((item) => (
            <div key={item.food}>
              <span>{item.food}</span>
              <strong>{item.similarity}%</strong>
              <p>{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="tag-section">
        <TagGroup title="口感" tags={report.textures} />
        <TagGroup title="香气" tags={report.aromas} />
        <TagGroup title="像这些" tags={report.similar} />
      </div>

      <div className="reason-box">
        <Heart size={18} />
        <p>{report.reason}</p>
      </div>

      <div className="warning-row">
        <AlertTriangle size={18} />
        <span>{report.warnings.join(" / ")}。视觉推测不能判断食品安全。</span>
      </div>

      <details className="json-preview">
        <summary>
          <Code2 size={17} />
          图片识别 JSON
        </summary>
        <pre>{JSON.stringify(report.modelJson, null, 2)}</pre>
      </details>

      <div className="feedback-row">
        {feedbackOptions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={feedback === item.value ? "active" : ""}
              key={item.value}
              type="button"
              onClick={() => onFeedback(item.value)}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>
      {feedback && <div className="saved-note">已记录这次反馈</div>}
    </article>
  );
}

function TagGroup({ title, tags }) {
  return (
    <div className="tag-group">
      <span>{title}</span>
      <div>
        {tags.map((tag) => (
          <em key={tag}>{tag}</em>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ scores }) {
  const axes = ["sweet", "spicy", "salty", "sour", "umami", "greasy"];
  const center = 110;
  const maxRadius = 78;
  const points = axes
    .map((axis, index) => {
      const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
      const radius = (scores[axis] / 10) * maxRadius;
      return `${center + Math.cos(angle) * radius},${
        center + Math.sin(angle) * radius
      }`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 220 220" role="img" aria-label="味道雷达图">
      {[1, 0.72, 0.44].map((scale) => (
        <polygon
          className="radar-grid"
          key={scale}
          points={axes
            .map((_, index) => {
              const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
              const radius = maxRadius * scale;
              return `${center + Math.cos(angle) * radius},${
                center + Math.sin(angle) * radius
              }`;
            })
            .join(" ")}
        />
      ))}
      {axes.map((axis, index) => {
        const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
        const x = center + Math.cos(angle) * (maxRadius + 22);
        const y = center + Math.sin(angle) * (maxRadius + 22);
        return (
          <g key={axis}>
            <line
              className="radar-axis"
              x1={center}
              y1={center}
              x2={center + Math.cos(angle) * maxRadius}
              y2={center + Math.sin(angle) * maxRadius}
            />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle">
              {flavorLabels[axis]}
            </text>
          </g>
        );
      })}
      <polygon className="radar-value" points={points} />
    </svg>
  );
}

function buildReport(source, profile, tasteMemory, selectedProvider) {
  const base = source.seed || inferReportFromClues(source.clues || {});
  const memoryProfile = parseTasteMemory(tasteMemory);
  const match = calculateMatch(base.scores, profile, base, memoryProfile);
  const reason = buildReason(base.scores, profile, match);
  const userComparisons = buildUserComparisons(base, memoryProfile);
  const personalTranslation = buildPersonalTranslation(
    base,
    userComparisons,
    memoryProfile,
    match
  );

  return {
    ...base,
    match,
    reason,
    userComparisons,
    personalTranslation,
    modelJson: buildModelJson(base, source, selectedProvider, memoryProfile, match),
  };
}

function inferReportFromClues(clues) {
  const red = clues.red || 0;
  const golden = clues.golden || 0;
  const green = clues.green || 0;
  const creamy = clues.creamy || 0;
  const dark = clues.dark || 0;

  if (red > 0.48) {
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
      },
      textures: ["挂汁", "油润", "浓郁"],
      aromas: ["辣椒香", "酱香", "熟油香"],
      description:
        "画面里红色和酱汁感较强，味道大概率偏辣、咸鲜和浓郁，入口会有明显调料存在感。",
      similar: ["红油拌菜", "麻辣香锅", "辣酱拌饭"],
      warnings: ["可能偏辣", "可能偏油"],
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
      },
      textures: ["焦香", "外脆", "扎实"],
      aromas: ["烘烤香", "油脂香", "焦糖化香"],
      description:
        "画面偏金黄或焦褐，通常意味着煎炸、烘烤或酱烧，味道会更香、更咸鲜，油脂感也会更明显。",
      similar: ["炸物", "烤鸡", "酱烧肉"],
      warnings: ["可能偏油", "焦香可能带微苦"],
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
      },
      textures: ["顺滑", "绵密", "柔软"],
      aromas: ["奶香", "黄油香", "甜香"],
      description:
        "浅色和奶油感较明显，味道可能偏甜、柔和、乳脂感强，口感会比清爽型食物更厚。",
      similar: ["奶油蛋糕", "芝士甜点", "布丁"],
      warnings: ["可能含奶制品", "甜度可能偏高"],
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
      },
      textures: ["爽脆", "多汁", "清淡"],
      aromas: ["青草香", "柠檬香", "清新香"],
      description:
        "绿色食材占比较高，味道大概率更清爽，可能有一点酸味、草本味或蔬菜本身的轻微苦感。",
      similar: ["沙拉", "凉拌菜", "蔬菜碗"],
      warnings: ["可能偏生冷", "草本味可能明显"],
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
    },
    textures: ["复合", "柔软", "有嚼感"],
    aromas: ["酱香", "熟食香", "轻调味"],
    description:
      "画面线索比较均衡，味道可能是中等强度的咸鲜型，具体甜辣酸度需要更多食材和酱汁信息判断。",
    similar: ["盖饭", "家常炒菜", "拌饭"],
    warnings: ["真实味道受调料比例影响较大"],
  };
}

function calculateMatch(scores, profile, base, memoryProfile) {
  const spiceLimit = {
    none: 1,
    mild: 4,
    medium: 7,
    hot: 10,
  }[profile.spiceTolerance];
  let match = 68;

  if (scores.spicy > spiceLimit) {
    match -= (scores.spicy - spiceLimit) * 7;
  } else if (scores.spicy > 0 && scores.spicy >= spiceLimit - 2) {
    match += 5;
  }

  if (profile.intensity === "light") {
    match -= Math.max(0, scores.salty - 5) * 3;
    match -= Math.max(0, scores.greasy - 5) * 4;
  }

  if (profile.intensity === "heavy") {
    match += Math.max(scores.umami, scores.salty, scores.spicy) >= 6 ? 9 : 0;
  }

  if (profile.sweetSavory === "sweet") {
    match += scores.sweet >= 6 ? 10 : -4;
  }

  if (profile.sweetSavory === "savory") {
    match += scores.umami >= 6 || scores.salty >= 6 ? 10 : -3;
  }

  if (profile.sweetSavory === "balanced") {
    const spread = Math.max(...Object.values(scores)) - Math.min(...Object.values(scores));
    match += spread <= 7 ? 4 : -2;
  }

  if (profile.avoids.includes("太甜") && scores.sweet >= 7) match -= 14;
  if (profile.avoids.includes("油腻") && scores.greasy >= 7) match -= 16;
  if (profile.avoids.includes("苦味") && scores.bitter >= 3) match -= 8;
  if (profile.avoids.includes("奶味") && base.aromas.some((item) => item.includes("奶"))) {
    match -= 12;
  }
  if (profile.avoids.includes("蒜味") && base.aromas.some((item) => item.includes("蒜"))) {
    match -= 9;
  }

  const memoryTraitText = [
    ...base.textures,
    ...base.aromas,
    ...base.similar,
    base.foodName,
  ].join(" ");

  memoryProfile.preferredTraits.forEach((trait) => {
    if (memoryTraitText.includes(trait)) match += 4;
  });

  memoryProfile.avoidTraits.forEach((trait) => {
    if (memoryTraitText.includes(trait)) match -= 7;
  });

  memoryProfile.likedFoods.forEach((food) => {
    if (base.similar.includes(food) || base.foodName.includes(food)) match += 6;
  });

  memoryProfile.dislikedFoods.forEach((food) => {
    if (base.foodName.includes(food) || memoryTraitText.includes(food)) match -= 8;
  });

  return clamp(Math.round(match), 18, 96);
}

function buildReason(scores, profile, match) {
  if (match >= 78) {
    if (profile.sweetSavory === "sweet" && scores.sweet >= 6) {
      return "你的偏好和它的甜香、柔和口感比较贴近，尝试成本低。";
    }
    if (profile.sweetSavory === "savory" && (scores.umami >= 6 || scores.salty >= 6)) {
      return "它的咸鲜和香气强度更贴近你的口味，整体命中率偏高。";
    }
    return "它的味道强度没有明显踩雷点，和当前口味档案比较匹配。";
  }

  if (match <= 52) {
    if (scores.spicy >= 6) return "辣度可能超过你的舒适区，适合先少量尝试。";
    if (scores.greasy >= 7) return "油润度偏高，如果你怕腻，可能吃几口就够了。";
    if (scores.sweet >= 7) return "甜度可能比较突出，不一定适合想吃清爽口的人。";
  }

  return "它有一部分味道符合你，但也存在可能不适合的强度或口感。";
}

function getTopFlavorLabels(scores) {
  return Object.entries(scores)
    .filter(([key]) => key !== "bitter")
    .sort(([, first], [, second]) => second - first)
    .map(([key, value]) => `${flavorLabels[key]} ${value}`);
}

function getVerdict(match) {
  if (match >= 82) return "很适合你";
  if (match >= 72) return "值得尝试";
  if (match >= 58) return "先少量尝试";
  return "谨慎尝试";
}

function parseTasteMemory(memory) {
  const likedFoods = splitFoodText(memory.liked);
  const familiarFoods = splitFoodText(memory.familiar);
  const dislikedFoods = splitFoodText(memory.disliked);
  const preferredTraits = inferTraitsFromFoods([...likedFoods, ...familiarFoods]);
  const avoidTraits = inferAvoidTraits(dislikedFoods);

  return {
    likedFoods,
    familiarFoods,
    dislikedFoods,
    preferredTraits,
    avoidTraits,
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
    ["炸鸡|烧烤|烤翅|薯条", ["酥脆", "焦香", "油炸香"]],
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
    ["油|腻", ["油润", "太油"]],
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

  const uniqueCandidates = [...new Set(candidates)].slice(0, 5);

  return uniqueCandidates.map((food, index) => {
    const directMatch = base.similar.includes(food) || base.foodName.includes(food);
    const similarity = clamp(86 - index * 7 + (directMatch ? 8 : 0), 42, 94);
    const reason = directMatch
      ? "和图片里的做法、调味方向很接近。"
      : buildComparisonReason(food, base);

    return { food, similarity, reason };
  });
}

function buildComparisonReason(food, base) {
  if (/炸鸡|烤|烧烤|薯条/.test(food)) return `都带有${base.aromas[0] || "熟食香"}和较强口感。`;
  if (/糖醋|番茄|柠檬/.test(food)) return "可以用酸甜强度来理解它的前段味道。";
  if (/麻辣|火锅|麻辣烫/.test(food)) return "可以用麻辣和咸鲜强度来做参照。";
  if (/奶茶|蛋糕|芝士/.test(food)) return "可以用甜度、奶香和顺滑感来对比。";
  return `主要对比${base.textures.slice(0, 2).join("、")}和${base.aromas[0] || "香气"}。`;
}

function buildPersonalTranslation(base, comparisons, memoryProfile, match) {
  const [nearest] = comparisons;
  const dislikedHit = memoryProfile.avoidTraits.find((trait) =>
    [...base.textures, ...base.aromas, ...base.warnings].join(" ").includes(trait)
  );

  if (nearest && match >= 72) {
    return `它会比较接近你熟悉的「${nearest.food}」，但这道菜的${getTopFlavorLabels(base.scores)
      .slice(0, 2)
      .join("、")}更明显。`;
  }

  if (dislikedHit) {
    return `它可能碰到你不太喜欢的「${dislikedHit}」，建议先少量尝试。`;
  }

  return `它和你的味觉记忆有部分重合，但图片线索还不足，适合把它当成一次低风险尝试。`;
}

function buildModelJson(base, source, selectedProvider, memoryProfile, match) {
  const provider = modelProviders.find((item) => item.id === selectedProvider);

  return {
    model_provider: provider?.name || "Qwen 视觉",
    input_type: source.type === "upload" ? "user_photo" : "sample_photo",
    food_candidates: [
      {
        name: base.foodName,
        confidence: Number((base.confidence / 100).toFixed(2)),
      },
    ],
    ingredients: guessIngredients(base),
    cooking_methods: guessMethods(base),
    visual_cues: {
      golden_crust: base.scores.greasy >= 6 ? 8 : 3,
      red_sauce: base.scores.spicy >= 5 ? 7 : 2,
      glossy_oil: base.scores.greasy,
      creaminess: base.aromas.some((item) => item.includes("奶")) ? 8 : 1,
      fresh_green: base.textures.includes("清淡") ? 7 : 1,
    },
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
