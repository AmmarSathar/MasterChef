"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const index_js_2 = require("./config/index.js");
const better_auth_js_1 = require("./lib/better-auth.js");
const error_handler_js_1 = require("./middleware/error-handler.js");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: index_js_2.config.frontendUrl,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.get("/api/auth/debug-config", (_req, res) => {
    res.json({
        betterAuthConfigured: Boolean(index_js_2.config.betterAuthSecret &&
            index_js_2.config.betterAuthUrl &&
            index_js_2.config.googleClientId &&
            index_js_2.config.googleClientSecret),
        values: {
            frontendUrl: index_js_2.config.frontendUrl,
            betterAuthUrl: index_js_2.config.betterAuthUrl,
            betterAuthUserModelName: index_js_2.config.betterAuthUserModelName,
            hasBetterAuthSecret: Boolean(index_js_2.config.betterAuthSecret),
            hasGoogleClientId: Boolean(index_js_2.config.googleClientId),
            hasGoogleClientSecret: Boolean(index_js_2.config.googleClientSecret),
            betterAuthSecretLength: index_js_2.config.betterAuthSecret?.length ?? 0,
            googleClientIdPrefix: index_js_2.config.googleClientId?.slice(0, 12) ?? null,
        },
    });
});
// Routes
app.use(index_js_1.default);
app.all("/api/auth", better_auth_js_1.betterAuthMiddleware);
app.all("/api/auth/*", better_auth_js_1.betterAuthMiddleware);
// Error handling (must be last)
app.use(error_handler_js_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map