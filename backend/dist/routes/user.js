"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// PUT /api/user/profile — session-protected profile update
// Kept outside /api/auth/* to avoid being intercepted by BetterAuth's handler
router.put("/profile", auth_middleware_js_1.requireSession, auth_controller_js_1.updateProfile);
// POST /api/user/set-password — add email/password login to an OAuth-only account
// Requires active session; delegates to BetterAuth's internal setPassword API
router.post("/set-password", auth_middleware_js_1.requireSession, auth_controller_js_1.setPassword);
exports.default = router;
//# sourceMappingURL=user.js.map