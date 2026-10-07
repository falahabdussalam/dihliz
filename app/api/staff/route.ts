import { hash } from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@/generated/prisma/enums";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createStaffSchema = z.object({
  action: z.literal("create"),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  temporaryPassword: z.string().min(10).max(128),
  role: z.nativeEnum(UserRole).refine((role) => role !== UserRole.SUPER_ADMIN, {
    message: "Additional super administrators must be created through the secure administrator workflow.",
  }),
  academicYearId: z.string().cuid(),
  cohortId: z.string().cuid().nullable().optional(),
  departmentId: z.string().cuid().nullable().optional(),
});

const toggleSchema = z.object({
  action: z.literal("toggleActive"),
  id: z.string().cuid(),
  isActive: z.boolean(),
});

const payloadSchema = z.discriminatedUnion("action", [createStaffSchema, toggleSchema]);

export async function POST(request: Request) {

  const actor = await getApiUser(request);
  if (!actor) return Response.json({ message: "Please sign in again." }, { status: 401 });
  if (actor.role !== UserRole.SUPER_ADMIN) {
    return Response.json({ message: "Only a Super Admin can manage staff accounts." }, { status: 403 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message ?? "Invalid staff details." }, { status: 400 });
  }

  try {
    if (parsed.data.action === "create") {
      const data = parsed.data;
      const requiresDepartment = data.role === UserRole.DEPARTMENT_HEAD;
      const requiresCohort = data.role === UserRole.CLASS_MENTOR ||
        data.role === UserRole.HOSTEL_MENTOR ||
        data.role === UserRole.SUBJECT_TUTOR;

      if (requiresDepartment && !data.departmentId) {
        return Response.json({ message: "Select a department for the Department Head." }, { status: 400 });
      }
      if (requiresCohort && !data.cohortId) {
        return Response.json({ message: "Select a cohort for this staff role." }, { status: 400 });
      }

      const passwordHash = await hash(data.temporaryPassword, 12);
      const user = await prisma.$transaction(async (transaction) => {
        const created = await transaction.user.create({
          data: {
            fullName: data.fullName,
            email: data.email,
            passwordHash,
            role: data.role,
            mustChangePassword: true,
          },
        });

        await transaction.staffAssignment.create({
          data: {
            userId: created.id,
            academicYearId: data.academicYearId,
            role: data.role,
            cohortId: data.cohortId || null,
            departmentId: data.departmentId || null,
          },
        });

        return created;
      });

      await prisma.auditLog.create({
        data: {
          actorId: actor.id,
          action: "CREATE",
          entityType: "User",
          entityId: user.id,
          details: { role: user.role },
        },
      });
    }

    if (parsed.data.action === "toggleActive") {
      if (parsed.data.id === actor.id && !parsed.data.isActive) {
        return Response.json({ message: "You cannot deactivate your own account." }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: parsed.data.id },
        data: { isActive: parsed.data.isActive },
      });

      if (!parsed.data.isActive) {
        await prisma.session.deleteMany({ where: { userId: parsed.data.id } });
      }

      await prisma.auditLog.create({
        data: {
          actorId: actor.id,
          action: parsed.data.isActive ? "ACTIVATE" : "DEACTIVATE",
          entityType: "User",
          entityId: parsed.data.id,
        },
      });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Unique constraint")
      ? "A staff account already uses this email address."
      : "Unable to save the staff account.";
    return Response.json({ message }, { status: 400 });
  }
}
