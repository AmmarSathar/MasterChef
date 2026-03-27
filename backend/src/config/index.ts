import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
  mongodbUri: process.env.MONGODB_URI,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  githubClientId: process.env.GH_CLIENT_ID || "",
  githubClientSecret: process.env.GH_CLIENT_SECRET || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_RECIPE_MODEL || "gpt-4o-mini",
  openaiUseAi: process.env.RECIPE_IMPORT_USE_AI !== "false",
} as const;
