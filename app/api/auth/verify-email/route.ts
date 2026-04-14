// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 })
  }

  const record = await prisma.email_Verification_Token.findUnique({
    where: { token },
  })

  if (!record) {
    return NextResponse.json({ error: "Invalid or already used verification link" }, { status: 400 })
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Verification link has expired" }, { status: 400 })
  }

  await prisma.user.update({
    where: { User_ID: record.userId },
    data: { emailVerified: true },
  })

  await prisma.email_Verification_Token.delete({ where: { token } })

  return NextResponse.redirect(new URL("/login?verified=true", req.url))
}
