import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!session.user.twoFactorPending) {
        return NextResponse.json({ error: "2FA not required" }, { status: 400 })
    }

    const { token } = await req.json()

    if (!token) {
        return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const otpRecord = await prisma.otp_Token.findUnique({ where: { token } })

    if (!otpRecord || otpRecord.userId !== parseInt(session.user.id) || otpRecord.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    await prisma.otp_Token.delete({ where : { token } })

    return NextResponse.json({ message: "OTP verified" })
}