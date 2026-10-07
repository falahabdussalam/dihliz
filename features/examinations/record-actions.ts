"use server";
import { canEnterExamMarks } from "@/lib/exam-lifecycle";
import { examStage, examDay } from "@/lib/exam-lifecycle";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  actionUser,
  runAction,
  field,
  id,
  dateValue,
  type ActionState,
} from "@/lib/school-actions";
import { examWorkspace } from "@/lib/exam-queries";
import { applies, examResult, validateScore } from "@/lib/school-rules";
const revision = (data: FormData) =>
  z.coerce.number().int().min(0).parse(field(data, "revision"));
const twoDecimals = (value: number) =>
  Math.abs(Math.round(value * 100) - value * 100) < 1e-7;
export async function saveSubject(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true);
    const subjectId = field(data, "subjectId");
    const code = z
      .string()
      .min(1)
      .max(40)
      .regex(
        /^[A-Z0-9_-]+$/,
        "Use letters, digits, hyphens or underscores for the subject code.",
      )
      .parse(field(data, "code").toUpperCase());
    const name = z.string().min(2).max(100).parse(field(data, "name"));
    const departmentId = id(data, "departmentId");
    if (
      !(await prisma.department.findFirst({
        where: { id: departmentId, isArchived: false },
      }))
    )
      throw new Error("Select an available department.");
    await prisma.$transaction(async (tx) => {
      const subject = subjectId
        ? await tx.subject.update({
            where: { id: subjectId },
            data: {
              code,
              name,
              departmentId,
              isArchived: field(data, "isArchived") === "on",
            },
          })
        : await tx.subject.create({ data: { code, name, departmentId } });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "SAVE_SUBJECT",
          entityType: "Subject",
          entityId: subject.id,
        },
      });
    });
    revalidatePath("/dashboard/exams/subjects");
    return "Subject saved.";
  });
}
export async function saveCohortSubject(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true);
    const cohortId = id(data, "cohortId"),
      subjectId = id(data, "subjectId");
    const maxMarks = z.coerce
      .number()
      .positive()
      .max(10000)
      .parse(field(data, "maxMarks"));
    const passMarks = z.coerce
      .number()
      .min(0)
      .max(maxMarks)
      .parse(field(data, "passMarks"));
    if (!twoDecimals(maxMarks) || !twoDecimals(passMarks))
      throw new Error("Mark limits support at most two decimals.");
    const tutorId = field(data, "tutorId") || null;
    const studyStreamCode = field(data, "studyStreamCode") || null;
    const cohort = await prisma.academicCohort.findFirst({
      where: {
        id: cohortId,
        isArchived: false,
        academicYear: { isArchived: false },
      },
      include: { stream: true },
    });
    if (
      !cohort ||
      !(await prisma.subject.findFirst({
        where: { id: subjectId, isArchived: false },
      }))
    )
      throw new Error("Select an available cohort and subject.");
    if (
      tutorId &&
      !(await prisma.user.findFirst({
        where: { id: tutorId, role: "SUBJECT_TUTOR", isActive: true },
      }))
    )
      throw new Error("Select an active subject tutor.");
    if (
      studyStreamCode &&
      (cohort.stream?.code !== "SCIENCE" ||
        !["COMPUTER_SCIENCE", "BIOLOGY_SCIENCE"].includes(studyStreamCode))
    )
      throw new Error(
        "Stream-specific subjects apply to the combined Science cohort only.",
      );
    await prisma.$transaction(async (tx) => {
      const saved = await tx.cohortSubject.upsert({
        where: { cohortId_subjectId: { cohortId, subjectId } },
        create: {
          cohortId,
          subjectId,
          tutorId,
          studyStreamCode,
          maxMarks,
          passMarks,
        },
        update: {
          tutorId,
          studyStreamCode,
          maxMarks,
          passMarks,
          isArchived: field(data, "isArchived") === "on",
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "ASSIGN_SUBJECT",
          entityType: "CohortSubject",
          entityId: saved.id,
        },
      });
    });
    revalidatePath("/dashboard/exams/subjects");
    return "Cohort subject saved. Existing exams retain their mark settings.";
  });
}
export async function createExam(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      cohortId = id(data, "cohortId");
    const title = z.string().min(2).max(120).parse(field(data, "title")),
      date = dateValue(field(data, "date"))!;
    const subjectIds = z
      .array(z.string().cuid())
      .min(1, "Select at least one subject.")
      .max(30)
      .parse(data.getAll("subjectIds"));
    if (new Set(subjectIds).size !== subjectIds.length)
      throw new Error("Duplicate subject selection.");
    await prisma.$transaction(
      async (tx) => {
        const cohort = await tx.academicCohort.findFirst({
          where: { id: cohortId, isArchived: false },
          include: { academicYear: true },
        });
        if (!cohort || cohort.academicYear.isArchived)
          throw new Error("Cohort is unavailable.");
        if (
          date < cohort.academicYear.startDate ||
          date > cohort.academicYear.endDate
        )
          throw new Error("Exam date must fall within the academic year.");
        const subjects = await tx.cohortSubject.findMany({
          where: {
            id: { in: subjectIds },
            cohortId,
            isArchived: false,
            subject: { isArchived: false },
          },
          include: { subject: true },
        });
        if (subjects.length !== subjectIds.length)
          throw new Error("A selected subject is not assigned to this cohort.");
        const enrollments = await tx.studentEnrollment.findMany({
          where: { cohortId, status: "ACTIVE", student: { isArchived: false } },
          include: { student: true, studyStream: true },
          take: 501,
        });
        if (!enrollments.length)
          throw new Error("There are no active students in this cohort.");
        if (enrollments.length > 500)
          throw new Error(
            "Split cohorts with more than 500 students before creating an exam.",
          );
        const event = await tx.examination.create({
          data: {
            academicYearId: cohort.academicYearId,
            title,
            isDemo: title.toUpperCase().startsWith("DEMO"),
          },
        });
        const exam = await tx.exam.create({
          data: { eventId: event.id, cohortId, title, date },
        });
        for (const subject of subjects) {
          const maxMarks = z.coerce
            .number()
            .positive()
            .max(10000)
            .parse(field(data, "max_" + subject.id));
          const passMarks = z.coerce
            .number()
            .min(0)
            .max(maxMarks)
            .parse(field(data, "pass_" + subject.id));
          if (!twoDecimals(maxMarks) || !twoDecimals(passMarks))
            throw new Error("Mark limits support at most two decimals.");
          await tx.examSubject.create({
            data: {
              examId: exam.id,
              cohortSubjectId: subject.id,
              markingTutorId: subject.tutorId,
              name: subject.subject.name,
              maxMarks,
              passMarks,
              studyStreamCode: subject.studyStreamCode,
            },
          });
        }
        await tx.examCandidate.createMany({
          data: enrollments.map((e) => ({
            examId: exam.id,
            enrollmentId: e.id,
            fullName: e.student.fullName,
            studentNumber: e.student.studentNumber,
            studyStreamCode: e.studyStream?.code ?? null,
          })),
        });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "CREATE_EXAM",
            entityType: "Exam",
            entityId: exam.id,
          },
        });
      },
      { timeout: 15000 },
    );
    return "Exam created. Open it from the list to enter marks.";
  });
}
export async function saveMarks(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(),
      examId = id(data, "examId"),
      expectedRevision = revision(data);
    const workspace = await examWorkspace(actor, examId);
    if (!workspace) throw new Error("You do not have access to this exam.");
    const editable = workspace.subjects.filter((s) => s.canEdit);
    if (!editable.length)
      throw new Error(
        "You are not assigned to enter marks for these subjects.",
      );
    if (!canEnterExamMarks(workspace.exam, actor.role))
      throw new Error(
        "Mark entry is available only while the exam is ongoing.",
      );
    const candidateById = new Map(workspace.candidates.map((c) => [c.id, c]));
    const subjectById = new Map(editable.map((s) => [s.id, s]));
    const cells = Array.from(data.entries()).filter(([key]) =>
      key.startsWith("mark:"),
    );
    const expectedCells = workspace.candidates.reduce(
      (sum, c) =>
        sum + editable.filter((s) => applies(s, c.studyStreamCode)).length,
      0,
    );
    if (
      cells.length !== expectedCells ||
      new Set(cells.map(([key]) => key)).size !== cells.length
    )
      throw new Error("Incomplete marks form. Reload the exam.");
    const updates = cells.map(([key, value]) => {
      if (key.split(":").length !== 3) throw new Error("Invalid mark cell.");
      const [, candidateId, examSubjectId] = key.split(":");
      const candidate = candidateById.get(candidateId),
        subject = subjectById.get(examSubjectId);
      if (
        !candidate ||
        !subject ||
        !applies(subject, candidate.studyStreamCode)
      )
        throw new Error("Invalid or unauthorized mark cell.");
      const raw = String(value).trim().toUpperCase();
      const status =
        raw === "ABSENT"
          ? ("ABSENT" as const)
          : raw === "NA"
            ? ("NOT_APPLICABLE" as const)
            : ("SCORED" as const);
      const score =
        status === "SCORED" ? validateScore(raw, subject.maxMarks) : null;
      return { candidateId, examSubjectId, status, score, clear: raw === "" };
    });
    if (workspace.exam.status !== "DRAFT" && updates.some((cell) => cell.clear))
      throw new Error(
        "Finalized marks cannot be left blank. Enter a score, ABSENT or NA.",
      );
    const changedUpdates = updates.filter((cell) => {
      const saved = candidateById
        .get(cell.candidateId)
        ?.marks.find((mark) => mark.examSubjectId === cell.examSubjectId);
      return cell.clear
        ? !!saved
        : !saved || saved.status !== cell.status || saved.score !== cell.score;
    });
    await prisma.$transaction(
      async (tx) => {
        const locked = await tx.exam.updateMany({
          where: {
            id: examId,
            revision: expectedRevision,
            status:
              actor.role === "SUPER_ADMIN" ? workspace.exam.status : "DRAFT",
            date: { lte: examDay() },
            ...(actor.role === "SUPER_ADMIN"
              ? {}
              : {
                  OR: [
                    { markEntryDueDate: null },
                    { markEntryDueDate: { gte: examDay() } },
                  ],
                }),
            isArchived: false,
          },
          data: { revision: { increment: 1 } },
        });
        if (!locked.count)
          throw new Error(
            "The exam changed while you were editing. Refresh before saving.",
          );
        for (const cell of changedUpdates) {
          if (cell.clear)
            await tx.examMark.deleteMany({
              where: {
                candidateId: cell.candidateId,
                examSubjectId: cell.examSubjectId,
                examId,
              },
            });
          else
            await tx.examMark.upsert({
              where: {
                candidateId_examSubjectId: {
                  candidateId: cell.candidateId,
                  examSubjectId: cell.examSubjectId,
                },
              },
              create: {
                examId,
                candidateId: cell.candidateId,
                examSubjectId: cell.examSubjectId,
                status: cell.status,
                score: cell.score,
              },
              update: { status: cell.status, score: cell.score },
            });
        }
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "SAVE_MARKS",
            entityType: "Exam",
            entityId: examId,
            details: {
              cells: changedUpdates.length,
              adminCorrection:
                actor.role === "SUPER_ADMIN" &&
                examStage(workspace.exam) !== "Ongoing",
              examStatus: workspace.exam.status,
            },
          },
        });
      },
      { timeout: 20000 },
    );
    revalidatePath("/dashboard/exams/" + examId);
    return "Marks saved.";
  });
}
export async function changeExamStatus(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      examId = id(data, "examId"),
      expectedRevision = revision(data);
    const next = z
      .enum(["FINAL", "LOCKED", "DRAFT", "ARCHIVE", "RESTORE"])
      .parse(field(data, "nextStatus"));
    await prisma.$transaction(async (tx) => {
      const exam = await tx.exam.findUniqueOrThrow({
        where: { id: examId },
        include: { subjects: true, candidates: { include: { marks: true } } },
      });
      if ((exam.isArchived && next !== "RESTORE") || exam.status === "LOCKED")
        throw new Error("Archived or locked exams cannot be changed.");
      if (next === "RESTORE" && !exam.isArchived)
        throw new Error("This exam is not archived.");
      if (next === "DRAFT" && field(data, "reason").length < 5)
        throw new Error("Give a correction reason before reopening results.");
      if (next === "LOCKED" && exam.status !== "FINAL")
        throw new Error("Finalize the exam before locking.");
      if (next === "DRAFT" && exam.status !== "FINAL")
        throw new Error("Only a final exam can be reopened.");
      if (next === "FINAL" && exam.status !== "DRAFT")
        throw new Error("Only a draft exam can be finalized.");
      if (next === "ARCHIVE" && exam.status !== "DRAFT")
        throw new Error("Only a draft exam can be archived.");
      if (
        next === "FINAL" &&
        (!exam.subjects.length || !exam.candidates.length)
      )
        throw new Error("Add subjects and students before finalizing results.");
      if (
        next === "FINAL" &&
        exam.candidates.some(
          (c) => examResult(exam.subjects, c.marks, c.studyStreamCode).missing,
        )
      )
        throw new Error(
          "Enter a score, ABSENT or NA for every applicable cell before finalizing.",
        );
      const changed = await tx.exam.updateMany({
        where: {
          id: examId,
          revision: expectedRevision,
          status: exam.status,
          isArchived: exam.isArchived,
        },
        data: {
          revision: { increment: 1 },
          ...(next === "ARCHIVE"
            ? { isArchived: true }
            : next === "RESTORE"
              ? { isArchived: false }
              : { status: next }),
        },
      });
      if (!changed.count)
        throw new Error("The exam changed. Refresh and try again.");
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "EXAM_" + next,
          entityType: "Exam",
          entityId: examId,
          details: { reason: field(data, "reason") },
        },
      });
    });
    revalidatePath("/dashboard/exams/" + examId);
    return next === "ARCHIVE"
      ? "Exam archived."
      : "Exam status changed to " + next + ".";
  });
}
