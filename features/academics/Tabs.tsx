import Tabs from "@/components/dashboard/Tabs";
export default function AcademicTabs({
  active,
  year,
}: {
  active: string;
  year?: string;
}) {
  return (
    <Tabs
      active={active}
      items={[
        ["years", "Years & classes"],
        ["streams", "Streams"],
        ["departments", "Departments"],
        ["subjects", "Subjects"],
        ["houses", "Houses"],
        ["levels", "Class levels"],
        ["divisions", "Divisions"],
      ].map(([id, label]) => ({
        id,
        label,
        href:
          (id === "years"
            ? "/dashboard/academic"
            : id === "subjects"
              ? "/dashboard/academic/subjects"
              : "/dashboard/academic/masters?tab=" + id) +
          (id === "years" || id === "subjects" ? "?" : "&") +
          "year=" +
          (year ?? ""),
      }))}
    />
  );
}
