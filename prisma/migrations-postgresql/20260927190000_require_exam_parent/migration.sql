-- Close the staged migration after all application writers create a parent.
-- Defensive backfill covers any exam created during the additive rollout.
INSERT INTO "Examination" ("id","academicYearId","title","isDemo","createdAt")
SELECT 'c' || substr(md5('examination:' || e."id"),1,24), c."academicYearId", e."title", upper(e."title") LIKE 'DEMO%', e."createdAt"
FROM "Exam" e JOIN "AcademicCohort" c ON c."id"=e."cohortId" WHERE e."eventId" IS NULL;
UPDATE "Exam" SET "eventId"='c' || substr(md5('examination:' || "id"),1,24) WHERE "eventId" IS NULL;
ALTER TABLE "Exam" ALTER COLUMN "eventId" SET NOT NULL;
