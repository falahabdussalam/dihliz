import { getPageUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export type ActionState = { error?: string; success?: string };
export async function actionUser(admin = false) {
  const user = await getPageUser();
  if (!user) throw new Error("Please sign in again.");
  if (admin && user.role !== "SUPER_ADMIN")
    throw new Error("Only a Super Admin can make this change.");
  return user;
}
export const field = (data: FormData, key: string) =>
  String(data.get(key) ?? "").trim();
export const id = (data: FormData, key: string) =>
  z.string().cuid().parse(field(data, key));
export function dateValue(value: string, optional = false) {
  if (!value && optional) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Enter a valid date.");
  const date = new Date(value + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new Error("Enter a valid date.");
  return date;
}
export async function runAction(
  work: () => Promise<string>,
): Promise<ActionState> {
  try {
    const success = await work();
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/exams", "layout");
    return { success };
  } catch (error) {
    if (error instanceof z.ZodError)
      return { error: error.issues[0]?.message ?? "Invalid input." };
    const code = (error as { code?: string })?.code;
    if (code === "P2002")
      return { error: "A record with these details already exists." };
    if (code === "P2003" || code === "P2025")
      return {
        error: "A selected record is unavailable. Refresh and try again.",
      };
    if (code) return { error: "Unable to save. Refresh and try again." };
    return {
      error: error instanceof Error ? error.message : "Unable to save.",
    };
  }
}
