import { z } from "zod";
export const categories = {
  CLASS_BEHAVIOUR: "Class Behaviour",
  STUDY_DISCIPLINE: "Study & Discipline",
  HOSTEL_BEHAVIOUR: "Hostel Behaviour",
} as const;
export type Category = keyof typeof categories;
export const criteriaSchema = z
  .array(
    z.object({
      id: z.string(),
      name: z.string(),
      maximum: z.number().min(1).max(10),
      version: z.number().int(),
    }),
  )
  .min(1);
export type Criterion = z.infer<typeof criteriaSchema>[number];
export type Score = { value: number | null; na: boolean };
export const scoresSchema = z.record(
  z.string(),
  z.object({ value: z.number().nonnegative().nullable(), na: z.boolean() }),
);
export function attendanceSummary(entries: { status: string | null }[]) {
  const present = entries.filter((e) => e.status === "PRESENT").length,
    absent = entries.filter((e) => e.status === "ABSENT").length,
    off = entries.filter((e) => e.status === "OFF").length;
  return {
    present,
    absent,
    off,
    missing: entries.length - present - absent - off,
    percentage:
      present + absent
        ? Math.round((present / (present + absent)) * 10000) / 100
        : null,
  };
}
export function performanceSummary(
  criteria: Criterion[],
  scores: Record<string, Score>,
) {
  let total = 0,
    maximum = 0,
    missing = 0;
  for (const c of criteria) {
    const score = scores[c.id];
    if (!score || (!score.na && score.value === null)) {
      missing++;
      continue;
    }
    if (score.na) continue;
    if (score.value! > c.maximum || score.value! < 0)
      throw new Error("Score outside criterion maximum.");
    total += score.value!;
    maximum += c.maximum;
  }
  return {
    total,
    maximum,
    missing,
    percentage:
      !missing && maximum ? Math.round((total / maximum) * 10000) / 100 : null,
  };
}
export function canManageRegister(
  role: string,
  assigned: boolean,
  category?: string,
) {
  return (
    role === "SUPER_ADMIN" ||
    (assigned &&
      role ===
        (category === "HOSTEL_BEHAVIOUR" ? "HOSTEL_MENTOR" : "CLASS_MENTOR"))
  );
}
