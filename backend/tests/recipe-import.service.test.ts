import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockOpenAiCreate,
  mockChromiumLaunch,
  mockPageGoto,
  mockPageWaitForLoadState,
  mockPageContent,
} = vi.hoisted(() => {
  const mockOpenAiCreate = vi.fn();
  const mockPageGoto = vi.fn();
  const mockPageWaitForLoadState = vi.fn();
  const mockPageContent = vi.fn();

  const mockChromiumLaunch = vi.fn(async () => ({
    newContext: vi.fn(async () => ({
      newPage: vi.fn(async () => ({
        goto: mockPageGoto,
        waitForLoadState: mockPageWaitForLoadState,
        content: mockPageContent,
        setDefaultTimeout: vi.fn(),
      })),
    })),
    close: vi.fn(),
  }));

  return {
    mockOpenAiCreate,
    mockChromiumLaunch,
    mockPageGoto,
    mockPageWaitForLoadState,
    mockPageContent,
  };
});

vi.mock("openai", () => {
  class MockOpenAI {
    responses = { create: mockOpenAiCreate };
    constructor(_: unknown) {}
  }

  return { default: MockOpenAI };
});

vi.mock("playwright", () => ({
  chromium: {
    launch: mockChromiumLaunch,
  },
}));

function makeHtmlResponse(html: string, contentType = "text/html") {
  return {
    ok: true,
    text: async () => html,
    headers: {
      get: (key: string) =>
        key.toLowerCase() === "content-type" ? contentType : null,
    },
  } as Response;
}

async function loadParser(env: Record<string, string | undefined> = {}) {
  vi.resetModules();

  process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  process.env.RECIPE_IMPORT_USE_AI = env.RECIPE_IMPORT_USE_AI;
  process.env.RECIPE_IMPORT_ENABLE_BROWSER = env.RECIPE_IMPORT_ENABLE_BROWSER;
  process.env.OPENAI_RECIPE_MODEL = env.OPENAI_RECIPE_MODEL;
  process.env.RECIPE_IMPORT_PROXY = env.RECIPE_IMPORT_PROXY;
  process.env.HTTPS_PROXY = env.HTTPS_PROXY;
  process.env.HTTP_PROXY = env.HTTP_PROXY;

  const mod = await import("../src/services/recipe-import.service.js");
  return mod.parseRecipeFromUrl;
}

