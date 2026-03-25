"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// All /api/auth/sign-in, /api/auth/sign-up, /api/auth/session, etc.
// are handled by BetterAuth in app.ts (mounted before this router)
// Profile update — requires an active session
router.put("/profile", auth_middleware_js_1.requireSession, auth_controller_js_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map