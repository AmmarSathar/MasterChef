"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const index_js_1 = require("./config/index.js");
const database_js_1 = require("./config/database.js");
async function startServer() {
    try {
        // Connect to MongoDB first
        await (0, database_js_1.connectDatabase)();
        // Start Express server
        app_js_1.default.listen(index_js_1.config.port, () => {
            console.log(`✓ Server running on http://localhost:${index_js_1.config.port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map