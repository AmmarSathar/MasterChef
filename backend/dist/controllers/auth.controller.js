"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const auth_service_js_1 = require("../services/auth.service.js");
async function register(req, res, next) {
    try {
        const { email, password, name } = req.body;
        const user = await (0, auth_service_js_1.registerUser)({ email, password, name });
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map