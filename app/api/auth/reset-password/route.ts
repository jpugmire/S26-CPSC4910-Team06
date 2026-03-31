import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
        return NextResponse.json({ error: "Token and new password are required" }, { status: 400 })
    }

    const resetToken = await prisma.password_Reset_Token.findUnique({
        where: { token }
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { User_ID: resetToken.userId },
        data: { Password: hashedPassword },
    })

    await prisma.password_Reset_Token.delete({ where: { token } })

    return NextResponse.json({ message: "Password reset successfully." })
}

