"use server";
import { createExamination } from "./actions";
import { actionUser, field, type ActionState } from "@/lib/school-actions";
import { examConfiguration } from "@/lib/exam-transfer";
export async function importExamination(
  state: ActionState,
  data: FormData,
): Promise<ActionState> {
  try {
    await actionUser(true);
    const file = data.get("configuration");
    if (!(file instanceof File) || !file.size || file.size > 1000000)
      return { error: "Choose an exam configuration JSON file under 1 MB." };
    const config = examConfiguration.parse(JSON.parse(await file.text()));
    const form = new FormData();
    for (const key of [
      "title",
      "date",
      "markEntryDueDate",
      "publishDate",
    ] as const)
      form.set(key, config[key]);
    form.set("yearId", field(data, "yearId"));
    form.set("visibility", "private");
    form.set("subjectSelection", "1");
    for (const cohort of config.cohorts) {
      form.append("cohortIds", cohort.cohortId);
      for (const s of cohort.subjects) {
        form.append("subjectIds", s.id);
        form.set("max_" + s.id, String(s.maxMarks));
        form.set("pass_" + s.id, String(s.passMarks));
      }
    }
    return await createExamination(state, form);
  } catch {
    return {
      error:
        "Invalid exam configuration. Export a configuration from this academic year and check its dates and subject settings.",
    };
  }
}
