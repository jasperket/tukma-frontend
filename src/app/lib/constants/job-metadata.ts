// Constants for job types and shift types derived from the API documentation
export const JOB_TYPES = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"] as const;
export type JobType = typeof JOB_TYPES[number];

export const SHIFT_TYPES = [
  "DAY_SHIFT",
  "NIGHT_SHIFT",
  "ROTATING_SHIFT",
  "FLEXIBLE_SHIFT",
] as const;
export type ShiftType = typeof SHIFT_TYPES[number];

// Utility function to format display names for UI
export function formatDisplayName(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
