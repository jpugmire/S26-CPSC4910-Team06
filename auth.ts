// auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
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

        return {
          id: String(user.User_ID),
          username: user.Username,
          email: null,
          role: user.User_Type,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.username = token.username as string
        session.user.id = token.sub as string
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