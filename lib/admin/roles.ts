import type { UserRole } from "@/lib/db/schema";

export type Permission =
  | "orders:view"
  | "orders:fulfil"
  | "orders:cancel"
  | "orders:refund"
  | "inventory:view"
  | "reviews:moderate";

const PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  customer: new Set(),
  staff: new Set(["orders:view", "orders:fulfil", "orders:cancel", "inventory:view", "reviews:moderate"]),
  admin: new Set([
    "orders:view",
    "orders:fulfil",
    "orders:cancel",
    "orders:refund",
    "inventory:view",
    "reviews:moderate",
  ]),
};

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Khách hàng",
  staff: "Nhân viên",
  admin: "Quản trị viên",
};

export function can(role: UserRole | null | undefined, permission: Permission) {
  return role ? PERMISSIONS[role].has(permission) : false;
}

export function isStaff(role: UserRole | null | undefined) {
  return role === "staff" || role === "admin";
}
