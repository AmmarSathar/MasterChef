import { describe, it, expect } from "vitest";
import {
  normalizeDietaryRestrictions,
  sanitizeAllergies,
  sanitizeProfileUpdate,
} from "../src/utils/profile.js";

describe("profile utils", () => {
  it("normalizes dietary options case-insensitively and de-dupes", () => {
    const result = normalizeDietaryRestrictions([
      "vegan",
      "Vegan",
      "Gluten-Free",
      "gluten-free",
    ]);

    expect(result).toEqual(["Vegan", "Gluten-Free"]);
  });

  it("throws on invalid dietary options", () => {
    expect(() =>
      normalizeDietaryRestrictions(["Vegan", "Keto", "No-Meat"]),
    ).toThrow(/Invalid dietary options/i);
  });

  it("sanitizes allergies and removes duplicates", () => {
    const result = sanitizeAllergies([
      "  peanuts ",
      "Peanuts",
      "shellfish<>",
      "",
      "egg\t",
    ]);

    expect(result).toEqual(["peanuts", "shellfish", "egg"]);
  });

  it("accepts comma-separated allergy strings", () => {
    const result = sanitizeAllergies("nuts, soy ,  , eggs");
    expect(result).toEqual(["nuts", "soy", "eggs"]);
  });

  it("sanitizes profile update payload and strips userId", () => {
    const result = sanitizeProfileUpdate({
      userId: "override",
      dietary_restric: ["vegan"],
      allergies: ["  nuts "],
      bio: "Chef",
    });

    expect(result).toEqual({
      dietary_restric: ["Vegan"],
      allergies: ["nuts"],
      bio: "Chef",
    });
  });
});
