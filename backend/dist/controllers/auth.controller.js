"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPassword = setPassword;
exports.updateProfile = updateProfile;
const node_1 = require("better-auth/node");
const auth_service_js_1 = require("../services/auth.service.js");
const auth_js_1 = require("../lib/auth.js");
const profile_js_1 = require("../utils/profile.js");
async function setPassword(req, res, next) {
    try {
        const { newPassword } = req.body;
        if (!newPassword || typeof newPassword !== "string") {
            res.status(400).json({ error: "newPassword is required" });
            return;
        }
        await (0, auth_js_1.getAuth)().api.setPassword({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
            body: { newPassword },
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        // BetterAuth throws APIError with message "user already has a password"
        if (error && typeof error === "object" && "message" in error) {
            const msg = error.message;
            if (msg === "user already has a password") {
                res.status(409).json({ error: "PASSWORD_ALREADY_SET" });
                return;
            }
        }
        next(error);
    }
}
async function updateProfile(req, res, next) {
    try {
        const { session } = req;
        const rawProfileData = req.body;
        const profileData = (0, profile_js_1.sanitizeProfileUpdate)(rawProfileData);
        console.log("updateProfile request - userId:", session.user.id, "fields:", Object.keys(profileData));
        const user = await (0, auth_service_js_1.updateUserProfile)({ userId: session.user.id, ...profileData });
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