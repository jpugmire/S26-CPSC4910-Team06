// next-auth.d.ts
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;

      realId: string;
      realUsername: string;
      realRole: string;

      isImpersonating: boolean;
      actingUserId: string | null;
      actingUsername: string | null;
      actingRole: string | null;

      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    username: string;
    role: string;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    username?: string;
    role?: string;

    realId?: string;
    realUsername?: string;
    realRole?: string;

    actingUserId?: string | null;
    actingUsername?: string | null;
    actingRole?: string | null;
  }
}