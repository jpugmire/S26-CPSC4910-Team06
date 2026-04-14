// auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

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
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        console.log("authorize called with username:", credentials?.username)
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            Username: credentials.username as string,
          },
          include: {
            Driver: true,
            Sponsor: true,
          },
        })

        console.log("User found:", user?.Username)

        if (!user) {
          console.log("User not found")
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          (user as any).Password
        )

        console.log("Password match:", passwordMatch)

        if (!passwordMatch) {
          console.log("Password does not match")
          return null
        }

        //check if 2fa enabled
        if (user.twoFactorEnabled) {
          // generate code, store in Otp_Token, send via Resend
          await prisma.otp_Token.deleteMany({ where: { userId: user.User_ID } })

          const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
          const expiresAt = new Date(Date.now() + 1000 * 60 * 10) //10 min

          await prisma.otp_Token.create({
            data: { token: otpCode, userId: user.User_ID, expiresAt }
          })

          const resend = new Resend(process.env.RESEND_API_KEY)

          if (!user.Email) {
            return null
          }

          await resend.emails.send({
            from: "noreply@team06.cpsc4911.com",
            to: user.Email!,
            subject: "Your Driver Rewards login code",
            html: `<p> Your verification code is: <strong>${otpCode}</strong></p><p>This code expires in 10 minutes.</p>`
          })

          return { id: String(user.User_ID), username: user.Username, email: user.Email, role: user.User_Type, twoFactorPending: true, emailVerified: user.emailVerified }
        }

        return {
          id: String(user.User_ID),
          username: user.Username,
          email: null,
          role: user.User_Type,
          emailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.twoFactorPending === false) {
        token.twoFactorPending = false
      }
      if (trigger === "update" && session?.impersonationAction) {
        if (session.impersonationAction.type === "start") {
          token.impersonationActive = true
          token.impersonatedUserId = session.impersonationAction.targetUserId
          token.impersonatedRole = session.impersonationAction.targetRole
          token.impersonatedUsername = session.impersonationAction.targetUsername
        }

        if (session.impersonationAction.type === "stop") {
          token.impersonationActive = false
          delete token.impersonatedUserId
          delete token.impersonatedRole
          delete token.impersonatedUsername
        }
      }
      if (user) {
        token.role = user.role
        token.username = user.username
        token.twoFactorPending = user.twoFactorPending ?? false
        token.emailVerified = user.emailVerified ?? true
        token.impersonationActive = false
        token.impersonatedUserId = null
        token.impersonatedRole = null
        token.impersonatedUsername = null
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        const isImpersonating = !!token.impersonationActive

        session.user.id = String(
          isImpersonating ? token.impersonatedUserId : token.sub
        )
        session.user.role = String(
          isImpersonating ? token.impersonatedRole : token.role
        )
        session.user.username = String(
          isImpersonating ? token.impersonatedUsername : token.username
        )

        session.user.twoFactorPending = Boolean(token.twoFactorPending)
        session.user.isEmailVerified = Boolean(token.emailVerified ?? true)

        session.user.impersonating = isImpersonating
        session.user.realUserId = String(token.sub)
        session.user.realUserRole = String(token.role)
        session.user.realUsername = String(token.username)
      }
      return session
    },
    async signIn({user}){
      console.log("User signed in:", user);
      try {
        await prisma.audit.create({
          data: {
            User_ID: parseInt(user.id!),
            Message_Type_ID: 4,
            Message: `User signed in`
          }
        });
        console.log("Audit log created successfully");
      } catch (error) {
        console.error("Error creating audit log:", error);
      }
      return true;
    }
  },
})