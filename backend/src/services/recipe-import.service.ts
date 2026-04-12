import { load } from "cheerio";
import { chromium } from "playwright";
import { ProxyAgent } from "undici";
import OpenAI from "openai";
import type { IngredientInput, ApiError } from "../types/index.js";
import { config } from "../config/index.js";

export interface ParsedRecipeResult {
  title?: string;
  description?: string;
  imageUrl?: string;
  ingredients?: IngredientInput[];
  steps?: string[];
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  sourceUrl: string;
  warnings: string[];
}

const MAX_TEXT_LENGTH = 5000;
const MAX_INGREDIENTS = 60;
const MAX_STEPS = 60;
const FETCH_TIMEOUT_MS = 10000;
const PLAYWRIGHT_TIMEOUT_MS = 15000;
const FETCH_RETRIES = 2;
const ENABLE_BROWSER_FALLBACK = process.env.RECIPE_IMPORT_ENABLE_BROWSER !== "false";
const PROXY_URL =
  process.env.RECIPE_IMPORT_PROXY ||
  process.env.HTTPS_PROXY ||
  process.env.HTTP_PROXY ||
  "";
const MAX_AI_TEXT_CHARS = 50000;

const openaiClient = config.openaiApiKey
  ? new OpenAI({ apiKey: config.openaiApiKey })
  : null;

const UNIT_MAP: Record<string, string> = {
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "L",
  litre: "L",
  litres: "L",
  liter: "L",
  liters: "L",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  cup: "cup",
  cups: "cup",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  clove: "cloves",
  cloves: "cloves",
  pc: "pcs",
  pcs: "pcs",
  piece: "pcs",
  pieces: "pcs",
  pinch: "pinch",
};

function isRecipeType(typeValue: unknown): boolean {
  if (Array.isArray(typeValue)) {
    return typeValue.some((t) => String(t).toLowerCase() === "recipe");
  }
  return String(typeValue ?? "").toLowerCase() === "recipe";
}

function collectRecipeCandidates(obj: unknown): Record<string, any>[] {
  if (!obj) return [];
  if (Array.isArray(obj)) {
    return obj.flatMap(collectRecipeCandidates);
  }
  if (typeof obj !== "object") return [];

  const record = obj as Record<string, any>;
  let results: Record<string, any>[] = [];

  if (isRecipeType(record["@type"])) {
    results.push(record);
  }

  if (record["@graph"]) {
    results = results.concat(collectRecipeCandidates(record["@graph"]));
  }

  if (record["mainEntity"]) {
    results = results.concat(collectRecipeCandidates(record["mainEntity"]));
  }

  return results;
}

function scoreCandidate(candidate: Record<string, any>): number {
  let score = 0;
  if (candidate.name) score += 2;
  if (candidate.description) score += 1;
  if (candidate.recipeIngredient) score += 2;
  if (candidate.recipeInstructions) score += 2;
  if (candidate.image) score += 1;
  if (candidate.recipeYield) score += 1;
  return score;
}

function safeText(input?: string): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  return trimmed.length > MAX_TEXT_LENGTH
    ? trimmed.slice(0, MAX_TEXT_LENGTH)
    : trimmed;
}

function normalizeImage(input: any): string | undefined {
  if (!input) return undefined;
  if (typeof input === "string") return input.trim();
  if (Array.isArray(input)) {
    const first = input.find((item) => typeof item === "string");
    return first ? first.trim() : undefined;
  }
  if (typeof input === "object" && typeof input.url === "string") {
    return input.url.trim();
  }
  return undefined;
}

function parseIsoDurationToMinutes(value?: string): number | undefined {
  if (!value || typeof value !== "string") return undefined;
  const match = value.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i
  );
  if (!match) return undefined;
  const days = Number(match[1] || 0);
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  const seconds = Number(match[4] || 0);
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes + seconds / 60;
  return Number.isFinite(totalMinutes) ? Math.round(totalMinutes) : undefined;
}

function parseServings(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (Array.isArray(value)) {
    return parseServings(value[0]);
  }
  const text = String(value).trim();
  if (!text) return undefined;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  return Math.round(Number(match[1]));
}

function coerceToStringArray(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === "string" ? item : String(item)))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [String(input)].map((item) => item.trim()).filter(Boolean);
}

function parseFraction(value: string): number | undefined {
  const [num, den] = value.split("/").map((v) => Number(v));
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return undefined;
  return num / den;
}

