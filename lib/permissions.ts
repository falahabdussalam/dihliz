import { UserRole } from "@/generated/prisma/enums";

const academicManagers = new Set<UserRole>([
  UserRole.SUPER_ADMIN,
]);

export function canManageAcademicSetup(role: UserRole) {
  return academicManagers.has(role);
}

export function roleLabel(role: UserRole) {
  return {
    SUPER_ADMIN: "Super Admin",
    DEPARTMENT_HEAD: "Department Head",
    CLASS_MENTOR: "Class Mentor",
    HOSTEL_MENTOR: "Hostel Mentor",
    SUBJECT_TUTOR: "Subject Tutor",
  }[role];
}
