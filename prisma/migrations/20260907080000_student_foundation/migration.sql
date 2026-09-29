-- CreateTable
CREATE TABLE `StudentNumberSequence` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` VARCHAR(191) NOT NULL,
    `sequenceId` BIGINT NOT NULL,
    `studentNumber` VARCHAR(20) NOT NULL,
    `fullName` VARCHAR(160) NOT NULL,
    `dateOfBirth` DATE NULL,
    `photoUrl` VARCHAR(500) NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Student_sequenceId_key`(`sequenceId`),
    UNIQUE INDEX `Student_studentNumber_key`(`studentNumber`),
    INDEX `Student_fullName_idx`(`fullName`),
    INDEX `Student_isArchived_idx`(`isArchived`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentGuardian` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(160) NULL,
    `relationship` VARCHAR(40) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentGuardian_studentId_idx`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentContact` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `guardianId` VARCHAR(191) NULL,
    `rawValue` VARCHAR(255) NOT NULL,
    `normalizedPhone` VARCHAR(32) NULL,
    `label` VARCHAR(40) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `verificationStatus` ENUM('UNVERIFIED', 'NEEDS_REVIEW', 'VERIFIED') NOT NULL DEFAULT 'UNVERIFIED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentContact_normalizedPhone_idx`(`normalizedPhone`),
    INDEX `StudentContact_guardianId_idx`(`guardianId`),
    UNIQUE INDEX `StudentContact_studentId_sortOrder_key`(`studentId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `House` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `House_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentEnrollment` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `academicYearId` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(191) NOT NULL,
    `studyStreamId` VARCHAR(191) NULL,
    `houseId` VARCHAR(191) NULL,
    `rollNumber` VARCHAR(40) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'WITHDRAWN', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentEnrollment_academicYearId_cohortId_status_idx`(`academicYearId`, `cohortId`, `status`),
    INDEX `StudentEnrollment_academicYearId_houseId_idx`(`academicYearId`, `houseId`),
    INDEX `StudentEnrollment_studyStreamId_idx`(`studyStreamId`),
    UNIQUE INDEX `StudentEnrollment_studentId_academicYearId_key`(`studentId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentImportBatch` (
    `id` VARCHAR(191) NOT NULL,
    `sourceSpreadsheetId` VARCHAR(191) NOT NULL,
    `sourceChecksum` CHAR(64) NOT NULL,
    `mappingVersion` VARCHAR(40) NOT NULL,
    `academicYearId` VARCHAR(191) NOT NULL,
    `operatorId` VARCHAR(191) NULL,
    `status` ENUM('RUNNING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'RUNNING',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `errorMessage` TEXT NULL,

    INDEX `StudentImportBatch_operatorId_startedAt_idx`(`operatorId`, `startedAt`),
    UNIQUE INDEX `StudentImportBatch_sourceSpreadsheetId_sourceChecksum_academ_key`(`sourceSpreadsheetId`, `sourceChecksum`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentImportRow` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `sheetName` VARCHAR(100) NOT NULL,
    `rowNumber` INTEGER NOT NULL,
    `sourceFingerprint` CHAR(64) NOT NULL,
    `studentId` VARCHAR(191) NULL,
    `result` ENUM('CREATED', 'SKIPPED', 'FAILED') NOT NULL,
    `message` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StudentImportRow_studentId_idx`(`studentId`),
    UNIQUE INDEX `StudentImportRow_batchId_sheetName_rowNumber_key`(`batchId`, `sheetName`, `rowNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `AcademicCohort_id_academicYearId_key` ON `AcademicCohort`(`id`, `academicYearId`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_sequenceId_fkey` FOREIGN KEY (`sequenceId`) REFERENCES `StudentNumberSequence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentGuardian` ADD CONSTRAINT `StudentGuardian_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentContact` ADD CONSTRAINT `StudentContact_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentContact` ADD CONSTRAINT `StudentContact_guardianId_fkey` FOREIGN KEY (`guardianId`) REFERENCES `StudentGuardian`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentEnrollment` ADD CONSTRAINT `StudentEnrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentEnrollment` ADD CONSTRAINT `StudentEnrollment_cohortId_academicYearId_fkey` FOREIGN KEY (`cohortId`, `academicYearId`) REFERENCES `AcademicCohort`(`id`, `academicYearId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentEnrollment` ADD CONSTRAINT `StudentEnrollment_studyStreamId_fkey` FOREIGN KEY (`studyStreamId`) REFERENCES `Stream`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentEnrollment` ADD CONSTRAINT `StudentEnrollment_houseId_fkey` FOREIGN KEY (`houseId`) REFERENCES `House`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentImportBatch` ADD CONSTRAINT `StudentImportBatch_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentImportBatch` ADD CONSTRAINT `StudentImportBatch_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentImportRow` ADD CONSTRAINT `StudentImportRow_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `StudentImportBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentImportRow` ADD CONSTRAINT `StudentImportRow_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
