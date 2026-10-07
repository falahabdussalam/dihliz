"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  actionUser,
  runAction,
  field,
  id,
  dateValue,
  type ActionState,
} from "@/lib/school-actions";
import { attendanceDates } from "./period";
import { requireClass } from "./access";
import { criteriaSchema, performanceSummary, type Score } from "./rules";
const categoryValue = z.enum([
  "CLASS_BEHAVIOUR",
  "STUDY_DISCIPLINE",
  "HOSTEL_BEHAVIOUR",
]);
export async function openRegister(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(),
      cohortId = id(data, "cohortId"),
      performance = field(data, "kind") === "performance";
    const category = performance
      ? categoryValue.parse(field(data, "category"))
      : undefined;
    const cohort = await requireClass(actor, cohortId, category);
    const date = dateValue(field(data, "date"))!;
    if (
      date < cohort.academicYear.startDate ||
      date > cohort.academicYear.endDate
    )
      throw new Error("Date must fall within the academic year.");
    if (date > new Date())
      throw new Error("Future registers cannot be opened.");
    if (performance && date.getUTCDate() !== 1)
      throw new Error("Choose the first day of the evaluation month.");
    await prisma.$transaction(async (tx) => {
      const students = await tx.studentEnrollment.findMany({
        where: { cohortId, status: "ACTIVE", student: { isArchived: false } },
        include: { student: true },
      });
      if (!students.length)
        throw new Error("This class has no active students.");
      const entries = students.map((e) => ({
        enrollmentId: e.id,
        fullName: e.student.fullName,
        studentNumber: e.student.studentNumber,
      }));
      let saved;
      if (performance && category) {
        const criteria = await tx.performanceCriterion.findMany({
          where: { category, isArchived: false },
          orderBy: { code: "asc" },
        });
        if (!criteria.length)
          throw new Error("Configure criteria for this category first.");
        saved = await tx.performanceRegister.create({
          data: {
            cohortId,
            month: date,
            category,
            criteria: criteria.map((c) => ({
              id: c.id,
              name: c.name,
              maximum: c.maximum,
              version: c.version,
            })),
            entries: { create: entries.map((e) => ({ ...e, scores: {} })) },
          },
        });
      } else
        saved = await tx.attendanceRegister.create({
          data: { cohortId, date, entries: { create: entries } },
        });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "OPEN_REGISTER",
          entityType: performance
            ? "PerformanceRegister"
            : "AttendanceRegister",
          entityId: saved.id,
        },
      });
    });
    return "Register opened. Select it from the directory to begin marking.";
  });
}
export async function saveRegister(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(),
      registerId = id(data, "registerId"),
      performance = field(data, "kind") === "performance";
    const revision = z.coerce
      .number()
      .int()
      .nonnegative()
      .parse(field(data, "revision"));
    const intent = z
      .enum(["save", "submit", "reopen", "lock"])
      .parse(field(data, "intent") || "save");
    const reason = field(data, "reason");
    if (
      ["reopen", "lock"].includes(intent) &&
      performance &&
      actor.role !== "SUPER_ADMIN"
    )
      throw new Error(
        "Only an administrator can approve or reopen evaluations.",
      );
    if (intent === "reopen" && reason.length < 5)
      throw new Error("Give a correction reason of at least five characters.");
    await prisma.$transaction(
      async (tx) => {
        const register = performance
          ? await tx.performanceRegister.findUniqueOrThrow({
              where: { id: registerId },
              include: { entries: true },
            })
          : await tx.attendanceRegister.findUniqueOrThrow({
              where: { id: registerId },
              include: { entries: true },
            });
        await requireClass(
          actor,
          register.cohortId,
          "category" in register ? register.category : undefined,
        );
        if (
          intent === "lock" &&
          (!performance || register.status !== "SUBMITTED")
        )
          throw new Error("Only submitted evaluations can be approved.");
        if (intent === "reopen" && register.status === "DRAFT")
          throw new Error("This register is already a draft.");
        if (["save", "submit"].includes(intent) && register.status !== "DRAFT")
          throw new Error(
            "Reopen this register with a correction reason before editing.",
          );
        const status =
          intent === "submit"
            ? "SUBMITTED"
            : intent === "lock"
              ? "LOCKED"
              : intent === "reopen"
                ? "DRAFT"
                : register.status;
        const changed = performance
          ? await tx.performanceRegister.updateMany({
              where: { id: registerId, revision },
              data: { revision: { increment: 1 }, status },
            })
          : await tx.attendanceRegister.updateMany({
              where: { id: registerId, revision },
              data: { revision: { increment: 1 }, status },
            });
        if (!changed.count)
          throw new Error(
            "This register changed while you were editing. Reload before saving.",
          );
        if (intent === "save" || intent === "submit") {
          const submitted = data.getAll("entryIds").map(String);
          if (
            submitted.length !== register.entries.length ||
            new Set(submitted).size !== submitted.length ||
            register.entries.some((e) => !submitted.includes(e.id))
          )
            throw new Error("Incomplete register form. Reload and retry.");
          for (const entry of register.entries) {
            if (performance && "criteria" in register) {
              const criteria = criteriaSchema.parse(register.criteria);
              const scores: Record<string, Score> = {};
              for (const c of criteria) {
                if (!data.has("score:" + entry.id + ":" + c.id))
                  throw new Error("A score cell is missing.");
                const raw = field(
                  data,
                  "score:" + entry.id + ":" + c.id,
                ).toUpperCase();
                scores[c.id] = {
                  na: raw === "NA",
                  value:
                    raw === "" || raw === "NA"
                      ? null
                      : z.coerce.number().min(0).max(c.maximum).parse(raw),
                };
              }
              const summary = performanceSummary(criteria, scores);
              if (intent === "submit" && summary.missing)
                throw new Error(
                  "Mark every criterion or enter NA before submitting.",
                );
              await tx.performanceEntry.update({
                where: { id: entry.id },
                data: {
                  scores,
                  remarks:
                    z
                      .string()
                      .max(1000)
                      .parse(field(data, "remarks:" + entry.id)) || null,
                },
              });
            } else {
              if (!data.has("status:" + entry.id))
                throw new Error("A status cell is missing.");
              const raw = field(data, "status:" + entry.id);
              const status = raw
                ? z.enum(["PRESENT", "ABSENT", "OFF"]).parse(raw)
                : null;
              if (intent === "submit" && !status)
                throw new Error(
                  "Every student needs a status before submission.",
                );
              const offReason = z
                .string()
                .max(500)
                .parse(field(data, "reason:" + entry.id));
              if (status === "OFF" && offReason.length < 3)
                throw new Error("Give a reason for every Off entry.");
              await tx.attendanceEntry.update({
                where: { id: entry.id },
                data: { status, reason: status === "OFF" ? offReason : null },
              });
            }
          }
        }
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "REGISTER_" + intent.toUpperCase(),
            entityType: performance
              ? "PerformanceRegister"
              : "AttendanceRegister",
            entityId: registerId,
            details: { reason, revision },
          },
        });
      },
      { timeout: 30000 },
    );
    return intent === "save"
      ? "Draft saved."
      : intent === "submit"
        ? "Register submitted."
        : intent === "lock"
          ? "Evaluation approved and locked."
          : "Register reopened for correction.";
  });
}
export async function saveCriterion(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      category = categoryValue.parse(field(data, "category"));
    const code = z
      .string()
      .min(2)
      .max(40)
      .regex(/^[A-Z0-9_]+$/)
      .parse(field(data, "code").toUpperCase());
    const name = z.string().min(2).max(120).parse(field(data, "name")),
      maximum = z.coerce.number().min(1).max(10).parse(field(data, "maximum"));
    await prisma.$transaction(async (tx) => {
      const latest = await tx.performanceCriterion.findFirst({
        where: { category, code },
        orderBy: { version: "desc" },
      });
      const expected = Number(field(data, "version") || 0);
      if ((latest?.version ?? 0) !== expected)
        throw new Error("This criterion changed. Reload its latest version.");
      await tx.performanceCriterion.updateMany({
        where: { category, code, isArchived: false },
        data: { isArchived: true },
      });
      const saved = await tx.performanceCriterion.create({
        data: {
          category,
          code,
          name,
          maximum,
          version: expected + 1,
          isArchived: field(data, "archived") === "on",
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "VERSION_CRITERION",
          entityType: "PerformanceCriterion",
          entityId: saved.id,
        },
      });
    });
    return "Criterion version saved. Existing registers keep their original criteria.";
  });
}

