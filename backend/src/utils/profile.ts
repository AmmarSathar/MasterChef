import { dietaryOptions } from "@masterchef/shared/constants";
import { ApiError } from "../types/index.js";

const dietaryLookup = new Map(
  dietaryOptions.map((option) => [option.toLowerCase(), option]),
);

function makeError(message: string, statusCode = 400): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toList(input: unknown, label: string): string[] {
  if (input == null) return [];
  if (Array.isArray(input)) {
    return input.map((v) => String(v));
  }
  if (typeof input === "string") {
    return input.split(",");
  }
  throw makeError(`${label} must be an array or comma-separated string`, 400);
}

export function normalizeDietaryRestrictions(
  input: unknown,
): string[] | undefined {
  if (input == null) return undefined;
  const values = toList(input, "Dietary restrictions");
  const cleaned: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const raw of values) {
    const trimmed = String(raw).trim();
    if (!trimmed) continue;
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

export function sanitizeAllergies(input: unknown): string[] | undefined {
  if (input == null) return undefined;
  const values = toList(input, "Allergies");
  const cleaned: string[] = [];
  const seen = new Set<string>();

  for (const raw of values) {
    let value = String(raw).trim();
    if (!value) continue;
    value = [...value]
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && code !== 127;
      })
      .join("");
    value = value.replace(/[<>]/g, "");
    value = value.replace(/\s+/g, " ");
    value = value.replace(/[^a-zA-Z0-9 \-']/g, "");
    value = value.trim();
    if (!value) continue;
    if (value.length > 50) {
      value = value.slice(0, 50).trim();
      if (!value) continue;
    }

    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      cleaned.push(value);
    }
  }

  return cleaned;
}

export function sanitizeProfileUpdate(
  input: Record<string, unknown>
): Record<string, unknown> {
  const { dietary_restric, allergies, ...rest } = input;
  delete rest.userId;
  const output: Record<string, unknown> = { ...rest };

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
