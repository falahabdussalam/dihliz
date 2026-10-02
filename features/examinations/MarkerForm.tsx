import Select from "@/components/dashboard/Select";
import Modal from "@/components/dashboard/Dialog";
import ActionForm from "@/components/dashboard/ActionForm";
import { Field, inputClass } from "@/components/dashboard/SchoolUI";
import { assignMarker } from "./actions";
export default function MarkerForm({
  examId,
  subjectId,
  name,
  revision,
  tutorId,
  tutors,
}: {
  examId: string;
  subjectId: string;
  name: string;
  revision: number;
  tutorId: string | null;
  tutors: { id: string; fullName: string }[];
}) {
  return (
    <Modal title={"Assign marks-entry tutor · " + name}>
      <ActionForm action={assignMarker}>
        <input type="hidden" name="examId" value={examId} />
        <input type="hidden" name="examSubjectId" value={subjectId} />
        <input type="hidden" name="revision" value={revision} />
        <Field label="Marks-entry tutor">
          <Select
            name="tutorId"
            className={inputClass}
            defaultValue={tutorId ?? ""}
          >
            <option value="">Unassigned</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-sm text-slate-500">
          This assignment applies only to this class examination. Existing marks
          and academic subject assignments are preserved.
        </p>
      </ActionForm>
    </Modal>
  );
}
