// src/lib/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import connectMongo from "@/lib/conn";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectMongo();
          const user = await User.findOne({ username: credentials?.username });

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials!.password,
            user.password
          );
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            name: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    // ✅ PENTING: Redirect callback
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // ✅ PENTING: Debug untuk production
  debug: process.env.NODE_ENV === "development",
};
