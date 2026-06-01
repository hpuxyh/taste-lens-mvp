const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/api/health") {
      if (request.method !== "GET") {
        return json({ error: "method_not_allowed" }, 405, corsHeaders);
      }

      return json(
        {
          ok: true,
          provider: "aliyun-dashscope",
          model: env.DASHSCOPE_MODEL,
          analyzeEndpoint: "/api/analyze-food",
        },
        200,
        corsHeaders
      );
    }

    if (url.pathname !== "/api/analyze-food") {
      return json({ error: "not_found" }, 404, corsHeaders);
    }

    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, corsHeaders);
    }

    if (!env.DASHSCOPE_API_KEY) {
      return json({ error: "missing_dashscope_api_key" }, 500, corsHeaders);
    }

    try {
      const payload = await request.json();
      const imageUrl = payload?.image?.dataUrl || payload?.image?.url;

      if (!imageUrl) {
        return json({ error: "missing_image" }, 400, corsHeaders);
      }

      if (imageUrl.length > 8_000_000) {
        return json({ error: "image_too_large" }, 413, corsHeaders);
      }

      const result = await analyzeWithDashScope({
        apiKey: env.DASHSCOPE_API_KEY,
        baseUrl: env.DASHSCOPE_BASE_URL,
        model: env.DASHSCOPE_MODEL,
        imageUrl,
        memory: payload.memory || {},
        profile: payload.profile || {},
      });

      return json(result, 200, corsHeaders);
    } catch (error) {
      return json(
        {
          error: "analysis_failed",
          message: error instanceof Error ? error.message : "unknown error",
        },
        500,
        corsHeaders
      );
    }
  },
};

async function analyzeWithDashScope({ apiKey, baseUrl, model, imageUrl, memory, profile }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "你是 TasteLens 的食物风味分析器。只输出严格 JSON，不要 Markdown，不要解释。你根据图片和用户味觉记忆推测味道，不判断食品安全。",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: buildPrompt(memory, profile),
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1800,
      response_format: { type: "json_object" },
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`DashScope ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = JSON.parse(text);
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("empty_model_content");
  }

  return normalizeModelJson(parseJsonContent(content));
}

function buildPrompt(memory, profile) {
  return `请分析这张食物图片，并结合用户味觉记忆输出味道画像。

用户味觉记忆：
- 喜欢：${memory.liked || ""}
- 熟悉：${memory.familiar || ""}
- 不喜欢/避开：${memory.disliked || ""}

用户口味设置：
- 辣度上限：${profile.spiceTolerance || "medium"}
- 口味强度：${profile.intensity || "normal"}
- 甜咸偏好：${profile.sweetSavory || "balanced"}

输出 JSON 必须符合这个结构：
{
  "foodName": "菜名或食物类型",
  "confidence": 0-100,
  "scores": {
    "sweet": 0-10,
    "spicy": 0-10,
    "salty": 0-10,
    "sour": 0-10,
    "bitter": 0-10,
    "umami": 0-10,
    "greasy": 0-10,
    "numbing": 0-10
  },
  "textures": ["口感标签，最多4个"],
  "aromas": ["香气标签，最多4个"],
  "similar": ["相似食物，最多4个"],
  "warnings": ["可能偏油/偏辣/含奶等图片可推测提醒，最多3个"],
  "description": "80字内风味描述",
  "userComparisons": [
    { "food": "用户熟悉或喜欢的食物", "similarity": 0-100, "reason": "20字内原因" }
  ],
  "personalTranslation": "用用户熟悉的食物解释这道食物，80字内",
  "modelJson": {
    "food_candidates": [{ "name": "候选食物", "confidence": 0-1 }],
    "ingredients": ["可见或推测食材"],
    "cooking_methods": ["烹饪方式"],
    "visual_cues": {
      "golden_crust": 0-10,
      "red_sauce": 0-10,
      "glossy_oil": 0-10,
      "creaminess": 0-10,
      "fresh_green": 0-10
    }
  }
}

要求：
- 如果不确定，菜名用“可能是...”。
- 不要承诺真实味道，只能说“可能/大概率”。
- 不要输出食品安全结论。`;
}

function parseJsonContent(content) {
  if (typeof content === "object") return content;
  const cleaned = String(content)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

function normalizeModelJson(raw) {
  const scores = raw.scores || {};
  const normalized = {
    foodName: String(raw.foodName || "未知食物"),
    confidence: clampNumber(raw.confidence, 0, 100, 55),
    scores: {
      sweet: clampNumber(scores.sweet, 0, 10, 3),
      spicy: clampNumber(scores.spicy, 0, 10, 2),
      salty: clampNumber(scores.salty, 0, 10, 4),
      sour: clampNumber(scores.sour, 0, 10, 1),
      bitter: clampNumber(scores.bitter, 0, 10, 1),
      umami: clampNumber(scores.umami, 0, 10, 4),
      greasy: clampNumber(scores.greasy, 0, 10, 3),
      numbing: clampNumber(scores.numbing, 0, 10, 0),
    },
    textures: normalizeStringArray(raw.textures, 4),
    aromas: normalizeStringArray(raw.aromas, 4),
    similar: normalizeStringArray(raw.similar, 4),
    warnings: normalizeStringArray(raw.warnings, 3),
    description: String(raw.description || "图片线索有限，味道需要结合实际调味判断。"),
    userComparisons: Array.isArray(raw.userComparisons)
      ? raw.userComparisons.slice(0, 4).map((item) => ({
          food: String(item.food || "熟悉食物"),
          similarity: clampNumber(item.similarity, 0, 100, 60),
          reason: String(item.reason || "风味方向接近"),
        }))
      : [],
    personalTranslation: String(raw.personalTranslation || raw.description || ""),
    modelJson: raw.modelJson || {},
  };

  if (!normalized.textures.length) normalized.textures = ["复合口感"];
  if (!normalized.aromas.length) normalized.aromas = ["熟食香"];
  if (!normalized.similar.length) normalized.similar = [normalized.foodName];
  if (!normalized.warnings.length) normalized.warnings = ["实际味道受调料影响"];

  return normalized;
}

function normalizeStringArray(value, limit) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, limit);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function buildCorsHeaders(origin, allowedOrigin) {
  const allowOrigin =
    origin === allowedOrigin ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1")
      ? origin
      : allowedOrigin;

  return {
    ...JSON_HEADERS,
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}
