"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserResponse = toUserResponse;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.updateUserProfile = updateUserProfile;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_js_1 = require("../models/user.model.js");
const profile_model_js_1 = require("../models/profile.model.js");
const SALT_ROUNDS = 10;
function toUserResponse(user) {
    return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        pfp: user.pfp,
        age: user.age,
        birth: user.birth,
        weight: user.weight,
        height: user.height,
        bio: user.bio,
        dietary_restric: user.dietary_restric,
        allergies: user.allergies,
        skill_level: user.skill_level,
        cuisines_pref: user.cuisines_pref,
        isCustomized: user.isCustomized,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
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
    return toUserResponse(user);
}
async function loginUser(input) {
    const { email, password } = input;
    if (!email || !password) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }
    if (!isValidEmail(email)) {
        const error = new Error("Invalid email format");
        error.statusCode = 400;
        throw error;
    }
    const user = await user_model_js_1.User.findOne({ email: email.toLowerCase() });
    if (!user) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }
    const matches = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!matches) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }
    return toUserResponse(user);
}
async function updateUserProfile(input) {
    const { userId, ...profileData } = input;
    if (!userId) {
        const error = new Error("User ID is required");
        error.statusCode = 400;
        throw error;
    }
    const isMongoObjectId = mongoose_1.default.Types.ObjectId.isValid(userId);
    if (isMongoObjectId) {
        const user = await user_model_js_1.User.findByIdAndUpdate(userId, { $set: profileData }, { new: true, runValidators: true });
        if (user) {
            return toUserResponse(user);
        }
    }
    const profile = await profile_model_js_1.Profile.findOneAndUpdate({ authUserId: userId }, { $set: profileData }, { new: true, runValidators: true });
    if (!profile) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return {
        id: profile.authUserId,
        email: profile.email,
        name: profile.name,
        pfp: profile.pfp,
        age: profile.age,
        birth: profile.birth,
        weight: profile.weight,
        height: profile.height,
        bio: profile.bio,
        dietary_restric: profile.dietary_restric,
        allergies: profile.allergies,
        skill_level: profile.skill_level,
        cuisines_pref: profile.cuisines_pref,
        isCustomized: profile.isCustomized,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
    };
}
//# sourceMappingURL=auth.service.js.map