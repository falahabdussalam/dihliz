"use server";
import * as actions from "@/features/students/actions";
import type { ActionState } from "@/lib/school-actions";
export async function saveStudent(state: ActionState, data: FormData) {
  return actions.saveStudent(state, data);
}
export async function saveEnrollment(state: ActionState, data: FormData) {
  return actions.saveEnrollment(state, data);
}
export async function saveGuardian(state: ActionState, data: FormData) {
  return actions.saveGuardian(state, data);
}
export async function saveContact(state: ActionState, data: FormData) {
  return actions.saveContact(state, data);
}
export async function archiveStudent(state: ActionState, data: FormData) {
  return actions.archiveStudent(state, data);
}
export async function promoteStudents(state: ActionState, data: FormData) {
  return actions.promoteStudents(state, data);
}
