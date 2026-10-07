import { compare } from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "Enter a valid email and password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const validPassword = user ? await compare(parsed.data.password, user.passwordHash) : false;

  if (!user || !validPassword || !user.isActive) {
    return Response.json({ message: "Invalid email or password." }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.session.deleteMany({
      where: { userId: user.id, expiresAt: { lte: new Date() } },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  await createSession(user.id);

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
    },
  });

  return Response.json({ ok: true }, { status: 200 });
}
