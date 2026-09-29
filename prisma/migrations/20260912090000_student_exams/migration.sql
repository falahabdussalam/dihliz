-- CreateTable
CREATE TABLE `Subject` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Subject_code_key`(`code`),
    INDEX `Subject_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CohortSubject` (
    `id` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `tutorId` VARCHAR(191) NULL,
    `studyStreamCode` VARCHAR(40) NULL,
    `maxMarks` DOUBLE NOT NULL DEFAULT 100,
    `passMarks` DOUBLE NOT NULL DEFAULT 40,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,

    INDEX `CohortSubject_tutorId_idx`(`tutorId`),
    UNIQUE INDEX `CohortSubject_cohortId_subjectId_key`(`cohortId`, `subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exam` (
    `id` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `date` DATE NOT NULL,
    `status` ENUM('DRAFT', 'FINAL', 'LOCKED') NOT NULL DEFAULT 'DRAFT',
    `revision` INTEGER NOT NULL DEFAULT 0,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Exam_cohortId_isArchived_date_idx`(`cohortId`, `isArchived`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamSubject` (
    `id` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `cohortSubjectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `maxMarks` DOUBLE NOT NULL,
    `passMarks` DOUBLE NOT NULL,
    `studyStreamCode` VARCHAR(40) NULL,

    UNIQUE INDEX `ExamSubject_examId_cohortSubjectId_key`(`examId`, `cohortSubjectId`),
    UNIQUE INDEX `ExamSubject_id_examId_key`(`id`, `examId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamCandidate` (
    `id` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `enrollmentId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(160) NOT NULL,
    `studentNumber` VARCHAR(20) NOT NULL,
    `studyStreamCode` VARCHAR(40) NULL,

    UNIQUE INDEX `ExamCandidate_examId_enrollmentId_key`(`examId`, `enrollmentId`),
    UNIQUE INDEX `ExamCandidate_id_examId_key`(`id`, `examId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamMark` (
    `id` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `examSubjectId` VARCHAR(191) NOT NULL,
    `status` ENUM('SCORED', 'ABSENT', 'NOT_APPLICABLE') NOT NULL,
    `score` DOUBLE NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ExamMark_examSubjectId_examId_idx`(`examSubjectId`, `examId`),
    UNIQUE INDEX `ExamMark_candidateId_examSubjectId_key`(`candidateId`, `examSubjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CohortSubject` ADD CONSTRAINT `CohortSubject_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `AcademicCohort`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CohortSubject` ADD CONSTRAINT `CohortSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CohortSubject` ADD CONSTRAINT `CohortSubject_tutorId_fkey` FOREIGN KEY (`tutorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `AcademicCohort`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamSubject` ADD CONSTRAINT `ExamSubject_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamSubject` ADD CONSTRAINT `ExamSubject_cohortSubjectId_fkey` FOREIGN KEY (`cohortSubjectId`) REFERENCES `CohortSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamCandidate` ADD CONSTRAINT `ExamCandidate_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamCandidate` ADD CONSTRAINT `ExamCandidate_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `StudentEnrollment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamMark` ADD CONSTRAINT `ExamMark_candidateId_examId_fkey` FOREIGN KEY (`candidateId`, `examId`) REFERENCES `ExamCandidate`(`id`, `examId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamMark` ADD CONSTRAINT `ExamMark_examSubjectId_examId_fkey` FOREIGN KEY (`examSubjectId`, `examId`) REFERENCES `ExamSubject`(`id`, `examId`) ON DELETE RESTRICT ON UPDATE CASCADE;
