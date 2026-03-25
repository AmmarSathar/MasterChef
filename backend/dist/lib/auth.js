"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuth = getAuth;
const better_auth_1 = require("better-auth");
const mongodb_1 = require("better-auth/adapters/mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const index_js_1 = require("../config/index.js");
// Lazy singleton — initialized on first request, after mongoose has connected
let _auth;
function getAuth() {
    if (!_auth) {
        const db = mongoose_1.default.connection.db;
        if (!db) {
            throw new Error("MongoDB not connected. Ensure connectDatabase() has been called before handling requests.");
        }
        _auth = (0, better_auth_1.betterAuth)({
            database: (0, mongodb_1.mongodbAdapter)(db),
            secret: index_js_1.config.betterAuthSecret,
            baseURL: index_js_1.config.betterAuthUrl,
            trustedOrigins: [index_js_1.config.frontendUrl],
            emailAndPassword: {
                enabled: true,
            },
            socialProviders: {
                google: {
                    clientId: index_js_1.config.googleClientId,
                    clientSecret: index_js_1.config.googleClientSecret,
                },
                github: {
                    clientId: index_js_1.config.githubClientId,
                    clientSecret: index_js_1.config.githubClientSecret,
                    // Request user:email so we can read private GitHub emails too
                    scope: ["user:email"],
                },
            },
            // Allow Google/GitHub to auto-link to existing email accounts
            account: {
                accountLinking: {
                    enabled: true,
                    trustedProviders: ["google", "github"],
                },
            },
            user: {
                additionalFields: {
                    pfp: { type: "string", nullable: true, input: true },
                    age: { type: "number", nullable: true, input: true },
                    birth: { type: "string", nullable: true, input: true },
                    weight: { type: "number", nullable: true, input: true },
                    height: { type: "number", nullable: true, input: true },
                    bio: { type: "string", nullable: true, input: true },
                    dietary_restric: { type: "string[]", nullable: true, input: true },
                    allergies: { type: "string[]", nullable: true, input: true },
                    skill_level: { type: "string", nullable: true, input: true },
                    cuisines_pref: { type: "string[]", nullable: true, input: true },
                    isCustomized: { type: "boolean", defaultValue: false, input: true },
                },
            },
            // Ensure isCustomized is always explicitly set to false for new users
            // (BetterAuth may not apply additionalField defaults during OAuth user creation)
            databaseHooks: {
                user: {
                    create: {
                        before: async (user) => {
                            return {
                                data: {
                                    ...user,
                                    isCustomized: user.isCustomized ?? false,
                                },
                            };
                        },
                    },
                },
            },
        });
    }
    return _auth;
}
//# sourceMappingURL=auth.js.map