function parseAmount(value: string): number | undefined {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return undefined;
  if (cleaned.includes("/")) {
    const parts = cleaned.split(" ");
    if (parts.length === 2) {
      const whole = Number(parts[0]);
      const frac = parseFraction(parts[1]);
      if (Number.isFinite(whole) && frac != null) return whole + frac;
    }
    const frac = parseFraction(cleaned);
    if (frac != null) return frac;
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : undefined;
}

function parseIngredientLine(line: string): IngredientInput {
  const trimmed = line.trim();
  if (!trimmed) {
    return { foodItem: "", amount: 1, unit: "unit" };
  }

  const amountMatch = trimmed.match(/^([\d\s\/.,-]+)/);
  let amount: number | undefined;
  let rest = trimmed;

  if (amountMatch) {
    const candidate = amountMatch[1].replace(/-.*$/, "").trim();
    const parsed = parseAmount(candidate);
    if (parsed != null) {
      amount = parsed;
      rest = trimmed.slice(amountMatch[0].length).trim();
    }
  }

  const words = rest.split(/\s+/);
  const unitRaw = words[0]?.toLowerCase().replace(/[.,]$/g, "");
  const unit = unitRaw && UNIT_MAP[unitRaw] ? UNIT_MAP[unitRaw] : undefined;

  const foodItem = unit ? words.slice(1).join(" ") : rest;

  return {
    foodItem: foodItem.trim() || trimmed,
    amount: amount && amount > 0 ? amount : 1,
    unit: unit ?? "unit",
  };
}

function normalizeIngredients(input: unknown): IngredientInput[] {
  const lines = coerceToStringArray(input)
    .slice(0, MAX_INGREDIENTS)
    .filter(Boolean);
  return lines.map(parseIngredientLine).filter((ing) => ing.foodItem.length > 0);
}

function normalizeInstructions(input: unknown): string[] {
  if (!input) return [];
  if (typeof input === "string") {
    return input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, MAX_STEPS);
  }
  if (Array.isArray(input)) {
    return input
      .flatMap((item) => normalizeInstructions(item))
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, MAX_STEPS);
  }
  if (typeof input === "object") {
    const record = input as Record<string, any>;
    if (record.text) return normalizeInstructions(record.text);
    if (record.itemListElement)
      return normalizeInstructions(record.itemListElement);
  }
  return [];
}

function extractReadableText(html: string): string {
  const $ = load(html);
  $("script, style, noscript").remove();
  const text = $("body").text();
  return text.replace(/\s+/g, " ").trim();
}

function clampText(text: string, limit: number) {
  if (text.length <= limit) return text;
  return text.slice(0, limit);
}

async function extractWithAi(url: string, html: string) {
  if (!openaiClient || !config.openaiUseAi) return null;

  const readable = clampText(extractReadableText(html), MAX_AI_TEXT_CHARS);

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: ["string", "null"] },
      description: { type: ["string", "null"] },
      imageUrl: { type: ["string", "null"] },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            foodItem: { type: "string" },
            amount: { type: "number" },
            unit: { type: "string" },
            notes: { type: ["string", "null"] },
          },
          required: ["foodItem", "amount", "unit", "notes"],
        },
      },
      steps: {
        type: "array",
        items: { type: "string" },
      },
      servings: { type: ["number", "null"] },
      prepTime: { type: ["number", "null"] },
      cookTime: { type: ["number", "null"] },
      skillLevel: { type: ["string", "null"] },
      dietaryTags: { type: "array", items: { type: "string" } },
    },
    required: [
      "title",
      "description",
      "imageUrl",
      "ingredients",
      "steps",
      "servings",
      "prepTime",
      "cookTime",
      "skillLevel",
      "dietaryTags",
    ],
  };

  const response = await openaiClient.responses.create({
    model: config.openaiModel,
    input: [
      {
        role: "system",
        content:
          "You extract recipe data from web page text. Return only the requested JSON fields. " +
          "If a field is not present, use null (or an empty array for ingredients/steps/dietaryTags). " +
          "Ingredients must be normalized: foodItem name only, numeric amount, and unit (use 'unit' if unclear).",
      },
      {
        role: "user",
        content: `URL: ${url}\nPage text:\n${readable}`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "recipe_extract",
        schema,
        strict: true,
      },
    },
  });

  const text = response.output_text;
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildFetchDispatcher() {
  if (!PROXY_URL) return undefined;
  try {
    return new ProxyAgent(PROXY_URL);
  } catch {
    return undefined;
  }
}

