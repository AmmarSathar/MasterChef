import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { getAuth } from "./lib/auth.js";
import routes from "./routes/index.js";
import { config } from "./config/index.js";
import { betterAuthMiddleware } from "./lib/better-auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { config } from "./config/index.js";

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true, // required for cookie-based sessions
  })
);

// BetterAuth handler must be mounted BEFORE express.json()
// It handles all /api/auth/* routes (sign-in, sign-up, OAuth callbacks, session, sign-out)
app.all("/api/auth/*", (req, res) => {
  return toNodeHandler(getAuth())(req, res);
});

app.use(express.json({ limit: "10mb" }));

// Remaining app routes
app.use(routes);
app.all("/api/auth", betterAuthMiddleware);
app.all("/api/auth/*", betterAuthMiddleware);

// Error handling (must be last)
app.use(errorHandler);

export default app;
