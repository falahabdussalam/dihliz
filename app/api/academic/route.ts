import { z } from "zod";
import { getApiUser } from "@/lib/auth";
import { canManageAcademicSetup } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const academicYearSchema = z.object({
  action: z.literal("createYear"),
  name: z.string().trim().min(4).max(20),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  makeActive: z.boolean().default(false),
});

const setActiveSchema = z.object({
  action: z.literal("setActiveYear"),
  id: z.string().cuid(),
});

const cohortSchema = z.object({
  action: z.literal("createCohort"),
  academicYearId: z.string().cuid(),
  code: z.string().trim().min(1).max(60).transform((value) => value.toUpperCase().replace(/\s+/g, "-")),
  displayName: z.string().trim().min(1).max(100),
  classLevelId: z.string().cuid(),
  divisionId: z.string().cuid().nullable().optional(),
  streamId: z.string().cuid().nullable().optional(),
});

const payloadSchema = z.discriminatedUnion("action", [
  academicYearSchema,
  setActiveSchema,
  cohortSchema,
]);

export async function POST(request: Request) {

  const user = await getApiUser(request);
  if (!user) return Response.json({ message: "Please sign in again." }, { status: 401 });
  if (!canManageAcademicSetup(user.role)) {
    return Response.json({ message: "You do not have permission to manage academic setup." }, { status: 403 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  try {
    if (parsed.data.action === "createYear") {
      const data = parsed.data;
      if (data.endDate <= data.startDate) {
        return Response.json({ message: "End date must be after start date." }, { status: 400 });
      }
      const year = await prisma.$transaction(async (transaction) => {
        if (data.makeActive) {
          await transaction.academicYear.updateMany({ data: { isActive: false } });
        }

        return transaction.academicYear.create({
          data: {
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: data.makeActive,
          },
        });
      });

      await prisma.auditLog.create({
        data: { actorId: user.id, action: "CREATE", entityType: "AcademicYear", entityId: year.id },
      });
    }

    if (parsed.data.action === "setActiveYear") {
      await prisma.$transaction([
        prisma.academicYear.updateMany({ data: { isActive: false } }),
        prisma.academicYear.update({ where: { id: parsed.data.id }, data: { isActive: true, isArchived: false } }),
      ]);

      await prisma.auditLog.create({
        data: { actorId: user.id, action: "SET_ACTIVE", entityType: "AcademicYear", entityId: parsed.data.id },
      });
    }

    if (parsed.data.action === "createCohort") {
      const cohort = await prisma.academicCohort.create({
        data: {
          academicYearId: parsed.data.academicYearId,
          code: parsed.data.code,
          displayName: parsed.data.displayName,
          classLevelId: parsed.data.classLevelId,
          divisionId: parsed.data.divisionId || null,
          streamId: parsed.data.streamId || null,
        },
      });

      await prisma.auditLog.create({
        data: { actorId: user.id, action: "CREATE", entityType: "AcademicCohort", entityId: cohort.id },
      });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Unique constraint")
      ? "A record with these details already exists."
      : "Unable to save the academic setup.";
    return Response.json({ message }, { status: 400 });
  }
}
