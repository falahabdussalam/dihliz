-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'FINAL', 'LOCKED');

-- CreateEnum
CREATE TYPE "MarkStatus" AS ENUM ('SCORED', 'ABSENT', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'DEPARTMENT_HEAD', 'CLASS_MENTOR', 'HOSTEL_MENTOR', 'SUBJECT_TUTOR');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'WITHDRAWN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ContactVerificationStatus" AS ENUM ('UNVERIFIED', 'NEEDS_REVIEW', 'VERIFIED');

-- CreateEnum
CREATE TYPE "StudentImportStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "StudentImportRowResult" AS ENUM ('CREATED', 'SKIPPED', 'FAILED');

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "departmentId" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortSubject" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "tutorId" TEXT,
    "studyStreamCode" VARCHAR(40),
    "maxMarks" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "passMarks" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CohortSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "date" DATE NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubject" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "cohortSubjectId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL,
    "passMarks" DOUBLE PRECISION NOT NULL,
    "studyStreamCode" VARCHAR(40),

    CONSTRAINT "ExamSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamCandidate" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "fullName" VARCHAR(160) NOT NULL,
    "studentNumber" VARCHAR(20) NOT NULL,
    "studyStreamCode" VARCHAR(40),

    CONSTRAINT "ExamCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamMark" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "examSubjectId" TEXT NOT NULL,
    "status" "MarkStatus" NOT NULL,
    "score" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" VARCHAR(80) NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" VARCHAR(191),
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassLevel" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicCohort" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classLevelId" TEXT NOT NULL,
    "divisionId" TEXT,
    "streamId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentNumberSequence" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentNumberSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "sequenceId" BIGINT NOT NULL,
    "studentNumber" VARCHAR(20) NOT NULL,
    "fullName" VARCHAR(160) NOT NULL,
    "dateOfBirth" DATE,
    "photoUrl" VARCHAR(500),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGuardian" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fullName" VARCHAR(160),
    "relationship" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentContact" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT,
    "rawValue" VARCHAR(255) NOT NULL,
    "normalizedPhone" VARCHAR(32),
    "label" VARCHAR(40),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "verificationStatus" "ContactVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEnrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "studyStreamId" TEXT,
    "houseId" TEXT,
    "rollNumber" VARCHAR(40),
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentImportBatch" (
    "id" TEXT NOT NULL,
    "sourceSpreadsheetId" VARCHAR(191) NOT NULL,
    "sourceChecksum" CHAR(64) NOT NULL,
    "mappingVersion" VARCHAR(40) NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "operatorId" TEXT,
    "status" "StudentImportStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "StudentImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "sheetName" VARCHAR(100) NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "sourceFingerprint" CHAR(64) NOT NULL,
    "studentId" TEXT,
    "result" "StudentImportRowResult" NOT NULL,
    "message" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "cohortId" TEXT,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "Subject_departmentId_idx" ON "Subject"("departmentId");

-- CreateIndex
CREATE INDEX "CohortSubject_tutorId_idx" ON "CohortSubject"("tutorId");

-- CreateIndex
CREATE UNIQUE INDEX "CohortSubject_cohortId_subjectId_key" ON "CohortSubject"("cohortId", "subjectId");

