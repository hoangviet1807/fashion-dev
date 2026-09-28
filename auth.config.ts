import type { NextAuthConfig } from "next-auth";

/** Shared by `proxy.ts`; must not import the database or Node-only modules. */
export const authConfig = {
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
