/**
 * All supported cuisine types.
 * Used in frontend selection UI and backend validation.
 */
export const CUISINES = [
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Indian",
  "Thai",
  "French",
  "Mediterranean",
  "American",
  "Korean",
] as const;

/** Union type of all valid cuisine strings */
export type CuisineOption = (typeof CUISINES)[number];

/** Mutable array for APIs that need string[] */
export const cuisineOptions: CuisineOption[] = [...CUISINES];
