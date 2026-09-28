"use server";

import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gt } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { enabledOAuthProviders, signIn, signOut } from "@/auth";
import { hashPassword } from "@/lib/auth/password";
import {
  authFieldErrors,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  safeRedirectPath,
  type AuthFieldErrors,
} from "@/lib/auth/schema";
import { getDb } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { sendPasswordReset } from "@/lib/email/send-password-reset";
import { siteUrl } from "@/lib/site-url";

const RESET_TTL_MINUTES = 60;
const RESET_RESEND_COOLDOWN_MS = 60_000;

export type AuthResult =
  | { status: "invalid"; fieldErrors: AuthFieldErrors; message?: string }
  | { status: "error"; message: string }
  | { status: "sent" };

/** Raw form values; every action re-validates with Zod. */
export type AuthInput = Record<string, string | undefined>;

const GENERIC_ERROR = "Đã có lỗi xảy ra. Vui lòng thử lại.";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** On success `signIn` throws Next's redirect, which must propagate. */
async function signInWithPassword(email: string, password: string, callbackUrl: unknown): Promise<AuthResult> {
  try {
    await signIn("credentials", { email, password, redirectTo: safeRedirectPath(callbackUrl) });
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? { status: "error", message: "Email hoặc mật khẩu không đúng." }
        : { status: "error", message: GENERIC_ERROR };
    }
    throw error;
  }
  return { status: "error", message: GENERIC_ERROR };
}

export async function login(input: AuthInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: authFieldErrors(parsed.error) };
  return signInWithPassword(parsed.data.email, parsed.data.password, input.callbackUrl);
}

export async function register(input: AuthInput): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: authFieldErrors(parsed.error) };
  const { name, email, password } = parsed.data;

  const passwordHash = await hashPassword(password);
  const [created] = await getDb()
    .insert(users)
    .values({ name, email, passwordHash })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });
  if (!created) {
    return {
      status: "invalid",
      fieldErrors: {
        email: "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng Quên mật khẩu.",
      },
    };
  }

  return signInWithPassword(email, password, input.callbackUrl);
}

export async function signInWithOAuth(formData: FormData) {
  const provider = formData.get("provider");
  const enabled = enabledOAuthProviders().some(({ id }) => id === provider);
  if (typeof provider !== "string" || !enabled) redirect("/login?error=Configuration");
  await signIn(provider, { redirectTo: safeRedirectPath(formData.get("callbackUrl")) });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

/** Always reports success so the form can't be used to discover registered emails. */
export async function requestPasswordReset(input: AuthInput): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: authFieldErrors(parsed.error) };

  try {
    const db = getDb();
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);
    if (!user?.email) return { status: "sent" };

    const [recent] = await db
      .select({ createdAt: passwordResetTokens.createdAt })
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id))
      .orderBy(desc(passwordResetTokens.createdAt))
      .limit(1);
    if (recent && Date.now() - recent.createdAt.getTime() < RESET_RESEND_COOLDOWN_MS) {
      return { status: "sent" };
    }

    const token = randomBytes(32).toString("base64url");
    await db.transaction(async (tx) => {
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
      await tx.insert(passwordResetTokens).values({
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
      });
    });

    await sendPasswordReset({
      to: user.email,
      name: user.name,
      resetUrl: `${siteUrl()}/reset-password?token=${token}`,
      expiresInMinutes: RESET_TTL_MINUTES,
    });
  } catch (error) {
    console.error("[auth] Failed to send password reset", error);
    return { status: "error", message: GENERIC_ERROR };
  }
  return { status: "sent" };
}

export async function resetPassword(input: AuthInput): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = authFieldErrors(parsed.error);
    return Object.keys(fieldErrors).length > 0
      ? { status: "invalid", fieldErrors }
      : { status: "error", message: "Liên kết đặt lại mật khẩu không hợp lệ." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const updated = await getDb().transaction(async (tx) => {
    const [row] = await tx
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, hashToken(parsed.data.token)),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .returning({ userId: passwordResetTokens.userId });
    if (!row) return false;

    // Receiving the email proves ownership of the address.
    await tx
      .update(users)
      .set({ passwordHash, emailVerified: new Date() })
      .where(eq(users.id, row.userId));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, row.userId));
    return true;
  });

  if (!updated) {
    return {
      status: "error",
      message: "Liên kết đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu liên kết mới.",
    };
  }
  redirect("/login?reset=1");
}
