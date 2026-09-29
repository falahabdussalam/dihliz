import "dotenv/config";
import { createHash } from "node:crypto";
import { prisma } from "../lib/prisma";
import { examResult } from "../lib/school-rules";

const demoId = (key: string) => "c" + createHash("sha256").update("dihliz-exam-demo-v1:" + key).digest("hex").slice(0, 24);
async function main() {
  const year = await prisma.academicYear.findFirstOrThrow({ where: { isActive: true, isArchived: false } });
  const cohorts = await prisma.academicCohort.findMany({
    where: { academicYearId: year.id, isArchived: false },
    include: { stream: true, studentEnrollments: {
      where: { status: "ACTIVE", student: { isArchived: false } },
      include: { student: true, studyStream: true },
      orderBy: { student: { studentNumber: "asc" } },
    } }, orderBy: { code: "asc" },
  });
  const department = await prisma.department.upsert({ where: { code: "DEMO_EXAMS" }, create: { code: "DEMO_EXAMS", name: "DEMO · Examination preview" }, update: {} });
  let created = 0, skipped = 0;
  for (const cohort of cohorts) {
    if (!cohort.studentEnrollments.length) continue;
    const commerce = cohort.stream?.code.includes("COMMERCE");
    const definitions = [
      { code: "ENGLISH", name: "English", stream: null as string | null, max: 100 },
      { code: "MATHEMATICS", name: "Mathematics", stream: null as string | null, max: 100 },
      { code: commerce ? "ACCOUNTANCY" : "SCIENCE", name: commerce ? "Accountancy" : "Science", stream: null as string | null, max: 100 },
      { code: "PROJECT", name: "Project / practical", stream: null as string | null, max: 50 },
      ...(cohort.stream?.code === "SCIENCE" ? [
        { code: "BIOLOGY", name: "Biology", stream: "BIOLOGY_SCIENCE", max: 100 },
        { code: "COMPUTER_SCIENCE", name: "Computer Science", stream: "COMPUTER_SCIENCE", max: 100 },
      ] : []),
    ];
    for (const [index, status] of (["DRAFT", "FINAL", "LOCKED"] as const).entries()) {
      const examId = demoId(cohort.id + status);
      // Never overwrite preview marks or workflow changes made by the user.
      if (await prisma.exam.findUnique({ where: { id: examId } })) { skipped++; continue; }
      await prisma.$transaction(async tx => {
        const date = new Date(year.startDate.getTime() + (year.endDate.getTime() - year.startDate.getTime()) * (index + 1) / 4);
        const title = "DEMO · " + ["Practice test (try entering marks)", "Term results (finalized)", "Annual results (locked)"][index];
        const event=await tx.examination.create({data:{academicYearId:cohort.academicYearId,title,isDemo:true}});
        await tx.exam.create({ data: { eventId:event.id,id: examId, cohortId: cohort.id, title, date, status } });
        const subjects = [];
        for (const def of definitions) {
          const subject = await tx.subject.upsert({ where: { code: "DEMO_" + def.code }, create: { code: "DEMO_" + def.code, name: "DEMO · " + def.name, departmentId: department.id }, update: {} });
          const assignment = await tx.cohortSubject.upsert({ where: { cohortId_subjectId: { cohortId: cohort.id, subjectId: subject.id } }, create: { cohortId: cohort.id, subjectId: subject.id, maxMarks: def.max, passMarks: def.max * 0.4, studyStreamCode: def.stream }, update: {} });
          subjects.push(await tx.examSubject.create({ data: { examId, cohortSubjectId: assignment.id, markingTutorId:assignment.tutorId, name: "DEMO · " + def.name, maxMarks: def.max, passMarks: def.max * 0.4, studyStreamCode: def.stream } }));
        }
        for (const [row, enrollment] of cohort.studentEnrollments.entries()) {
          const candidate = await tx.examCandidate.create({ data: { examId, enrollmentId: enrollment.id, fullName: enrollment.student.fullName, studentNumber: enrollment.student.studentNumber, studyStreamCode: enrollment.studyStream?.code ?? null } });
          const marks = subjects.flatMap((subject, col) => {
            if (subject.studyStreamCode && subject.studyStreamCode !== candidate.studyStreamCode) return [];
            if (status === "DRAFT" && (row + col) % 5 === 0) return [];
            const markStatus = row % 13 === 3 && col === 1 ? "ABSENT" as const : row % 17 === 5 && col === 3 ? "NOT_APPLICABLE" as const : "SCORED" as const;
            const percentage = [95, 85, 75, 65, 55, 45, 25][row % 7] + ((col + index) % 3);
            return [{ examId, candidateId: candidate.id, examSubjectId: subject.id, status: markStatus, score: markStatus === "SCORED" ? Math.round(subject.maxMarks * percentage) / 100 : null }];
          });
          if (status !== "DRAFT" && examResult(subjects, marks, candidate.studyStreamCode).missing) throw new Error("Incomplete final demo results");
          await tx.examMark.createMany({ data: marks });
        }
        await tx.auditLog.create({ data: { action: "SEED_DEMO_EXAM", entityType: "Exam", entityId: examId, details: { demo: true, version: 1, note: "Synthetic preview marks; not official student results." } } });
      }, { timeout: 60000 });
      created++;
    }
  }
  const exams = await prisma.exam.findMany({ where: { id: { in: cohorts.flatMap(c => ["DRAFT", "FINAL", "LOCKED"].map(s => demoId(c.id + s))) } }, include: { subjects: true, candidates: { include: { marks: true } } } });
  for (const exam of exams) for (const candidate of exam.candidates) {
    if (exam.status !== "DRAFT" && examResult(exam.subjects, candidate.marks, candidate.studyStreamCode).missing) throw new Error("Incomplete final result: " + exam.id);
    for (const mark of candidate.marks) {
      const subject = exam.subjects.find(s => s.id === mark.examSubjectId)!;
      if (mark.status === "SCORED" && (mark.score === null || mark.score < 0 || mark.score > subject.maxMarks)) throw new Error("Invalid demo score");
    }
  }
  console.log(JSON.stringify({ year: year.name, created, skipped, exams: exams.length,
    candidates: exams.reduce((n, e) => n + e.candidates.length, 0),
    marks: exams.reduce((n, e) => n + e.candidates.reduce((m, c) => m + c.marks.length, 0), 0),
    preview: "/dashboard/exams?year=" + year.id }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
