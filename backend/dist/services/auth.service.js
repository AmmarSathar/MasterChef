"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_js_1 = require("../models/user.model.js");
const SALT_ROUNDS = 10;
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
async function registerUser(input) {
    const { email, password, name } = input;
    // Validation
    if (!email || !password || !name) {
        const error = new Error("Email, password, and name are required");
        error.statusCode = 400;
        throw error;
    }
    if (!isValidEmail(email)) {
        const error = new Error("Invalid email format");
        error.statusCode = 400;
        throw error;
    }
    if (password.length < 8) {
        const error = new Error("Password must be at least 8 characters");
        error.statusCode = 400;
        throw error;
    }
    // Check for duplicate email
    const existingUser = await user_model_js_1.User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }
    // Hash password
    const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
    // Create user in database
    const user = await user_model_js_1.User.create({
        email,
        name,
        passwordHash,
    });
    return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
    };
}
//# sourceMappingURL=auth.service.js.map