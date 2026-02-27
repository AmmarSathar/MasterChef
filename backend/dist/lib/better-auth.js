"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betterAuthMiddleware = void 0;
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../config/database.js");
const profile_model_js_1 = require("../models/profile.model.js");
const user_model_js_1 = require("../models/user.model.js");
let cachedHandler = null;
let initPromise = null;
let initError = null;
function hasBetterAuthConfig() {
    return Boolean(index_js_1.config.betterAuthSecret &&
        index_js_1.config.betterAuthUrl &&
        index_js_1.config.googleClientId &&
        index_js_1.config.googleClientSecret);
}
async function ensureProfileForAuthUser(user) {
    if (!user.id) {
        return;
    }
    const email = user.email?.toLowerCase();
    if (!email) {
        return;
    }
    const legacyUser = email ? await user_model_js_1.User.findOne({ email }) : null;
    await profile_model_js_1.Profile.findOneAndUpdate({ authUserId: user.id }, {
        $setOnInsert: {
            authUserId: user.id,
            email,
            name: legacyUser?.name ?? user.name ?? "User",
            pfp: legacyUser?.pfp ?? user.image,
            age: legacyUser?.age,
            birth: legacyUser?.birth,
            weight: legacyUser?.weight,
            height: legacyUser?.height,
            bio: legacyUser?.bio,
            dietary_restric: legacyUser?.dietary_restric ?? [],
            allergies: legacyUser?.allergies ?? [],
            skill_level: legacyUser?.skill_level,
            cuisines_pref: legacyUser?.cuisines_pref ?? [],
            isCustomized: legacyUser?.isCustomized ?? false,
            legacyUserId: legacyUser?._id,
        },
    }, { upsert: true, new: false });
}
async function initializeHandler() {
    if (!hasBetterAuthConfig()) {
        return null;
    }
    try {
        const [{ betterAuth }, { mongodbAdapter }, { toNodeHandler }] = await Promise.all([
            import("better-auth"),
            import("better-auth/adapters/mongodb"),
            import("better-auth/node"),
        ]);
        const auth = betterAuth({
            database: mongodbAdapter((0, database_js_1.getMongoDb)(), {
                client: (0, database_js_1.getMongoClient)(),
                // Local Mongo instances are often standalone (no replica set), so txs fail.
                transaction: false,
            }),
            secret: index_js_1.config.betterAuthSecret,
            baseURL: index_js_1.config.betterAuthUrl,
            trustedOrigins: [index_js_1.config.frontendUrl],
            socialProviders: {
                google: {
                    clientId: index_js_1.config.googleClientId,
                    clientSecret: index_js_1.config.googleClientSecret,
                    prompt: "select_account",
                },
            },
            account: {
                accountLinking: {
                    enabled: true,
                    trustedProviders: ["google"],
                },
            },
            user: {
                modelName: index_js_1.config.betterAuthUserModelName,
            },
            databaseHooks: {
                user: {
                    create: {
                        after: async (createdUser) => {
                            await ensureProfileForAuthUser(createdUser);
                        },
                    },
                },
            },
        });
        return toNodeHandler(auth);
    }
    catch (error) {
        initError = error instanceof Error ? error : new Error("Better Auth initialization failed");
        throw initError;
    }
}
async function getBetterAuthHandler() {
    if (cachedHandler) {
        return cachedHandler;
    }
    if (!initPromise) {
        initPromise = initializeHandler().then((handler) => {
            cachedHandler = handler;
            return handler;
        });
    }
    return initPromise;
}
const betterAuthMiddleware = async (req, res, next) => {
    try {
        const handler = await getBetterAuthHandler();
        if (!handler) {
            res.status(503).json({
                error: "Better Auth is not configured",
                requiredEnv: [
                    "BETTER_AUTH_SECRET",
                    "BETTER_AUTH_URL",
                    "GOOGLE_CLIENT_ID",
                    "GOOGLE_CLIENT_SECRET",
                ],
            });
            return;
        }
        handler(req, res, next);
    }
    catch (error) {
        next(initError ?? error);
    }
};
exports.betterAuthMiddleware = betterAuthMiddleware;
//# sourceMappingURL=better-auth.js.map