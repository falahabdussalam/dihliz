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
export async function createExamination(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      yearId = id(data, "yearId");
    const title = z.string().min(2).max(120).parse(field(data, "title"));
    const date = dateValue(field(data, "date"))!,
      markEntryDueDate = dateValue(field(data, "markEntryDueDate"))!,
      publishDate = dateValue(field(data, "publishDate"))!;
    if (markEntryDueDate < date || publishDate < markEntryDueDate)
      throw new Error(
        "Use exam date, then mark entry due date, then publish date.",
      );
    const ids = z
      .array(z.string().cuid())
      .min(1)
      .max(50)
      .parse(data.getAll("cohortIds"));
    if (new Set(ids).size !== ids.length)
      throw new Error("Duplicate class selection.");
    await prisma.$transaction(
      async (tx) => {
        const year = await tx.academicYear.findFirstOrThrow({
          where: { id: yearId, isArchived: false },
        });
        if (date < year.startDate || date > year.endDate)
          throw new Error("Exam date must fall within the academic year.");
        const cohorts = await tx.academicCohort.findMany({
          where: { id: { in: ids }, academicYearId: yearId, isArchived: false },
          include: {
            subjects: {
              where: { isArchived: false, subject: { isArchived: false } },
              include: { subject: true },
            },
            studentEnrollments: {
              where: { status: "ACTIVE", student: { isArchived: false } },
              include: { student: true, studyStream: true },
            },
          },
        });
        if (cohorts.length !== ids.length)
          throw new Error("A selected class is unavailable.");
        const event = await tx.examination.create({
          data: {
            title,
            academicYearId: yearId,
            isDemo: title.toUpperCase().startsWith("DEMO"),
          },
        });
        for (const c of cohorts) {
          if (!c.subjects.length || !c.studentEnrollments.length)
            throw new Error(
              c.displayName +
                " needs subjects and active students before creating an exam.",
            );
          await tx.exam.create({
            data: {
              eventId: event.id,
              cohortId: c.id,
              title,
              date,
              markEntryDueDate,
              publishDate,
              subjects: {
                create: c.subjects.map((s) => ({
                  cohortSubjectId: s.id,
                  markingTutorId: s.tutorId,
                  name: s.subject.name,
                  maxMarks: s.maxMarks,
                  passMarks: s.passMarks,
                  studyStreamCode: s.studyStreamCode,
                })),
              },
              candidates: {
                create: c.studentEnrollments.map((e) => ({
                  enrollmentId: e.id,
                  fullName: e.student.fullName,
                  studentNumber: e.student.studentNumber,
                  studyStreamCode: e.studyStream?.code ?? null,
                })),
              },
            },
          });
        }
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "CREATE_EXAMINATION",
            entityType: "Examination",
            entityId: event.id,
          },
        });
      },
      { timeout: 30000 },
    );
    return "Examination created with separate class rosters and subject settings.";
  });
}
export async function saveExamSubject(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      examId = id(data, "examId"),
      revision = z.coerce
        .number()
        .int()
        .nonnegative()
        .parse(field(data, "revision"));
    const examSubjectId = field(data, "examSubjectId"),
      cohortSubjectId = id(data, "cohortSubjectId");
    const maxMarks = z.coerce
        .number()
        .positive()
        .max(10000)
        .parse(field(data, "maxMarks")),
      passMarks = z.coerce
        .number()
        .min(0)
        .max(maxMarks)
        .parse(field(data, "passMarks"));
    await prisma.$transaction(async (tx) => {
      const exam = await tx.exam.findUniqueOrThrow({ where: { id: examId } });
      const locked = await tx.exam.updateMany({
        where: { id: examId, revision, status: "DRAFT", isArchived: false },
        data: { revision: { increment: 1 } },
      });
      if (!locked.count)
        throw new Error("Only the latest draft can change subject settings.");
      const source = await tx.cohortSubject.findFirstOrThrow({
        where: {
          id: cohortSubjectId,
          cohortId: exam.cohortId,
          isArchived: false,
        },
        include: { subject: true },
      });
      if (examSubjectId) {
        const subject = await tx.examSubject.findFirstOrThrow({
          where: { id: examSubjectId, examId, cohortSubjectId },
          include: { _count: { select: { marks: true } } },
        });
        if (subject._count.marks)
          throw new Error(
            "This subject has marks. Its settings cannot be changed or removed. Preserve this exam and create a corrected examination.",
          );
        if (field(data, "remove") === "on")
          await tx.examSubject.delete({ where: { id: subject.id } });
        else
          await tx.examSubject.update({
            where: { id: subject.id },
            data: {
              maxMarks,
              passMarks,
              studyStreamCode: source.studyStreamCode,
            },
          });
      } else
        await tx.examSubject.create({
          data: {
            examId,
            cohortSubjectId,
            markingTutorId: source.tutorId,
            name: source.subject.name,
            maxMarks,
            passMarks,
            studyStreamCode: source.studyStreamCode,
          },
        });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "EXAM_SUBJECT_SETTINGS",
          entityType: "Exam",
          entityId: examId,
          details: { examSubjectId, cohortSubjectId },
        },
      });
    });
    return "Exam subject settings saved.";
  });
}
export async function assignMarker(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      examId = id(data, "examId"),
      subjectId = id(data, "examSubjectId");
    const revision = z.coerce
        .number()
        .int()
        .nonnegative()
        .parse(field(data, "revision")),
      tutorId = field(data, "tutorId") || null;
    if (
      tutorId &&
      !(await prisma.user.findFirst({
        where: { id: tutorId, role: "SUBJECT_TUTOR", isActive: true },
      }))
    )
      throw new Error("Choose an active subject tutor.");
    await prisma.$transaction(async (tx) => {
      const changed = await tx.exam.updateMany({
        where: { id: examId, revision, status: "DRAFT", isArchived: false },
        data: { revision: { increment: 1 } },
      });
      if (!changed.count)
        throw new Error(
          "Only the latest draft can change marking assignments.",
        );
      const saved = await tx.examSubject.updateMany({
        where: { id: subjectId, examId },
        data: { markingTutorId: tutorId },
      });
      if (!saved.count) throw new Error("Subject unavailable.");
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "ASSIGN_EXAM_MARKER",
          entityType: "ExamSubject",
          entityId: subjectId,
          details: { tutorId },
        },
      });
    });
    return "Marker assigned to this class examination only.";
  });
}