-- CreateIndex
CREATE INDEX "Exam_cohortId_isArchived_date_idx" ON "Exam"("cohortId", "isArchived", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubject_examId_cohortSubjectId_key" ON "ExamSubject"("examId", "cohortSubjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubject_id_examId_key" ON "ExamSubject"("id", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamCandidate_examId_enrollmentId_key" ON "ExamCandidate"("examId", "enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamCandidate_id_examId_key" ON "ExamCandidate"("id", "examId");

-- CreateIndex
CREATE INDEX "ExamMark_examSubjectId_examId_idx" ON "ExamMark"("examSubjectId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamMark_candidateId_examSubjectId_key" ON "ExamMark"("candidateId", "examSubjectId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_name_key" ON "AcademicYear"("name");

-- CreateIndex
CREATE INDEX "AcademicYear_isActive_isArchived_idx" ON "AcademicYear"("isActive", "isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "ClassLevel_code_key" ON "ClassLevel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ClassLevel_sortOrder_key" ON "ClassLevel"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Division_code_key" ON "Division"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_code_key" ON "Stream"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "AcademicCohort_academicYearId_classLevelId_isArchived_idx" ON "AcademicCohort"("academicYearId", "classLevelId", "isArchived");

-- CreateIndex
CREATE INDEX "AcademicCohort_divisionId_idx" ON "AcademicCohort"("divisionId");

-- CreateIndex
CREATE INDEX "AcademicCohort_streamId_idx" ON "AcademicCohort"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCohort_academicYearId_code_key" ON "AcademicCohort"("academicYearId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCohort_id_academicYearId_key" ON "AcademicCohort"("id", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_sequenceId_key" ON "Student"("sequenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");

-- CreateIndex
CREATE INDEX "Student_fullName_idx" ON "Student"("fullName");

-- CreateIndex
CREATE INDEX "Student_isArchived_idx" ON "Student"("isArchived");

-- CreateIndex
CREATE INDEX "StudentGuardian_studentId_idx" ON "StudentGuardian"("studentId");

-- CreateIndex
CREATE INDEX "StudentContact_normalizedPhone_idx" ON "StudentContact"("normalizedPhone");

-- CreateIndex
CREATE INDEX "StudentContact_guardianId_idx" ON "StudentContact"("guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentContact_studentId_sortOrder_key" ON "StudentContact"("studentId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "House_code_key" ON "House"("code");

-- CreateIndex
CREATE INDEX "StudentEnrollment_academicYearId_cohortId_status_idx" ON "StudentEnrollment"("academicYearId", "cohortId", "status");

-- CreateIndex
CREATE INDEX "StudentEnrollment_academicYearId_houseId_idx" ON "StudentEnrollment"("academicYearId", "houseId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_studyStreamId_idx" ON "StudentEnrollment"("studyStreamId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicYearId_key" ON "StudentEnrollment"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentImportBatch_operatorId_startedAt_idx" ON "StudentImportBatch"("operatorId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentImportBatch_sourceSpreadsheetId_sourceChecksum_acade_key" ON "StudentImportBatch"("sourceSpreadsheetId", "sourceChecksum", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentImportRow_studentId_idx" ON "StudentImportRow"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentImportRow_batchId_sheetName_rowNumber_key" ON "StudentImportRow"("batchId", "sheetName", "rowNumber");

-- CreateIndex
CREATE INDEX "StaffAssignment_userId_academicYearId_idx" ON "StaffAssignment"("userId", "academicYearId");

-- CreateIndex
CREATE INDEX "StaffAssignment_cohortId_role_idx" ON "StaffAssignment"("cohortId", "role");

-- CreateIndex
CREATE INDEX "StaffAssignment_departmentId_role_idx" ON "StaffAssignment"("departmentId", "role");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortSubject" ADD CONSTRAINT "CohortSubject_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "AcademicCohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortSubject" ADD CONSTRAINT "CohortSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortSubject" ADD CONSTRAINT "CohortSubject_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "AcademicCohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubject" ADD CONSTRAINT "ExamSubject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubject" ADD CONSTRAINT "ExamSubject_cohortSubjectId_fkey" FOREIGN KEY ("cohortSubjectId") REFERENCES "CohortSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamCandidate" ADD CONSTRAINT "ExamCandidate_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamCandidate" ADD CONSTRAINT "ExamCandidate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamMark" ADD CONSTRAINT "ExamMark_candidateId_examId_fkey" FOREIGN KEY ("candidateId", "examId") REFERENCES "ExamCandidate"("id", "examId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamMark" ADD CONSTRAINT "ExamMark_examSubjectId_examId_fkey" FOREIGN KEY ("examSubjectId", "examId") REFERENCES "ExamSubject"("id", "examId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCohort" ADD CONSTRAINT "AcademicCohort_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCohort" ADD CONSTRAINT "AcademicCohort_classLevelId_fkey" FOREIGN KEY ("classLevelId") REFERENCES "ClassLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCohort" ADD CONSTRAINT "AcademicCohort_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCohort" ADD CONSTRAINT "AcademicCohort_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "StudentNumberSequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentContact" ADD CONSTRAINT "StudentContact_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentContact" ADD CONSTRAINT "StudentContact_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "StudentGuardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_cohortId_academicYearId_fkey" FOREIGN KEY ("cohortId", "academicYearId") REFERENCES "AcademicCohort"("id", "academicYearId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_studyStreamId_fkey" FOREIGN KEY ("studyStreamId") REFERENCES "Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentImportBatch" ADD CONSTRAINT "StudentImportBatch_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentImportBatch" ADD CONSTRAINT "StudentImportBatch_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentImportRow" ADD CONSTRAINT "StudentImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "StudentImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentImportRow" ADD CONSTRAINT "StudentImportRow_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "AcademicCohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
