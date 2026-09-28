import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, sql } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { authConfig } from "@/auth.config";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/schema";
import { getDb } from "@/lib/db";
import { accounts, users } from "@/lib/db/schema";

const OAUTH_PROVIDERS = [
  { id: "google", label: "Google", env: "GOOGLE" },
  { id: "facebook", label: "Facebook", env: "FACEBOOK" },
] as const;

export type OAuthProviderId = (typeof OAUTH_PROVIDERS)[number]["id"];

/** Providers whose `AUTH_<NAME>_ID` / `AUTH_<NAME>_SECRET` are set; others stay hidden. */
export function enabledOAuthProviders() {
  return OAUTH_PROVIDERS.filter(
    ({ env }) => process.env[`AUTH_${env}_ID`] && process.env[`AUTH_${env}_SECRET`],
  ).map(({ id, label }) => ({ id, label }));
}

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const [user] = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
      const valid = await verifyPassword(password, user?.passwordHash);
      if (!user || !valid) return null;
      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
];

// Both providers only return addresses the user has confirmed with them, so they may
// join an existing email/password account.
for (const { id } of enabledOAuthProviders()) {
  providers.push(
    id === "google"
      ? Google({ allowDangerousEmailAccountLinking: true })
      : Facebook({ allowDangerousEmailAccountLinking: true }),
  );
}

const OAUTH_IDS = new Set<string>(OAUTH_PROVIDERS.map(({ id }) => id));

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  ...authConfig,
  adapter: DrizzleAdapter(getDb(), { usersTable: users, accountsTable: accounts }),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    signIn({ account, profile }) {
      if (!account || !OAUTH_IDS.has(account.provider)) return true;
      if (account.provider === "google" && profile?.email_verified !== true) return false;
      // Facebook omits the email for phone-only accounts; we need it for orders and linking.
      if (!profile?.email) return "/login?error=OAuthNoEmail";
      return true;
    },
  },
  events: {
    async linkAccount({ user, account }) {
      if (!OAUTH_IDS.has(account.provider) || !user.id) return;
      // A password set before the address was verified may belong to someone else — drop it.
      await getDb()
        .update(users)
        .set({
          passwordHash: sql`case when ${users.emailVerified} is null then null else ${users.passwordHash} end`,
          emailVerified: sql`coalesce(${users.emailVerified}, now())`,
        })
        .where(eq(users.id, user.id));
    },
  },
}));