export async function saveExamSchedule(_: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      examId = id(data, "examId"),
      revision = z.coerce
        .number()
        .int()
        .nonnegative()
        .parse(field(data, "revision"));
    const date = dateValue(field(data, "date"))!,
      markEntryDueDate = dateValue(field(data, "markEntryDueDate"))!,
      publishDate = dateValue(field(data, "publishDate"))!;
    if (markEntryDueDate < date || publishDate < markEntryDueDate)
      throw new Error(
        "Use exam date, then mark entry due date, then publish date.",
      );
    await prisma.$transaction(async (tx) => {
      const exam = await tx.exam.findUniqueOrThrow({
        where: { id: examId },
        include: { cohort: { include: { academicYear: true } } },
      });
      if (
        date < exam.cohort.academicYear.startDate ||
        date > exam.cohort.academicYear.endDate
      )
        throw new Error("Exam date must fall within the academic year.");
      const changed = await tx.exam.updateMany({
        where: { id: examId, revision, status: "DRAFT", isArchived: false },
        data: {
          date,
          markEntryDueDate,
          publishDate,
          revision: { increment: 1 },
        },
      });
      if (!changed.count)
        throw new Error(
          "Only the latest draft can change its schedule. Refresh and retry.",
        );
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "EXAM_SCHEDULE",
          entityType: "Exam",
          entityId: examId,
          details: {
            date: date.toISOString(),
            markEntryDueDate: markEntryDueDate.toISOString(),
            publishDate: publishDate.toISOString(),
          },
        },
      });
    });
    return "Class examination schedule updated.";
  });
}