export async function openAttendancePeriod(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(),
      cohortId = id(data, "cohortId");
    const cohort = await requireClass(actor, cohortId);
    const dates = attendanceDates(
      field(data, "mode"),
      field(data, "date"),
      cohort.academicYear.startDate.toISOString().slice(0, 10),
      cohort.academicYear.endDate.toISOString().slice(0, 10),
    );
    await prisma.$transaction(
      async (tx) => {
        const students = await tx.studentEnrollment.findMany({
          where: { cohortId, status: "ACTIVE", student: { isArchived: false } },
          include: { student: true },
        });
        if (!students.length)
          throw new Error("This class has no active students.");
        for (const iso of dates) {
          const date = new Date(iso + "T00:00:00Z");
          if (
            await tx.attendanceRegister.findUnique({
              where: { cohortId_date: { cohortId, date } },
              select: { id: true },
            })
          )
            continue;
          const register = await tx.attendanceRegister.create({
            data: {
              cohortId,
              date,
              entries: {
                create: students.map((e) => ({
                  enrollmentId: e.id,
                  fullName: e.student.fullName,
                  studentNumber: e.student.studentNumber,
                })),
              },
            },
          });
          await tx.auditLog.create({
            data: {
              actorId: actor.id,
              action: "OPEN_REGISTER",
              entityType: "AttendanceRegister",
              entityId: register.id,
            },
          });
        }
      },
      { timeout: 60000 },
    );
    return "Daily registers opened. You can now mark this period.";
  });
}
