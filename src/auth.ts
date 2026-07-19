import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAILS = ["bhoogs24@gmail.com", "brian.hoogerwerf@specright.com"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ user }) {
      return ALLOWED_EMAILS.includes(user.email ?? "");
    },
    authorized({ auth }) {
      return !!auth;
    },
  },
});
