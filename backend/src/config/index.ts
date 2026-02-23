import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
  mongodbUri: process.env.MONGODB_URI,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:4000/api/auth",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  betterAuthUserModelName: process.env.BETTER_AUTH_USER_MODEL_NAME || "googleusers",
} as const;