describe("parseRecipeFromUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
    delete process.env.RECIPE_IMPORT_USE_AI;
    delete process.env.RECIPE_IMPORT_ENABLE_BROWSER;
    delete process.env.OPENAI_RECIPE_MODEL;
    delete process.env.RECIPE_IMPORT_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY;
  });

  it("throws 400 for invalid URLs", async () => {
    const parseRecipeFromUrl = await loadParser();
    await expect(parseRecipeFromUrl("not-a-url")).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid URL",
    });
  });

  it("throws 400 for non-http protocols", async () => {
    const parseRecipeFromUrl = await loadParser();
    await expect(parseRecipeFromUrl("ftp://example.com/recipe")).rejects.toMatchObject({
      statusCode: 400,
      message: "Only http/https URLs are supported",
    });
  });

  it("parses recipe data from JSON-LD and computes warnings", async () => {
    const html = `
      <html><body>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Tomato Pasta",
            "description": "Simple pasta recipe",
            "recipeIngredient": ["1 cup tomatoes", "200 g pasta"],
            "recipeInstructions": [{"@type":"HowToStep","text":"Boil pasta"}],
            "recipeYield": "2 servings",
            "prepTime": "PT10M",
            "cookTime": "PT15M"
          }
        </script>
      </body></html>
    `;
    vi.stubGlobal("fetch", vi.fn(async () => makeHtmlResponse(html)));

    const parseRecipeFromUrl = await loadParser({ OPENAI_API_KEY: undefined });
    const result = await parseRecipeFromUrl("https://example.com/recipe");

    expect(result.title).toBe("Tomato Pasta");
    expect(result.description).toBe("Simple pasta recipe");
    expect(result.ingredients).toEqual([
      { foodItem: "tomatoes", amount: 1, unit: "cup", notes: undefined },
      { foodItem: "pasta", amount: 200, unit: "g", notes: undefined },
    ]);
    expect(result.steps).toEqual(["Boil pasta"]);
    expect(result.servings).toBe(2);
    expect(result.prepTime).toBe(10);
    expect(result.cookTime).toBe(15);
    expect(result.totalTime).toBe(25);
    expect(result.sourceUrl).toBe("https://example.com/recipe");
    expect(result.warnings).toContain("Missing image");
  });

  it("falls back to browser fetch when HTTP fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    mockPageContent.mockResolvedValue(`
      <html><body>
        <script type="application/ld+json">
          {
            "@type": "Recipe",
            "name": "Browser Recipe",
            "recipeIngredient": ["1 tsp salt"],
            "recipeInstructions": [{"text":"Mix"}]
          }
        </script>
      </body></html>
    `);

    const parseRecipeFromUrl = await loadParser({
      RECIPE_IMPORT_ENABLE_BROWSER: "true",
    });
    const result = await parseRecipeFromUrl("https://example.com/browser");

    expect(mockChromiumLaunch).toHaveBeenCalledTimes(1);
    expect(result.title).toBe("Browser Recipe");
    expect(result.steps).toEqual(["Mix"]);
  });

  it("uses browser re-fetch when initial HTML lacks ingredients/steps", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeHtmlResponse("<html><body><h1>No recipe content</h1></body></html>"));
    vi.stubGlobal("fetch", fetchMock);

    mockPageContent.mockResolvedValue(`
      <html><body>
        <script type="application/ld+json">
          {
            "@type": "Recipe",
            "name": "Fallback Recipe",
            "recipeIngredient": ["2 eggs"],
            "recipeInstructions": [{"text":"Cook"}]
          }
        </script>
      </body></html>
    `);

    const parseRecipeFromUrl = await loadParser({
      RECIPE_IMPORT_ENABLE_BROWSER: "true",
    });
    const result = await parseRecipeFromUrl("https://example.com/fallback");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockChromiumLaunch).toHaveBeenCalledTimes(1);
    expect(result.title).toBe("Fallback Recipe");
    expect(result.ingredients?.[0].foodItem).toBe("eggs");
  });

  it("applies AI output as final override when AI is enabled", async () => {
    const html = `
      <html><body>
        <script type="application/ld+json">
          {
            "@type": "Recipe",
            "name": "Base Recipe",
            "description": "Base description",
            "recipeIngredient": ["1 cup flour"],
            "recipeInstructions": [{"text":"Stir"}],
            "recipeYield": "2"
          }
        </script>
      </body></html>
    `;
    vi.stubGlobal("fetch", vi.fn(async () => makeHtmlResponse(html)));

    mockOpenAiCreate.mockResolvedValue({
      output_text: JSON.stringify({
        title: "AI Recipe",
        description: "AI description",
        imageUrl: "https://img.example/ai.jpg",
        ingredients: [
          { foodItem: "almond flour", amount: 1.5, unit: "cup", notes: null },
        ],
        steps: ["Whisk", "Bake"],
        servings: 4,
        prepTime: 12,
        cookTime: 25,
        skillLevel: null,
        dietaryTags: [],
      }),
    });

    const parseRecipeFromUrl = await loadParser({
      OPENAI_API_KEY: "test-key",
      RECIPE_IMPORT_USE_AI: "true",
    });
    const result = await parseRecipeFromUrl("https://example.com/ai");

    expect(mockOpenAiCreate).toHaveBeenCalledTimes(1);
    expect(result.title).toBe("AI Recipe");
    expect(result.description).toBe("AI description");
    expect(result.imageUrl).toBe("https://img.example/ai.jpg");
    expect(result.ingredients).toEqual([
      { foodItem: "almond flour", amount: 1.5, unit: "cup", notes: null },
    ]);
    expect(result.steps).toEqual(["Whisk", "Bake"]);
    expect(result.servings).toBe(4);
    expect(result.prepTime).toBe(12);
    expect(result.cookTime).toBe(25);
    expect(result.totalTime).toBe(37);
  });
});
