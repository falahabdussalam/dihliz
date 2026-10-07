"use server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  actionUser,
  runAction,
  id,
  field,
  type ActionState,
} from "@/lib/school-actions";
import { accessibleEnrollment } from "@/features/students/access";
import { approvedReport } from "./data";
export async function publishReport(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      enrollmentId = id(data, "enrollmentId"),
      kind = z
        .enum(["ATTENDANCE", "EXAMS", "PERFORMANCE", "CONSOLIDATED"])
        .parse(field(data, "kind"));
    await accessibleEnrollment(actor, enrollmentId);
    await prisma.$transaction(
      async (tx) => {
        const all = await approvedReport(enrollmentId, tx);
        const payload =
          kind === "CONSOLIDATED"
            ? all
            : {
                schemaVersion: 1,
                student: all.student,
                year: all.year,
                class: all.class,
                ...(kind === "ATTENDANCE"
                  ? { attendance: all.attendance }
                  : kind === "EXAMS"
                    ? { exams: all.exams }
                    : { performance: all.performance }),
              };
        const latest = await tx.reportSnapshot.findFirst({
          where: { enrollmentId, kind },
          orderBy: { version: "desc" },
        });
        const saved = await tx.reportSnapshot.create({
          data: {
            enrollmentId,
            kind,
            version: (latest?.version ?? 0) + 1,
            payload: JSON.parse(JSON.stringify(payload)),
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "PUBLISH_REPORT",
            entityType: "ReportSnapshot",
            entityId: saved.id,
          },
        });
      },
      { isolationLevel: "RepeatableRead", timeout: 20000 },
    );
    return "Approved report snapshot published. Later edits will not change this version.";
  });
}
