// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      username: string
      twoFactorPending: boolean
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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    username: string
    twoFactorPending?: boolean
    impersonationActive?: boolean
    impersonatedUserId?: string
    impersonatedRole?: string
    impersonatedUsername?: string
  }
}