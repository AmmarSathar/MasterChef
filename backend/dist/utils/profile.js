"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDietaryRestrictions = normalizeDietaryRestrictions;
exports.sanitizeAllergies = sanitizeAllergies;
exports.sanitizeProfileUpdate = sanitizeProfileUpdate;
const constants_1 = require("@masterchef/shared/constants");
const dietaryLookup = new Map(constants_1.dietaryOptions.map((option) => [option.toLowerCase(), option]));
function makeError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function toList(input, label) {
    if (input == null)
        return [];
    if (Array.isArray(input)) {
        return input.map((v) => String(v));
    }
    if (typeof input === "string") {
        return input.split(",");
    }
    throw makeError(`${label} must be an array or comma-separated string`, 400);
}
function normalizeDietaryRestrictions(input) {
    if (input == null)
        return undefined;
    const values = toList(input, "Dietary restrictions");
    const cleaned = [];
    const invalid = [];
    const seen = new Set();
    for (const raw of values) {
        const trimmed = String(raw).trim();
        if (!trimmed)
            continue;
        const canonical = dietaryLookup.get(trimmed.toLowerCase());
        if (!canonical) {
            invalid.push(trimmed);
            continue;
        }
        const key = canonical.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            cleaned.push(canonical);
        }
    }
    if (invalid.length) {
        throw makeError(`Invalid dietary options: ${invalid.join(", ")}`, 400);
    }
    return cleaned;
}
function sanitizeAllergies(input) {
    if (input == null)
        return undefined;
    const values = toList(input, "Allergies");
    const cleaned = [];
    const seen = new Set();
    for (const raw of values) {
        let value = String(raw).trim();
        if (!value)
            continue;
        value = value.replace(/[\u0000-\u001f\u007f]/g, "");
        value = value.replace(/[<>]/g, "");
        value = value.replace(/\s+/g, " ");
        value = value.replace(/[^a-zA-Z0-9 \-']/g, "");
        value = value.trim();
        if (!value)
            continue;
        if (value.length > 50) {
            value = value.slice(0, 50).trim();
            if (!value)
                continue;
        }
        const key = value.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            cleaned.push(value);
        }
    }
    return cleaned;
}
function sanitizeProfileUpdate(input) {
    const { dietary_restric, allergies, userId: _userId, ...rest } = input;
    const output = { ...rest };
    const normalizedDietary = normalizeDietaryRestrictions(dietary_restric);
    if (normalizedDietary !== undefined) {
        output.dietary_restric = normalizedDietary;
    }
    const sanitizedAllergies = sanitizeAllergies(allergies);
    if (sanitizedAllergies !== undefined) {
        output.allergies = sanitizedAllergies;
    }
    return output;
}
//# sourceMappingURL=profile.js.map