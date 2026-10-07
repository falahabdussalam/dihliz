"use server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  actionUser,
  runAction,
  field,
  type ActionState,
} from "@/lib/school-actions";
export async function saveMaster(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      kind = z
        .enum(["streams", "departments", "houses", "levels", "divisions"])
        .parse(field(data, "kind"));
    const id = field(data, "id"),
      code = z
        .string()
        .min(1)
        .max(kind === "levels" || kind === "divisions" ? 20 : 40)
        .regex(/^[A-Z0-9_+-]+$/)
        .parse(field(data, "code").toUpperCase()),
      name = z.string().min(2).max(50).parse(field(data, "name")),
      isArchived = field(data, "archived") === "on";
    const values = { code, name, isArchived };
    await prisma.$transaction(async (tx) => {
      const where = { id, code, updatedAt: new Date(field(data, "updatedAt")) };
      let entityId = id,
        count = 1;
      if (kind === "levels") {
        const sortOrder = z.coerce
          .number()
          .int()
          .nonnegative()
          .parse(field(data, "sortOrder"));
        if (id)
          count = (
            await tx.classLevel.updateMany({
              where,
              data: { ...values, sortOrder },
            })
          ).count;
        else
          entityId = (
            await tx.classLevel.create({ data: { ...values, sortOrder } })
          ).id;
      } else if (kind === "streams") {
        if (id)
          count = (await tx.stream.updateMany({ where, data: values })).count;
        else entityId = (await tx.stream.create({ data: values })).id;
      } else if (kind === "departments") {
        if (id)
          count = (await tx.department.updateMany({ where, data: values }))
            .count;
        else entityId = (await tx.department.create({ data: values })).id;
      } else if (kind === "houses") {
        if (id)
          count = (await tx.house.updateMany({ where, data: values })).count;
        else entityId = (await tx.house.create({ data: values })).id;
      } else {
        if (id)
          count = (await tx.division.updateMany({ where, data: values })).count;
        else entityId = (await tx.division.create({ data: values })).id;
      }
      if (!count)
        throw new Error("This record changed. Reload before editing.");
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "SAVE_ACADEMIC_MASTER",
          entityType: kind,
          entityId,
        },
      });
    });
    return "Academic record saved.";
  });
}
export async function editStructure(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      kind = z.enum(["year", "class"]).parse(field(data, "kind"));
    const recordId = z.string().cuid().parse(field(data, "id")),
      updatedAt = z.iso.datetime().parse(field(data, "updatedAt"));
    const isArchived = field(data, "archived") === "on";
    await prisma.$transaction(async (tx) => {
      if (kind === "year") {
        const year = await tx.academicYear.findUniqueOrThrow({
          where: { id: recordId },
        });
        if (isArchived && year.isActive)
          throw new Error(
            "Select another active year before archiving this year.",
          );
        const name = z.string().min(4).max(20).parse(field(data, "name"));
        const saved = await tx.academicYear.updateMany({
          where: { id: recordId, updatedAt: new Date(updatedAt) },
          data: { name, isArchived },
        });
        if (!saved.count)
          throw new Error("This year changed. Reload before editing.");
      } else {
        if (
          isArchived &&
          (await tx.studentEnrollment.count({
            where: { cohortId: recordId, status: "ACTIVE" },
          }))
        )
          throw new Error(
            "Move or complete active enrollments before archiving this class.",
          );
        const displayName = z
          .string()
          .min(1)
          .max(100)
          .parse(field(data, "name"));
        const saved = await tx.academicCohort.updateMany({
          where: { id: recordId, updatedAt: new Date(updatedAt) },
          data: { displayName, isArchived },
        });
        if (!saved.count)
          throw new Error("This class changed. Reload before editing.");
      }
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "EDIT_ACADEMIC_STRUCTURE",
          entityType: kind,
          entityId: recordId,
        },
      });
    });
    return "Academic structure updated. Historical relationships are preserved.";
  });
}
