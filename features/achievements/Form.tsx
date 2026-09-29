import Modal from "@/components/dashboard/Dialog";
import ActionForm from "@/components/dashboard/ActionForm";
import { Field, inputClass } from "@/components/dashboard/SchoolUI";
import { saveAchievement } from "./actions";
export default function AchievementForm({
  enrollmentId,
  record,
}: {
  enrollmentId: string;
  record?: {
    id: string;
    revision: number;
    title: string;
    kind: string;
    date: Date;
    organiser: string | null;
    award: string | null;
    remarks: string | null;
    evidenceUrl: string | null;
    isArchived: boolean;
  };
}) {
  return (
    <Modal title={record ? "Edit achievement" : "Add achievement"}>
      <ActionForm action={saveAchievement}>
        <input type="hidden" name="enrollmentId" value={enrollmentId} />
        <input type="hidden" name="achievementId" value={record?.id ?? ""} />
        <input type="hidden" name="revision" value={record?.revision ?? 0} />
        <Field label="Title">
          <input
            className={inputClass}
            name="title"
            required
            defaultValue={record?.title}
          />
        </Field>
        <Field label="Type">
          <select
            className={inputClass}
            name="kind"
            defaultValue={record?.kind}
          >
            {["ACTIVITY", "COMPETITION", "PARTICIPATION", "AWARD"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            className={inputClass}
            name="date"
            required
            defaultValue={record?.date.toISOString().slice(0, 10)}
          />
        </Field>
        {(["organiser", "award", "remarks", "evidenceUrl"] as const).map(
          (key) => (
            <Field
              key={key}
              label={key === "evidenceUrl" ? "Evidence link (HTTPS)" : key}
            >
              <input
                className={inputClass}
                name={key}
                defaultValue={record?.[key] ?? ""}
              />
            </Field>
          ),
        )}
        {record && (
          <label className="text-sm">
            <input
              type="checkbox"
              name="archived"
              defaultChecked={record.isArchived}
            />{" "}
            Archived (uncheck to restore)
          </label>
        )}
      </ActionForm>
    </Modal>
  );
}
