"use server";

import { and, asc, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  addressSchema,
  changePasswordSchema,
  profileSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/account/schema";
import { resolveAddress } from "@/lib/address/wards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import { addresses, users } from "@/lib/db/schema";

const MAX_ADDRESSES = 10;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AccountResult =
  | { status: "invalid"; fieldErrors: FieldErrors; message?: string }
  | { status: "error"; message: string }
  | { status: "saved"; message?: string };

/** Raw form values; every action re-validates with Zod. */
export type AccountInput = Record<string, string | boolean | undefined>;

const SESSION_EXPIRED: AccountResult = {
  status: "error",
  message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
};
const GENERIC_ERROR: AccountResult = {
  status: "error",
  message: "Đã có lỗi xảy ra. Vui lòng thử lại.",
};

async function currentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function updateProfile(input: AccountInput): Promise<AccountResult> {
  const userId = await currentUserId();
  if (!userId) return SESSION_EXPIRED;
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };

  try {
    await getDb()
      .update(users)
      .set({ name: parsed.data.name, phone: parsed.data.phone || null })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[account] Failed to update profile", error);
    return GENERIC_ERROR;
  }
  revalidatePath("/account", "layout");
  return { status: "saved", message: "Đã lưu thông tin cá nhân." };
}

export async function changePassword(input: AccountInput): Promise<AccountResult> {
  const userId = await currentUserId();
  if (!userId) return SESSION_EXPIRED;
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };

  const db = getDb();
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.passwordHash) {
    return { status: "error", message: "Tài khoản này đăng nhập bằng Google / Facebook, chưa có mật khẩu." };
  }
  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return { status: "invalid", fieldErrors: { currentPassword: "Mật khẩu hiện tại không đúng." } };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.password) })
    .where(eq(users.id, userId));
  return { status: "saved", message: "Đã đổi mật khẩu." };
}

export async function saveAddress(input: AccountInput): Promise<AccountResult> {
  const userId = await currentUserId();
  if (!userId) return SESSION_EXPIRED;
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };

  const { isDefault, ...fields } = parsed.data;
  const location = resolveAddress(fields.provinceCode, fields.wardCode);
  if (!location) {
    return { status: "invalid", fieldErrors: { wardCode: "Phường/xã không thuộc tỉnh/thành phố đã chọn." } };
  }
  const id = typeof input.id === "string" && input.id ? input.id : null;
  if (id !== null && !UUID.test(id)) return GENERIC_ERROR;

  const values = { ...fields, province: location.province, ward: location.ward };

  try {
    const result = await getDb().transaction(async (tx) => {
      const [{ total }] = await tx
        .select({ total: count() })
        .from(addresses)
        .where(eq(addresses.userId, userId));

      if (id === null && total >= MAX_ADDRESSES) return "full" as const;
      // The first address always becomes the default.
      const makeDefault = isDefault || total === 0 || (id !== null && total === 1);

      if (makeDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
      }

      if (id === null) {
        await tx.insert(addresses).values({ ...values, userId, isDefault: makeDefault });
        return "saved" as const;
      }

      const updated = await tx
        .update(addresses)
        .set(makeDefault ? { ...values, isDefault: true } : values)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .returning({ id: addresses.id });
      if (updated.length === 0) throw new Error("Address not found");
      return "saved" as const;
    });

    if (result === "full") {
      return { status: "error", message: `Sổ địa chỉ tối đa ${MAX_ADDRESSES} địa chỉ.` };
    }
  } catch (error) {
    console.error("[account] Failed to save address", error);
    return GENERIC_ERROR;
  }

  revalidatePath("/account", "layout");
  return { status: "saved", message: id ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ." };
}

export async function deleteAddress(id: string): Promise<AccountResult> {
  const userId = await currentUserId();
  if (!userId) return SESSION_EXPIRED;
  if (!UUID.test(id)) return GENERIC_ERROR;

  try {
    await getDb().transaction(async (tx) => {
      const [removed] = await tx
        .delete(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .returning({ isDefault: addresses.isDefault });
      if (!removed?.isDefault) return;

      const [next] = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(eq(addresses.userId, userId))
        .orderBy(asc(addresses.createdAt))
        .limit(1);
      if (next) {
        await tx.update(addresses).set({ isDefault: true }).where(eq(addresses.id, next.id));
      }
    });
  } catch (error) {
    console.error("[account] Failed to delete address", error);
    return GENERIC_ERROR;
  }

  revalidatePath("/account", "layout");
  return { status: "saved", message: "Đã xoá địa chỉ." };
}

export async function setDefaultAddress(id: string): Promise<AccountResult> {
  const userId = await currentUserId();
  if (!userId) return SESSION_EXPIRED;
  if (!UUID.test(id)) return GENERIC_ERROR;

  try {
    await getDb().transaction(async (tx) => {
      const [target] = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .limit(1);
      if (!target) throw new Error("Address not found");

      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(and(eq(addresses.userId, userId), ne(addresses.id, id), eq(addresses.isDefault, true)));
      await tx.update(addresses).set({ isDefault: true }).where(eq(addresses.id, id));
    });
  } catch (error) {
    console.error("[account] Failed to set default address", error);
    return GENERIC_ERROR;
  }

  revalidatePath("/account", "layout");
  return { status: "saved", message: "Đã đặt làm địa chỉ mặc định." };
}
