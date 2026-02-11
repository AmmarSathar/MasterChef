"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const index_js_1 = require("./index.js");
async function connectDatabase() {
    try {
        if (!index_js_1.config.mongodbUri) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        await mongoose_1.default.connect(index_js_1.config.mongodbUri);
        console.log("✓ MongoDB connected successfully");
        mongoose_1.default.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
        });
        process.on("SIGINT", async () => {
            await mongoose_1.default.connection.close();
            console.log("MongoDB connection closed due to app termination");
            process.exit(0);
        });
    }
    catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=database.js.map