"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getSession = getSession;
exports.logout = logout;
exports.updateProfile = updateProfile;
const auth_service_js_1 = require("../services/auth.service.js");
const session_js_1 = require("../lib/session.js");
async function register(req, res, next) {
    try {
        const { email, password, name, rememberMe } = req.body;
        console.log("request for data: ", email, name);
        const user = await (0, auth_service_js_1.registerUser)({ email, password, name });
        await (0, session_js_1.createSessionForUser)(res, user.id, Boolean(rememberMe));
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await (0, auth_service_js_1.loginUser)({ email, password });
        await (0, session_js_1.createSessionForUser)(res, user.id, Boolean(rememberMe));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getSession(req, res, next) {
    try {
        const user = await (0, session_js_1.resolveSessionUser)(req);
        if (!user) {
            res.status(200).json({
                success: true,
                user: null,
            });
            return;
        }
        res.status(200).json({
            success: true,
            user: (0, auth_service_js_1.toUserResponse)(user),
        });
    }
    catch (error) {
        next(error);
    }
}
async function logout(req, res, next) {
    try {
        await (0, session_js_1.revokeSession)(req, res);
        res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
async function updateProfile(req, res, next) {
    try {
        const { userId, ...profileData } = req.body;
        console.log("updateProfile request - userId:", userId, "fields:", Object.keys(profileData));
        const user = await (0, auth_service_js_1.updateUserProfile)({ userId, ...profileData });
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map