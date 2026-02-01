"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const error_handler_js_1 = require("./middleware/error-handler.js");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use(index_js_1.default);
// Error handling (must be last)
app.use(error_handler_js_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map