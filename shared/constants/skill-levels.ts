/**
 * Skill levels with display labels and database values.
 * Label = what the user sees (capitalized).
 * Value = what gets stored in MongoDB (lowercase).
 *
 * The backend mongoose enum is: ["beginner", "intermediate", "advanced", "expert"]
 * DO NOT change the `value` fields without a database migration.
 */
export const SKILL_LEVELS = [
  { label: "Beginner",     value: "beginner"     },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced",     value: "advanced"     },
  { label: "Expert",       value: "expert"       },
] as const;

/** The lowercase values stored in the database */
export type SkillLevelValue = (typeof SKILL_LEVELS)[number]["value"];

/** The display labels shown in the UI */
export type SkillLevelLabel = (typeof SKILL_LEVELS)[number]["label"];

/** Just the value strings, for mongoose enum and validation */
export const skillLevelValues = SKILL_LEVELS.map((s) => s.value) as SkillLevelValue[];

/** Just the label strings, for simple UI rendering */
export const skillLevelLabels = SKILL_LEVELS.map((s) => s.label) as SkillLevelLabel[];

/** Convert a display label to its database value */
export function skillLevelToValue(label: string): SkillLevelValue | undefined {
  const found = SKILL_LEVELS.find((s) => s.label === label);
  return found?.value;
}

/** Convert a database value to its display label */
export function skillLevelToLabel(value: string): SkillLevelLabel | undefined {
  const found = SKILL_LEVELS.find((s) => s.value === value);
  return found?.label;
}
