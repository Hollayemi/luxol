import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginWithCredentials, loginWithGoogle } from "@/lib/auth/backend";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const result = await loginWithCredentials(email, password);
        if (!result) return null;

        return {
          id: String(result.user.id),
          name: result.user.name,
          email: result.user.email,
          accessToken: result.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Email + password: authorize() already returned the backend token
      if (user?.accessToken) token.accessToken = user.accessToken;

      // Google: trade Google's ID token for the backend's token (first sign in only)
      if (account?.provider === "google" && account.id_token) {
        const result = await loginWithGoogle(account.id_token);
        if (result) {
          token.accessToken = result.accessToken;
          token.sub = String(result.user.id);
          token.name = result.user.name;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      return session;
    },
  },
});
