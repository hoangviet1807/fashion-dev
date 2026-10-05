import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { users, type UserRole } from "@/lib/db/schema";
import { can, type Permission } from "./roles";

export type AdminUser = { id: string; name: string | null; email: string | null; role: UserRole };

/**
 * The role is read from the database on every call (not the session JWT), so
 * granting or revoking access takes effect immediately.
 */
export async function getSessionRole(): Promise<AdminUser | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const [user] = await getDb()
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user ?? null;
}

/** For admin pages: signed-out → login; signed in without the permission → 404. */
export async function requirePermission(permission: Permission, callbackUrl: string) {
  const user = await getSessionRole();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!can(user.role, permission)) notFound();
  return user;
}

/** For server actions; null when the caller may not perform `permission`. */
export async function authorize(permission: Permission) {
  const user = await getSessionRole();
  return user && can(user.role, permission) ? user : null;
}
