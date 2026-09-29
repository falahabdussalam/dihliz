import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Modal from "@/components/dashboard/Dialog";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  Panel,
  Field,
  inputClass,
  Badge,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import AcademicTabs from "@/features/academics/Tabs";
import { saveMaster } from "@/features/academics/actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; year?: string; archived?: string }>;
}) {
  const user = await requirePageUser("/dashboard/academic"),
    filters = await searchParams;
  if (user.role !== "SUPER_ADMIN")
    return (
      <DashboardLayout currentUser={user} title="Academic setup">
        <p>Only administrators can manage academic configuration.</p>
      </DashboardLayout>
    );
  const kind = [
    "streams",
    "departments",
    "houses",
    "levels",
    "divisions",
  ].includes(filters.tab ?? "")
    ? filters.tab!
    : "streams";
  const where = { isArchived: filters.archived === "1" };
  const rows =
    kind === "streams"
      ? await prisma.stream.findMany({ where, orderBy: { name: "asc" } })
      : kind === "departments"
        ? await prisma.department.findMany({ where, orderBy: { name: "asc" } })
        : kind === "houses"
          ? await prisma.house.findMany({ where, orderBy: { name: "asc" } })
          : kind === "levels"
            ? await prisma.classLevel.findMany({
                where,
                orderBy: { sortOrder: "asc" },
              })
            : await prisma.division.findMany({
                where,
                orderBy: { name: "asc" },
              });
  return (
    <DashboardLayout currentUser={user} title="Academic setup">
      <div className="space-y-5">
        <AcademicTabs active={kind} year={filters.year} />
        <Panel title={kind[0].toUpperCase() + kind.slice(1)}>
          <form className="mb-4 flex items-center gap-3">
            <input type="hidden" name="tab" value={kind} />
            <input type="hidden" name="year" value={filters.year ?? ""} />
            <label className="text-sm">
              <input
                type="checkbox"
                name="archived"
                value="1"
                defaultChecked={filters.archived === "1"}
              />{" "}
              Archived records
            </label>
            <button className={linkClass}>Apply filter</button>
          </form>
          {[null, ...rows].map((row) => (
            <div
              className="flex items-center justify-between border-b py-3"
              key={row?.id ?? "new"}
            >
              <span>
                {row ? row.name + " · " + row.code : "Add record"}{" "}
                {row?.isArchived && <Badge>ARCHIVED</Badge>}
              </span>
              <Modal title={row ? "Edit " + row.name : "Add " + kind}>
                <ActionForm action={saveMaster}>
                  <input type="hidden" name="kind" value={kind} />
                  <input type="hidden" name="id" value={row?.id ?? ""} />
                  <input
                    type="hidden"
                    name="updatedAt"
                    value={row?.updatedAt.toISOString() ?? ""}
                  />
                  <Field label="Code">
                    <input
                      name="code"
                      className={inputClass}
                      defaultValue={row?.code}
                      readOnly={!!row}
                      required
                    />
                  </Field>
                  <Field label="Name">
                    <input
                      name="name"
                      className={inputClass}
                      defaultValue={row?.name}
                      required
                    />
                  </Field>
                  {kind === "levels" && (
                    <Field label="Sort order">
                      <input
                        name="sortOrder"
                        type="number"
                        min="0"
                        className={inputClass}
                        defaultValue={
                          row && "sortOrder" in row
                            ? Number(row.sortOrder)
                            : rows.length + 1
                        }
                      />
                    </Field>
                  )}
                  {row && (
                    <label className="text-sm">
                      <input
                        type="checkbox"
                        name="archived"
                        defaultChecked={row.isArchived}
                      />{" "}
                      Archived (uncheck to restore)
                    </label>
                  )}
                </ActionForm>
              </Modal>
            </div>
          ))}
        </Panel>
      </div>
    </DashboardLayout>
  );
}
