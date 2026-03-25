"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_1 = require("better-auth/node");
const auth_js_1 = require("./lib/auth.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const error_handler_js_1 = require("./middleware/error-handler.js");
const index_js_2 = require("./config/index.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: index_js_2.config.frontendUrl,
    credentials: true, // required for cookie-based sessions
}));
// BetterAuth handler must be mounted BEFORE express.json()
// It handles all /api/auth/* routes (sign-in, sign-up, OAuth callbacks, session, sign-out)
app.all("/api/auth/*", (req, res) => {
    return (0, node_1.toNodeHandler)((0, auth_js_1.getAuth)())(req, res);
});
app.use(express_1.default.json({ limit: "10mb" }));
// Remaining app routes
app.use(index_js_1.default);
// Error handling (must be last)
app.use(error_handler_js_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map