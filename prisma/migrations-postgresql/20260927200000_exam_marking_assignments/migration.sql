ALTER TABLE "ExamSubject" ADD COLUMN "markingTutorId" TEXT;
UPDATE "ExamSubject" e SET "markingTutorId" = c."tutorId" FROM "CohortSubject" c WHERE e."cohortSubjectId"=c."id";
ALTER TABLE "ExamSubject" ADD CONSTRAINT "ExamSubject_markingTutorId_fkey" FOREIGN KEY ("markingTutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
