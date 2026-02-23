"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSessionCookie = clearSessionCookie;
exports.createSessionForUser = createSessionForUser;
exports.resolveSessionUser = resolveSessionUser;
exports.revokeSession = revokeSession;
const crypto_1 = __importDefault(require("crypto"));
const index_js_1 = require("../config/index.js");
const user_model_js_1 = require("../models/user.model.js");
const session_model_js_1 = require("../models/session.model.js");
const SESSION_COOKIE_NAME = "mc_session";
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;
function parseCookieHeader(cookieHeader) {
    if (!cookieHeader) {
        return {};
    }
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .reduce((acc, part) => {
        const [rawKey, ...rawValue] = part.split("=");
        if (!rawKey) {
            return acc;
        }
        acc[rawKey] = decodeURIComponent(rawValue.join("="));
        return acc;
    }, {});
}
function hashSessionToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
function setSessionCookie(res, token, rememberMe) {
    const maxAge = rememberMe ? THIRTY_DAYS_IN_MS : ONE_DAY_IN_MS;
    res.cookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: index_js_1.config.isProd,
        sameSite: "lax",
        maxAge,
        path: "/",
    });
}
function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: index_js_1.config.isProd,
        sameSite: "lax",
        path: "/",
    });
}
async function createSessionForUser(res, userId, rememberMe) {
    const token = crypto_1.default.randomBytes(48).toString("base64url");
    const tokenHash = hashSessionToken(token);
    const ttl = rememberMe ? THIRTY_DAYS_IN_MS : ONE_DAY_IN_MS;
    await session_model_js_1.UserSession.create({
        tokenHash,
        userId,
        expiresAt: new Date(Date.now() + ttl),
    });
    setSessionCookie(res, token, rememberMe);
}
async function resolveSessionUser(req) {
    const cookies = parseCookieHeader(req.headers.cookie);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
        return null;
    }
    const tokenHash = hashSessionToken(token);
    const session = await session_model_js_1.UserSession.findOne({ tokenHash });
    if (!session) {
        return null;
    }
    if (session.expiresAt.getTime() <= Date.now()) {
        await session_model_js_1.UserSession.deleteOne({ _id: session._id });
        return null;
    }
    const user = await user_model_js_1.User.findById(session.userId);
    if (!user) {
        await session_model_js_1.UserSession.deleteOne({ _id: session._id });
        return null;
    }
    return user;
}
async function revokeSession(req, res) {
    const cookies = parseCookieHeader(req.headers.cookie);
    const token = cookies[SESSION_COOKIE_NAME];
    if (token) {
        const tokenHash = hashSessionToken(token);
        await session_model_js_1.UserSession.deleteOne({ tokenHash });
    }
    clearSessionCookie(res);
}
//# sourceMappingURL=session.js.map