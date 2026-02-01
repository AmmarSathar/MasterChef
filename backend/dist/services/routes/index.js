"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Health check endpoint
router.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Mount route modules here
// router.use("/auth", authRoutes);
exports.default = router;
//# sourceMappingURL=index.js.map