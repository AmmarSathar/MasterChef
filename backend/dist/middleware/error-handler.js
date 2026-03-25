"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const index_js_1 = require("../config/index.js");
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", statusCode, message, err.stack);
    res.status(statusCode).json({
        error: message,
        message: message,
        ...(index_js_1.config.isDev && { stack: err.stack }),
    });
}
//# sourceMappingURL=error-handler.js.map