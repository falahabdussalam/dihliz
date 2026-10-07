import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  attendanceSummary,
  performanceSummary,
  criteriaSchema,
  scoresSchema,
} from "@/features/operations/rules";
import { examResult, applies } from "@/lib/school-rules";
export async function approvedReport(
  enrollmentId: string,
  db: Prisma.TransactionClient = prisma,
) {
  const enrollment = await db.studentEnrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    include: {
      student: { select: { fullName: true, studentNumber: true } },
      cohort: { include: { academicYear: true } },
      studyStream: true,
      house: true,
    },
  });
  const [attendance, exams, performance, achievements] = await Promise.all([
    db.attendanceEntry.findMany({
      where: {
        enrollmentId,
        register: { status: { in: ["SUBMITTED", "LOCKED"] } },
      },
      include: { register: { select: { date: true } } },
      orderBy: { register: { date: "asc" } },
    }),
    db.examCandidate.findMany({
      where: {
        enrollmentId,
        exam: {
          status: { in: ["FINAL", "LOCKED"] },
          isArchived: false,
          event: { isDemo: false },
        },
      },
      include: { marks: true, exam: { include: { subjects: true } } },
      orderBy: { exam: { date: "asc" } },
    }),
    db.performanceEntry.findMany({
      where: { enrollmentId, register: { status: "LOCKED" } },
      include: { register: true },
      orderBy: { register: { month: "asc" } },
    }),
    db.achievement.findMany({
      where: { enrollmentId, isArchived: false },
      orderBy: { date: "desc" },
    }),
  ]);
  return {
    schemaVersion: 1,
    student: enrollment.student,
    year: enrollment.cohort.academicYear.name,
    class: enrollment.cohort.displayName,
    stream: enrollment.studyStream?.name ?? null,
    house: enrollment.house?.name ?? null,
    attendance: {
      ...attendanceSummary(attendance),
      days: attendance.map((e) => ({
        date: e.register.date.toISOString().slice(0, 10),
        status: e.status,
        reason: e.reason,
      })),
      note: "Only submitted registers count. Missing dates are unmarked.",
    },
    exams: exams.map((e) => ({
      title: e.exam.title,
      date: e.exam.date.toISOString().slice(0, 10),
      ...examResult(e.exam.subjects, e.marks, e.studyStreamCode),
      subjects: e.exam.subjects
        .filter((s) => applies(s, e.studyStreamCode))
        .map((s) => ({
          name: s.name,
          maximum: s.maxMarks,
          pass: s.passMarks,
          mark: e.marks.find((m) => m.examSubjectId === s.id) ?? null,
        })),
    })),
    performance: performance.map((e) => ({
      month: e.register.month.toISOString().slice(0, 7),
      category: e.register.category,
      ...performanceSummary(
        criteriaSchema.parse(e.register.criteria),
        scoresSchema.parse(e.scores),
      ),
      criteria: e.register.criteria,
      scores: e.scores,
      remarks: e.remarks,
    })),
    achievements: achievements.map((a) => ({
      title: a.title,
      kind: a.kind,
      date: a.date.toISOString().slice(0, 10),
      award: a.award,
      organiser: a.organiser,
      evidenceUrl: a.evidenceUrl,
    })),
  };
}
