"use server";
import { prisma } from "@/lib/prisma";
import {
  actionUser,
  runAction,
  field,
  id,
  dateValue,
  type ActionState,
} from "@/lib/school-actions";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
const name = (data: FormData, key: string) =>
  z.string().trim().min(2).max(160).parse(field(data, key));
async function audit(
  tx: Prisma.TransactionClient,
  actorId: string,
  entityId: string,
  action: string,
) {
  await tx.auditLog.create({
    data: { actorId, entityType: "Student", entityId, action },
  });
}
async function cohortDetails(data: FormData) {
  const cohort = await prisma.academicCohort.findUnique({
    where: { id: id(data, "cohortId") },
    include: { academicYear: true, stream: true },
  });
  if (!cohort || cohort.isArchived || cohort.academicYear.isArchived)
    throw new Error("Select an available cohort.");
  const houseId = field(data, "houseId") || null;
  if (
    houseId &&
    !(await prisma.house.findFirst({
      where: { id: houseId, isArchived: false },
    }))
  )
    throw new Error("Select an available house.");
  const streamId = field(data, "studyStreamId") || cohort.streamId;
  if (streamId) {
    const stream = await prisma.stream.findFirst({
      where: { id: streamId, isArchived: false },
    });
    if (
      !stream ||
      (cohort.stream?.code !== "SCIENCE" && stream.id !== cohort.streamId) ||
      (cohort.stream?.code === "SCIENCE" &&
        !["SCIENCE", "COMPUTER_SCIENCE", "BIOLOGY_SCIENCE"].includes(
          stream.code,
        ))
    )
      throw new Error("Study stream does not match the selected cohort.");
  }
  return { cohort, houseId, streamId };
}
export async function saveStudent(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true);
    const studentId = field(data, "studentId");
    const fullName = name(data, "fullName");
    const dateOfBirth = dateValue(field(data, "dateOfBirth"), true);
    if (dateOfBirth && dateOfBirth > new Date())
      throw new Error("Date of birth cannot be in the future.");
    const photoUrl = field(data, "photoUrl") || null;
    if (photoUrl && (!/^https:\/\//.test(photoUrl) || photoUrl.length > 500))
      throw new Error("Use an HTTPS photo URL of at most 500 characters.");
    const details = studentId ? null : await cohortDetails(data);
    await prisma.$transaction(async (tx) => {
      if (studentId) {
        const result = await tx.student.updateMany({
          where: {
            id: studentId,
            updatedAt: new Date(field(data, "updatedAt")),
          },
          data: { fullName, dateOfBirth, photoUrl },
        });
        if (!result.count)
          throw new Error("This profile changed. Refresh before saving.");
        await audit(tx, actor.id, studentId, "UPDATE_PROFILE");
      } else {
        const sequence = await tx.studentNumberSequence.create({ data: {} });
        const student = await tx.student.create({
          data: {
            sequenceId: sequence.id,
            studentNumber: "DWS-" + sequence.id.toString().padStart(6, "0"),
            fullName,
            dateOfBirth,
            photoUrl,
          },
        });
        await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            academicYearId: details!.cohort.academicYearId,
            cohortId: details!.cohort.id,
            houseId: details!.houseId,
            studyStreamId: details!.streamId,
          },
        });
        const parent = field(data, "parentName");
        if (parent)
          await tx.studentGuardian.create({
            data: {
              studentId: student.id,
              fullName: z.string().max(160).parse(parent),
            },
          });
        const mobile = field(data, "mobile");
        if (mobile)
          await tx.studentContact.create({
            data: {
              studentId: student.id,
              rawValue: z.string().max(255).parse(mobile),
              verificationStatus: "UNVERIFIED",
            },
          });
        await audit(tx, actor.id, student.id, "CREATE");
      }
    });
    return studentId
      ? "Student profile saved."
      : "Student created with a permanent ID and enrollment.";
  });
}
export async function saveEnrollment(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true);
    const enrollmentId = id(data, "enrollmentId");
    const { cohort, houseId, streamId } = await cohortDetails(data);
    const status = z
      .enum(["ACTIVE", "INACTIVE", "WITHDRAWN", "COMPLETED"])
      .parse(field(data, "status"));
    const rollNumber =
      z.string().max(40).parse(field(data, "rollNumber")) || null;
    await prisma.$transaction(async (tx) => {
      const original = await tx.studentEnrollment.findUniqueOrThrow({
        where: { id: enrollmentId },
      });
      if (cohort.academicYearId !== original.academicYearId)
        throw new Error("Use promotion to enroll in a different year.");
      const updated = await tx.studentEnrollment.updateMany({
        where: {
          id: enrollmentId,
          updatedAt: new Date(field(data, "updatedAt")),
        },
        data: {
          cohortId: cohort.id,
          studyStreamId: streamId,
          houseId,
          rollNumber,
          status,
        },
      });
      if (!updated.count)
        throw new Error("Enrollment changed. Refresh before saving.");
      await audit(tx, actor.id, original.studentId, "UPDATE_ENROLLMENT");
    });
    return "Yearly enrollment saved.";
  });
}
export async function saveGuardian(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true);
    const studentId = id(data, "studentId"),
      guardianId = field(data, "guardianId");
    const fullName = name(data, "fullName");
    const relationship =
      z
        .enum(["", "FATHER", "MOTHER", "GUARDIAN", "OTHER"])
        .parse(field(data, "relationship")) || null;
    await prisma.$transaction(async (tx) => {
      if (guardianId) {
        const updated = await tx.studentGuardian.updateMany({
          where: {
            id: guardianId,
            studentId,
            updatedAt: new Date(field(data, "updatedAt")),
          },
          data: { fullName, relationship },
        });
        if (!updated.count)
          throw new Error(
            "Guardian changed or is unavailable. Refresh before editing.",
          );
      } else
        await tx.studentGuardian.create({
          data: { studentId, fullName, relationship },
        });
      await audit(tx, actor.id, studentId, "SAVE_GUARDIAN");
    });
    return "Guardian saved.";
  });
}
export async function saveContact(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true);
    const studentId = id(data, "studentId"),
      contactId = field(data, "contactId");
    const rawValue = z.string().min(1).max(255).parse(field(data, "rawValue"));
    const normalizedPhone = field(data, "normalizedPhone") || null;
    if (normalizedPhone && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone))
      throw new Error("Use international phone format, such as +919876543210.");
    const verificationStatus = z
      .enum(["UNVERIFIED", "NEEDS_REVIEW", "VERIFIED"])
      .parse(field(data, "verificationStatus"));
    if (verificationStatus === "VERIFIED" && !normalizedPhone)
      throw new Error(
        "Enter an international number before marking a contact verified.",
      );
    const label = z.string().max(40).parse(field(data, "label")) || null,
      guardianId = field(data, "guardianId") || null;
    await prisma.$transaction(async (tx) => {
      // Lock the student row before allocating the contact order.
      await tx.student.update({
        where: { id: studentId },
        data: { updatedAt: new Date() },
      });
      if (
        guardianId &&
        !(await tx.studentGuardian.findFirst({
          where: { id: guardianId, studentId },
        }))
      )
        throw new Error("Guardian does not belong to this student.");
      const payload = {
        rawValue,
        normalizedPhone,
        verificationStatus,
        label,
        guardianId,
      };
      if (contactId) {
        const updated = await tx.studentContact.updateMany({
          where: {
            id: contactId,
            studentId,
            updatedAt: new Date(field(data, "updatedAt")),
          },
          data: payload,
        });
        if (!updated.count)
          throw new Error(
            "Contact changed or is unavailable. Refresh before editing.",
          );
      } else {
        const last = await tx.studentContact.aggregate({
          where: { studentId },
          _max: { sortOrder: true },
        });
        await tx.studentContact.create({
          data: {
            studentId,
            ...payload,
            sortOrder: (last._max.sortOrder ?? -1) + 1,
          },
        });
      }
      await audit(tx, actor.id, studentId, "SAVE_CONTACT");
    });
    return "Contact saved.";
  });
}
export async function archiveStudent(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true),
      studentId = id(data, "studentId");
    const archived = field(data, "archived") === "1";
    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: { isArchived: archived },
      });
      await audit(tx, actor.id, studentId, archived ? "ARCHIVE" : "RESTORE");
    });
    return archived
      ? "Student archived. Academic history is preserved."
      : "Student restored.";
  });
}
export async function promoteStudents(_state: ActionState, data: FormData) {
  return runAction(async () => {
    const actor = await actionUser(true);
    const enrollmentIds = z
      .array(z.string().cuid())
      .min(1, "Select at least one student.")
      .max(100)
      .parse(data.getAll("enrollmentIds"));
    if (new Set(enrollmentIds).size !== enrollmentIds.length)
      throw new Error("Duplicate selections.");
    const target = await prisma.academicCohort.findUnique({
      where: { id: id(data, "targetCohortId") },
      include: { academicYear: true, stream: true, classLevel: true },
    });
    if (!target || target.isArchived || target.academicYear.isArchived)
      throw new Error("Select a valid target cohort.");
    await prisma.$transaction(
      async (tx) => {
        const source = await tx.studentEnrollment.findMany({
          where: {
            id: { in: enrollmentIds },
            status: "ACTIVE",
            student: { isArchived: false },
          },
          include: {
            cohort: { include: { academicYear: true, classLevel: true } },
            studyStream: true,
          },
        });
        if (source.length !== enrollmentIds.length)
          throw new Error("Only active, unarchived students can be promoted.");
        if (new Set(source.map((e) => e.cohortId)).size !== 1)
          throw new Error("Filter to one source cohort before promotion.");
        for (const enrollment of source) {
          if (
            target.academicYear.startDate <=
              enrollment.cohort.academicYear.startDate ||
            target.classLevel.sortOrder <=
              enrollment.cohort.classLevel.sortOrder
          )
            throw new Error("Choose a later academic year and a higher class.");
          if (
            target.stream &&
            target.stream.code !== "SCIENCE" &&
            enrollment.studyStream &&
            enrollment.studyStream.code !== "SCIENCE" &&
            enrollment.studyStreamId !== target.streamId
          )
            throw new Error(
              "The target stream differs from a selected student's stream.",
            );
          await tx.studentEnrollment.create({
            data: {
              studentId: enrollment.studentId,
              academicYearId: target.academicYearId,
              cohortId: target.id,
              studyStreamId:
                target.stream?.code === "SCIENCE"
                  ? (enrollment.studyStreamId ?? target.streamId)
                  : target.streamId,
              houseId:
                field(data, "keepHouse") === "on" ? enrollment.houseId : null,
            },
          });
          const result = await tx.studentEnrollment.updateMany({
            where: { id: enrollment.id, status: "ACTIVE" },
            data: { status: "COMPLETED" },
          });
          if (!result.count)
            throw new Error("An enrollment changed. Refresh and retry.");
          await audit(tx, actor.id, enrollment.studentId, "PROMOTE");
        }
      },
      { timeout: 15000 },
    );
    return (
      "Promoted " +
      enrollmentIds.length +
      " students; previous-year records are preserved."
    );
  });
}
