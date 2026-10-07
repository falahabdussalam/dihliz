import Modal from "@/components/dashboard/Dialog";
import ActionForm from "@/components/dashboard/ActionForm";
import { Field, inputClass } from "@/components/dashboard/SchoolUI";
import { editStructure } from "./actions";
export default function EditStructure({
  kind,
  id,
  name,
  updatedAt,
  archived,
}: {
  kind: "year" | "class";
  id: string;
  name: string;
  updatedAt: string;
  archived: boolean;
}) {
  return (
    <Modal title={"Edit " + kind}>
      <ActionForm action={editStructure}>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="updatedAt" value={updatedAt} />
        <Field label="Display name">
          <input
            name="name"
            className={inputClass}
            defaultValue={name}
            required
            maxLength={kind === "year" ? 20 : 100}
          />
        </Field>
        <label className="text-sm">
          <input name="archived" type="checkbox" defaultChecked={archived} />{" "}
          Archived (uncheck to restore)
        </label>
        <p className="text-sm text-slate-500">
          Existing academic relationships and historical dates are retained.
          Create a new class for a different level, division or stream.
        </p>
      </ActionForm>
    </Modal>
  );
}
