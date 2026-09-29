import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/enums";

export const SESSION_COOKIE = "dihliz_session";
const SESSION_DAYS = 7;

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions(expires: Date) {
  return { path: "/", httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", expires };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.set(SESSION_COOKIE, "", { ...cookieOptions(new Date(0)), maxAge: 0 });
}

async function resolveSession(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    fullName: session.user.fullName,
    role: session.user.role,
  };
}

export function getApiUser(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(SESSION_COOKIE + "="))?.slice(SESSION_COOKIE.length + 1);
  return resolveSession(token);
}

export const getPageUser = cache(async () => {
  return resolveSession((await cookies()).get(SESSION_COOKIE)?.value);
});

export async function requirePageUser(pathname: string) {
  const user = await getPageUser();
  if (!user) redirect("/login?next=" + encodeURIComponent(pathname));
  return user;
}
