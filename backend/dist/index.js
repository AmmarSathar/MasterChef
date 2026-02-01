"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const index_js_1 = require("./config/index.js");
app_js_1.default.listen(index_js_1.config.port, () => {
    console.log(`Server running on http://localhost:${index_js_1.config.port}`);
});
//# sourceMappingURL=index.js.map