import { z } from "zod";
export const examConfiguration = z.object({
  version: z.literal(1),
  title: z.string().min(2).max(120),
  date: z.string(),
  markEntryDueDate: z.string(),
  publishDate: z.string(),
  cohorts: z
    .array(
      z.object({
        cohortId: z.string().cuid(),
        subjects: z
          .array(
            z
              .object({
                id: z.string().cuid(),
                maxMarks: z.number().positive().max(10000),
                passMarks: z.number().nonnegative().max(10000),
              })
              .refine(
                (s) => s.passMarks <= s.maxMarks,
                "Pass marks cannot exceed maximum marks.",
              ),
          )
          .max(500),
      }),
    )
    .min(1)
    .max(50),
});
