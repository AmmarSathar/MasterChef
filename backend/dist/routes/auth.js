"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_js_1.register);
router.post("/login", auth_controller_js_1.login);
router.get("/session", auth_controller_js_1.getSession);
router.post("/logout", auth_controller_js_1.logout);
router.put("/profile", auth_controller_js_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map