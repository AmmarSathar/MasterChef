"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || "4000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    isDev: process.env.NODE_ENV !== "production",
    isProd: process.env.NODE_ENV === "production",
    mongodbUri: process.env.MONGODB_URI,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:4000/api/auth",
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    betterAuthUserModelName: process.env.BETTER_AUTH_USER_MODEL_NAME || "googleusers",
};
//# sourceMappingURL=index.js.map