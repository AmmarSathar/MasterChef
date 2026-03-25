"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSession = requireSession;
const node_1 = require("better-auth/node");
const auth_js_1 = require("../lib/auth.js");
async function requireSession(req, res, next) {
    const session = await (0, auth_js_1.getAuth)().api.getSession({
        headers: (0, node_1.fromNodeHeaders)(req.headers),
    });
    if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    req.session = session;
    next();
}
//# sourceMappingURL=auth.middleware.js.map