async function fetchHtmlViaHttp(url: string): Promise<string> {
  const dispatcher = buildFetchDispatcher();

  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        dispatcher,
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          accept: "text/html,application/xhtml+xml",
        },
      });

      if (!res.ok) {
        if (attempt === FETCH_RETRIES) {
          const error: ApiError = new Error("Failed to fetch recipe URL");
          error.statusCode = 502;
          throw error;
        }
        continue;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html")) {
        const error: ApiError = new Error("URL did not return HTML content");
        error.statusCode = 400;
        throw error;
      }

      return await res.text();
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        if (attempt === FETCH_RETRIES) {
          const error: ApiError = new Error(
            "Request timed out while fetching recipe URL"
          );
          error.statusCode = 504;
          throw error;
        }
      } else if (attempt === FETCH_RETRIES) {
        const error: ApiError = new Error(
          "Failed to fetch recipe URL. The site may be unreachable or block automated requests."
        );
        error.statusCode = 502;
        throw error;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  const error: ApiError = new Error("Failed to fetch recipe URL");
  error.statusCode = 502;
  throw error;
}

async function fetchHtmlViaBrowser(url: string): Promise<string> {
  const browser = await chromium.launch({
    headless: true,
    proxy: PROXY_URL ? { server: PROXY_URL } : undefined,
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(PLAYWRIGHT_TIMEOUT_MS);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    try {
      await page.waitForLoadState("networkidle", { timeout: 5000 });
    } catch {
      // ignore if network never goes idle
    }
    return await page.content();
  } finally {
    await browser.close();
  }
}

function extractFromJsonLd(html: string) {
  const $ = load(html);
  const candidates: Record<string, any>[] = [];

  $("script[type=\"application/ld+json\"]").each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      candidates.push(...collectRecipeCandidates(parsed));
    } catch {
      return;
    }
  });

  if (!candidates.length) return null;

  const best = candidates.sort((a, b) => scoreCandidate(b) - scoreCandidate(a))[0];

  const title = safeText(best.name || best.headline);
  const description = safeText(best.description);
  const imageUrl = normalizeImage(best.image);
  const ingredients = normalizeIngredients(best.recipeIngredient || best.ingredients);
  const steps = normalizeInstructions(best.recipeInstructions);
  const servings = parseServings(best.recipeYield);
  const prepTime = parseIsoDurationToMinutes(best.prepTime);
  const cookTime = parseIsoDurationToMinutes(best.cookTime);
  const totalTime = parseIsoDurationToMinutes(best.totalTime);

  return {
    title,
    description,
    imageUrl,
    ingredients,
    steps,
    servings,
    prepTime,
    cookTime,
    totalTime,
  };
}

function extractFromHtml(html: string) {
  const $ = load(html);
  const title =
    safeText($("meta[property='og:title']").attr("content")) ||
    safeText($("title").text());
  const description =
    safeText($("meta[property='og:description']").attr("content")) ||
    safeText($("meta[name='description']").attr("content"));
  const imageUrl =
    safeText($("meta[property='og:image']").attr("content")) ||
    safeText($("meta[name='twitter:image']").attr("content"));

  let ingredientTexts = $("[itemprop='recipeIngredient']")
    .map((_, el) => $(el).text())
    .get();

  if (!ingredientTexts.length) {
    ingredientTexts = $("[class*='ingredient'] li")
      .map((_, el) => $(el).text())
      .get();
  }

  let instructionTexts: string[] = [];
  const instructionNodes = $("[itemprop='recipeInstructions']");
  if (instructionNodes.length) {
    instructionNodes.each((_, el) => {
      const listItems = $(el).find("li");
      if (listItems.length) {
        instructionTexts.push(...listItems.map((_, li) => $(li).text()).get());
      } else {
        instructionTexts.push($(el).text());
      }
    });
  }

  if (!instructionTexts.length) {
    instructionTexts = $("[class*='instruction'] li, [class*='direction'] li")
      .map((_, el) => $(el).text())
      .get();
  }

  const ingredients = normalizeIngredients(ingredientTexts);
  const steps = normalizeInstructions(instructionTexts);

  return {
    title,
    description,
    imageUrl,
    ingredients,
    steps,
  };
}

function buildWarnings(result: ParsedRecipeResult): string[] {
  const warnings: string[] = [];
  if (!result.title) warnings.push("Missing title");
  if (!result.description) warnings.push("Missing description");
  if (!result.ingredients?.length) warnings.push("Missing ingredients");
  if (!result.steps?.length) warnings.push("Missing instructions");
  if (!result.imageUrl) warnings.push("Missing image");
  return warnings;
}

