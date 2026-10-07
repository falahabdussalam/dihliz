-- CreateEnum
CREATE TYPE "RegisterStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'LOCKED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'OFF');

-- CreateEnum
CREATE TYPE "PerformanceCategory" AS ENUM ('CLASS_BEHAVIOUR', 'STUDY_DISCIPLINE', 'HOSTEL_BEHAVIOUR');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "eventId" TEXT;

-- CreateTable
CREATE TABLE "Examination" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Examination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRegister" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "RegisterStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceEntry" (
    "id" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "fullName" VARCHAR(160) NOT NULL,
    "studentNumber" VARCHAR(20) NOT NULL,
    "status" "AttendanceStatus",
    "reason" VARCHAR(500),

    CONSTRAINT "AttendanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceCriterion" (
    "id" TEXT NOT NULL,
    "category" "PerformanceCategory" NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "maximum" DOUBLE PRECISION NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceRegister" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "category" "PerformanceCategory" NOT NULL,
    "criteria" JSONB NOT NULL,
    "status" "RegisterStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceEntry" (
    "id" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "fullName" VARCHAR(160) NOT NULL,
    "studentNumber" VARCHAR(20) NOT NULL,
    "scores" JSONB NOT NULL,
    "remarks" VARCHAR(1000),

    CONSTRAINT "PerformanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "kind" VARCHAR(40) NOT NULL,
    "date" DATE NOT NULL,
    "organiser" VARCHAR(160),
    "award" VARCHAR(120),
    "remarks" VARCHAR(1000),
    "evidenceUrl" VARCHAR(500),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSnapshot" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "kind" VARCHAR(40) NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportDownload" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Examination_academicYearId_isDemo_idx" ON "Examination"("academicYearId", "isDemo");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRegister_cohortId_date_key" ON "AttendanceRegister"("cohortId", "date");

-- CreateIndex
CREATE INDEX "AttendanceEntry_enrollmentId_idx" ON "AttendanceEntry"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceEntry_registerId_enrollmentId_key" ON "AttendanceEntry"("registerId", "enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceCriterion_category_code_version_key" ON "PerformanceCriterion"("category", "code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceRegister_cohortId_month_category_key" ON "PerformanceRegister"("cohortId", "month", "category");

-- CreateIndex
CREATE INDEX "PerformanceEntry_enrollmentId_idx" ON "PerformanceEntry"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceEntry_registerId_enrollmentId_key" ON "PerformanceEntry"("registerId", "enrollmentId");

-- CreateIndex
CREATE INDEX "Achievement_enrollmentId_isArchived_date_idx" ON "Achievement"("enrollmentId", "isArchived", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ReportSnapshot_enrollmentId_kind_version_key" ON "ReportSnapshot"("enrollmentId", "kind", "version");

-- CreateIndex
CREATE INDEX "ReportDownload_reportId_createdAt_idx" ON "ReportDownload"("reportId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_eventId_cohortId_key" ON "Exam"("eventId", "cohortId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Examination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examination" ADD CONSTRAINT "Examination_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRegister" ADD CONSTRAINT "AttendanceRegister_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "AcademicCohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceEntry" ADD CONSTRAINT "AttendanceEntry_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "AttendanceRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceEntry" ADD CONSTRAINT "AttendanceEntry_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceRegister" ADD CONSTRAINT "PerformanceRegister_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "AcademicCohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEntry" ADD CONSTRAINT "PerformanceEntry_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "PerformanceRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEntry" ADD CONSTRAINT "PerformanceEntry_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSnapshot" ADD CONSTRAINT "ReportSnapshot_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportDownload" ADD CONSTRAINT "ReportDownload_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ReportSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- One parent per historical class exam. Titles are deliberately not merged.
INSERT INTO "Examination" ("id","academicYearId","title","isDemo","createdAt")
SELECT 'c' || substr(md5('examination:' || e."id"),1,24), c."academicYearId", e."title", upper(e."title") LIKE 'DEMO%', e."createdAt"
FROM "Exam" e JOIN "AcademicCohort" c ON c."id"=e."cohortId" WHERE e."eventId" IS NULL;
UPDATE "Exam" SET "eventId"='c' || substr(md5('examination:' || "id"),1,24) WHERE "eventId" IS NULL;
ALTER TABLE "PerformanceCriterion" ADD CONSTRAINT "criterion_maximum_range" CHECK ("maximum" BETWEEN 1 AND 10);
INSERT INTO "PerformanceCriterion" ("id","category","code","name","maximum","version","isArchived") VALUES ('c' || substr(md5('CLASS_BEHAVIOUR:PARTICIPATION'),1,24),'CLASS_BEHAVIOUR','PARTICIPATION','Participation',10,1,false);
INSERT INTO "PerformanceCriterion" ("id","category","code","name","maximum","version","isArchived") VALUES ('c' || substr(md5('CLASS_BEHAVIOUR:RESPECT'),1,24),'CLASS_BEHAVIOUR','RESPECT','Respect',10,1,false);
INSERT INTO "PerformanceCriterion" ("id","category","code","name","maximum","version","isArchived") VALUES ('c' || substr(md5('STUDY_DISCIPLINE:DOUBT_ASKING'),1,24),'STUDY_DISCIPLINE','DOUBT_ASKING','Doubt-asking habit',10,1,false);
INSERT INTO "PerformanceCriterion" ("id","category","code","name","maximum","version","isArchived") VALUES ('c' || substr(md5('STUDY_DISCIPLINE:DISCIPLINE'),1,24),'STUDY_DISCIPLINE','DISCIPLINE','Study discipline',10,1,false);
INSERT INTO "PerformanceCriterion" ("id","category","code","name","maximum","version","isArchived") VALUES ('c' || substr(md5('HOSTEL_BEHAVIOUR:HYGIENE'),1,24),'HOSTEL_BEHAVIOUR','HYGIENE','Health and hygiene',10,1,false);
INSERT INTO "PerformanceCriterion" ("id","category","code","name","maximum","version","isArchived") VALUES ('c' || substr(md5('HOSTEL_BEHAVIOUR:RESPECT'),1,24),'HOSTEL_BEHAVIOUR','RESPECT','Respect',10,1,false);
