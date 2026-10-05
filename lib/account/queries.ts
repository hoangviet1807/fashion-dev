import { and, asc, count, desc, eq, isNull, or, sql, type SQL } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { addresses, orderItems, orders, users } from "@/lib/db/schema";
import { getOrderWithItems } from "@/lib/orders/queries";

export type AccountUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  emailVerified: boolean;
  hasPassword: boolean;
};

export async function getAccountUser(id: string): Promise<AccountUser | null> {
  const [user] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    emailVerified: user.emailVerified !== null,
    hasPassword: user.passwordHash !== null,
  };
}

/** For account pages; `proxy.ts` already redirects signed-out visitors. */
export async function requireAccountUser(callbackUrl = "/account") {
  const session = await auth();
  const user = session?.user?.id ? await getAccountUser(session.user.id) : null;
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

/**
 * Orders placed while signed in, plus guest orders to the same address once the
 * email is verified (otherwise anyone could register with someone else's email).
 */
export function ownedBy(user: AccountUser): SQL {
  const byUser = eq(orders.userId, user.id);
  if (!user.emailVerified || !user.email) return byUser;
  return or(
    byUser,
    and(isNull(orders.userId), eq(sql`lower(${orders.email})`, user.email.toLowerCase())),
  )!;
}

export async function listUserOrders(user: AccountUser) {
  return getDb()
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      currency: orders.currency,
      total: orders.total,
      createdAt: orders.createdAt,
      itemCount: count(orderItems.id),
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(ownedBy(user))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt));
}

export async function getUserOrder(user: AccountUser, id: string) {
  const data = await getOrderWithItems(id);
  if (!data) return null;
  const { order } = data;
  const owned =
    order.userId === user.id ||
    (order.userId === null &&
      user.emailVerified &&
      !!user.email &&
      order.email.toLowerCase() === user.email.toLowerCase());
  return owned ? data : null;
}

export async function listAddresses(userId: string) {
  return getDb()
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), asc(addresses.createdAt));
}

export async function getDefaultAddress(userId: string) {
  const [address] = await listAddresses(userId);
  return address ?? null;
}
