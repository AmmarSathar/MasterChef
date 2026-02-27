import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { config } from "./config/index.js";
import { betterAuthMiddleware } from "./lib/better-auth.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/auth/debug-config", (_req, res) => {
  res.json({
    betterAuthConfigured: Boolean(
      config.betterAuthSecret &&
        config.betterAuthUrl &&
        config.googleClientId &&
        config.googleClientSecret
    ),
    values: {
      frontendUrl: config.frontendUrl,
      betterAuthUrl: config.betterAuthUrl,
      betterAuthUserModelName: config.betterAuthUserModelName,
      hasBetterAuthSecret: Boolean(config.betterAuthSecret),
      hasGoogleClientId: Boolean(config.googleClientId),
      hasGoogleClientSecret: Boolean(config.googleClientSecret),
      betterAuthSecretLength: config.betterAuthSecret?.length ?? 0,
      googleClientIdPrefix: config.googleClientId?.slice(0, 12) ?? null,
    },
  });
});

// Routes
app.use(routes);
app.all("/api/auth", betterAuthMiddleware);
app.all("/api/auth/*", betterAuthMiddleware);

// Error handling (must be last)
app.use(errorHandler);

export default app;
