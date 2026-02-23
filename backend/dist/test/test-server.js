"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_js_1 = __importDefault(require("../app.js"));
const port = Number(process.env.PORT || 4000);
async function start() {
    const mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose_1.default.connect(uri);
    const server = app_js_1.default.listen(port, () => {
        console.log(`Test server listening on http://localhost:${port}`);
    });
    const shutdown = async () => {
        server.close();
        await mongoose_1.default.disconnect();
        await mongoServer.stop();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
start().catch((err) => {
    console.error("Failed to start test server:", err);
    process.exit(1);
});
//# sourceMappingURL=test-server.js.map