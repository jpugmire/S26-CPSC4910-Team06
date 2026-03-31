// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8, updateAge: 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("authorize called with username:", credentials?.username);

        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            Username: credentials.username as string,
          },
          include: {
            Driver: true,
            Sponsor: true,
          },
        });

        console.log("User found:", user?.Username);

        if (!user) {
          console.log("User not found");
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          (user as any).Password
        );

        console.log("Password match:", passwordMatch);

        if (!passwordMatch) {
          console.log("Password does not match");
          return null;
        }

        return {
          id: String(user.User_ID),
          username: user.Username,
          email: null,
          role: user.User_Type,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign-in
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.role = user.role;

        // Real identity
        token.realId = user.id;
        token.realUsername = user.username;
        token.realRole = user.role;

        // Acting identity starts off empty
        token.actingUserId = null;
        token.actingUsername = null;
        token.actingRole = null;
      }

      // Session update used to start impersonation
      if (trigger === "update" && session?.impersonation) {
        token.actingUserId = session.impersonation.actingUserId;
        token.actingUsername = session.impersonation.actingUsername;
        token.actingRole = session.impersonation.actingRole;
      }

      // Session update used to stop impersonation
      if (trigger === "update" && session?.stopImpersonation) {
        token.actingUserId = null;
        token.actingUsername = null;
        token.actingRole = null;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        const actingUserId = token.actingUserId as string | null;
        const actingUsername = token.actingUsername as string | null;
        const actingRole = token.actingRole as string | null;

        const realId = token.realId as string;
        const realUsername = token.realUsername as string;
        const realRole = token.realRole as string;

        // Effective identity used by most of the app
        session.user.id = actingUserId ?? realId;
        session.user.username = actingUsername ?? realUsername;
        session.user.role = actingRole ?? realRole;

        // Real identity kept for admin checks/auditing
        session.user.realId = realId;
        session.user.realUsername = realUsername;
        session.user.realRole = realRole;

        // Optional convenience fields
        session.user.isImpersonating = !!actingUserId;
        session.user.actingUserId = actingUserId;
        session.user.actingUsername = actingUsername;
        session.user.actingRole = actingRole;
      }

      return session;
    },

    async signIn({ user }) {
      console.log("User signed in:", user);
      try {
        await prisma.audit.create({
          data: {
            User_ID: parseInt(user.id!),
            Message_Type_ID: 4,
            Message: `User signed in`,
          },
        });
        console.log("Audit log created successfully");
      } catch (error) {
        console.error("Error creating audit log:", error);
      }
      return true;
    },
  },
});