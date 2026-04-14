// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      username: string
      twoFactorPending: boolean
      isEmailVerified?: boolean
      impersonating?: boolean
      realUserId?: string
      realUserRole?: string
      realUsername?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    username: string
    twoFactorPending?: boolean
    emailVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    username: string
    twoFactorPending?: boolean
    emailVerified?: boolean
    impersonationActive?: boolean
    impersonatedUserId?: string
    impersonatedRole?: string
    impersonatedUsername?: string
  }
}