function normalizeTimes(
  prepTime?: number,
  cookTime?: number,
  totalTime?: number
): { prepTime?: number; cookTime?: number; totalTime?: number } {
  let resolvedPrep = prepTime;
  let resolvedCook = cookTime;
  let resolvedTotal = totalTime;

  if (resolvedTotal != null && resolvedCook == null) {
    if (resolvedPrep != null && resolvedTotal > resolvedPrep) {
      resolvedCook = resolvedTotal - resolvedPrep;
    } else {
      resolvedCook = resolvedTotal;
    }
  }

  if (resolvedCook != null && resolvedTotal == null) {
    resolvedTotal = (resolvedPrep ?? 0) + resolvedCook;
  }

  return { prepTime: resolvedPrep, cookTime: resolvedCook, totalTime: resolvedTotal };
}

export async function parseRecipeFromUrl(url: string): Promise<ParsedRecipeResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    const error: ApiError = new Error("Invalid URL");
    error.statusCode = 400;
    throw error;
  }

  if (!/^https?:$/.test(parsedUrl.protocol)) {
    const error: ApiError = new Error("Only http/https URLs are supported");
    error.statusCode = 400;
    throw error;
  }

  let html = "";
  try {
    html = await fetchHtmlViaHttp(parsedUrl.toString());
  } catch (err) {
    if (!ENABLE_BROWSER_FALLBACK) throw err;
    try {
      html = await fetchHtmlViaBrowser(parsedUrl.toString());
    } catch {
      throw err;
    }
  }

  let jsonLdResult = extractFromJsonLd(html);
  let htmlResult = extractFromHtml(html);

  const missingCoreData =
    !(jsonLdResult?.ingredients?.length || htmlResult?.ingredients?.length) ||
    !(jsonLdResult?.steps?.length || htmlResult?.steps?.length);

  if (ENABLE_BROWSER_FALLBACK && missingCoreData) {
    try {
      html = await fetchHtmlViaBrowser(parsedUrl.toString());
      jsonLdResult = extractFromJsonLd(html);
      htmlResult = extractFromHtml(html);
    } catch {
      // ignore browser fallback errors; we'll return whatever we have
    }
  }

  let aiResult: any = null;
  try {
    aiResult = await extractWithAi(parsedUrl.toString(), html);
  } catch {
    aiResult = null;
  }

  const base = {
    ...htmlResult,
    ...jsonLdResult,
  } as {
    title?: string;
    description?: string;
    imageUrl?: string;
    ingredients?: IngredientInput[];
    steps?: string[];
    servings?: number;
    prepTime?: number;
    cookTime?: number;
    totalTime?: number;
    skillLevel?: string;
    dietaryTags?: string[];
  };

  if (aiResult) {
    if (aiResult.title) base.title = aiResult.title;
    if (aiResult.description) base.description = aiResult.description;
    if (aiResult.imageUrl) base.imageUrl = aiResult.imageUrl;
    if (aiResult.servings != null) base.servings = aiResult.servings;
    if (aiResult.prepTime != null) base.prepTime = aiResult.prepTime;
    if (aiResult.cookTime != null) base.cookTime = aiResult.cookTime;
    if (aiResult.totalTime != null) base.totalTime = aiResult.totalTime;
  }

  const mergedIngredients =
    aiResult?.ingredients?.length
      ? aiResult.ingredients
      : jsonLdResult?.ingredients?.length
      ? jsonLdResult.ingredients
      : htmlResult?.ingredients;

  const mergedSteps =
    aiResult?.steps?.length
      ? aiResult.steps
      : jsonLdResult?.steps?.length
      ? jsonLdResult.steps
      : htmlResult?.steps;

  base.ingredients = (mergedIngredients ?? []).map((ing: IngredientInput) => ({
    foodItem: ing.foodItem?.trim() || "",
    amount: Number.isFinite(ing.amount) && ing.amount > 0 ? ing.amount : 1,
    unit: ing.unit?.trim() || "unit",
    notes: ing.notes,
  }));

  base.steps = (mergedSteps ?? [])
    .map((step: string) => step.trim())
    .filter(Boolean);

  const times = normalizeTimes(base.prepTime, base.cookTime, base.totalTime);

  const result: ParsedRecipeResult = {
    title: base.title,
    description: base.description,
    imageUrl: base.imageUrl,
    ingredients: base.ingredients,
    steps: base.steps,
    servings: base.servings,
    prepTime: times.prepTime,
    cookTime: times.cookTime,
    totalTime: times.totalTime,
    sourceUrl: parsedUrl.toString(),
    warnings: [],
  };

  result.warnings = buildWarnings(result);

  return result;
}
