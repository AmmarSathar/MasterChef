"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = updateUserProfile;
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId } = mongoose_1.default.Types;
async function updateUserProfile(input) {
    const { userId, ...profileData } = input;
    if (!userId) {
        const error = new Error("User ID is required");
        error.statusCode = 400;
        throw error;
    }
    const db = mongoose_1.default.connection.db;
    if (!db) {
        const error = new Error("Database not connected");
        error.statusCode = 500;
        throw error;
    }
    // BetterAuth generates IDs via new ObjectId().toString(), then stores them as
    // actual ObjectId values in MongoDB. We must convert back to ObjectId to query.
    const result = await db.collection("user").findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { ...profileData, updatedAt: new Date() } }, { returnDocument: "after" });
    if (!result) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const { _id, ...user } = result;
    void _id;
    return user;
}
//# sourceMappingURL=auth.service.js.map