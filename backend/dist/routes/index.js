"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = __importDefault(require("./auth.js"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Mount route modules
router.use("/api/auth", auth_js_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map