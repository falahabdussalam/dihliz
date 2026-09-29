"use server";
import * as actions from "@/features/examinations/record-actions";
import type { ActionState } from "@/lib/school-actions";
export async function saveSubject(state: ActionState, data: FormData) {
  return actions.saveSubject(state, data);
}
export async function saveCohortSubject(state: ActionState, data: FormData) {
  return actions.saveCohortSubject(state, data);
}
export async function createExam(state: ActionState, data: FormData) {
  return actions.createExam(state, data);
}
export async function saveMarks(state: ActionState, data: FormData) {
  return actions.saveMarks(state, data);
}
export async function changeExamStatus(state: ActionState, data: FormData) {
  return actions.changeExamStatus(state, data);
}
