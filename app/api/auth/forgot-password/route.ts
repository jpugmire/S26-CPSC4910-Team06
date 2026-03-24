import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"


export async function POST(req: NextRequest) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { email } = await req.json()

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { Email: email } })

    //Always return 200 because we don't want to reveal whether email exists
    if(!user) {
        return NextResponse.json({ message: "If that email exists, a reset link has been sent." })
    }

    //Delete any existing reset token for this user
    await prisma.password_Reset_Token.deleteMany({ where: { userId: user.User_ID } })

    //Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1hr

    await prisma.password_Reset_Token.create({
        data: {token, userId: user.User_ID, expiresAt },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset your password",
        html: `
            <p>You requested a password reset for your Driver Rewards account.</p>
            <p><a href="${resetUrl}">Click here to reset your password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            `,
    })

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." })
}