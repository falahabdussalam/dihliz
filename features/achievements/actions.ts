"use server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  actionUser,
  runAction,
  field,
  id,
  dateValue,
  type ActionState,
} from "@/lib/school-actions";
import { accessibleEnrollment } from "@/features/students/access";
import { requireClass } from "@/features/operations/access";
export async function saveAchievement(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(),
      enrollmentId = id(data, "enrollmentId"),
      entry = await accessibleEnrollment(actor, enrollmentId);
    await requireClass(actor, entry.cohortId);
    const achievementId = field(data, "achievementId"),
      revision = z.coerce
        .number()
        .int()
        .nonnegative()
        .parse(field(data, "revision") || 0);
    const evidenceUrl = field(data, "evidenceUrl");
    if (evidenceUrl) {
      const url = z.url().parse(evidenceUrl);
      if (new URL(url).protocol !== "https:")
        throw new Error("Evidence links must use HTTPS.");
    }
    const values = {
      title: z.string().min(2).max(160).parse(field(data, "title")),
      kind: z
        .enum(["ACTIVITY", "COMPETITION", "PARTICIPATION", "AWARD"])
        .parse(field(data, "kind")),
      date: dateValue(field(data, "date"))!,
      organiser: z.string().max(160).parse(field(data, "organiser")) || null,
      award: z.string().max(120).parse(field(data, "award")) || null,
      remarks: z.string().max(1000).parse(field(data, "remarks")) || null,
      evidenceUrl: evidenceUrl || null,
      isArchived: field(data, "archived") === "on",
    };
    await prisma.$transaction(async (tx) => {
      let entityId = achievementId;
      if (achievementId) {
        const saved = await tx.achievement.updateMany({
          where: { id: achievementId, enrollmentId, revision },
          data: { ...values, revision: { increment: 1 } },
        });
        if (!saved.count)
          throw new Error("This achievement changed. Reload before editing.");
      } else
        entityId = (
          await tx.achievement.create({ data: { enrollmentId, ...values } })
        ).id;
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "SAVE_ACHIEVEMENT",
          entityType: "Achievement",
          entityId,
        },
      });
    });
    return "Achievement saved.";
  });
}
