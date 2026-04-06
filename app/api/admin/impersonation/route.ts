// app/api/admin/impersonate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 })
    }

    const realRole = session.user.realUserRole ?? session.user.role

    if (realRole !== "A") {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 })
    }

    const body = await req.json()
    const targetUserId = Number(body.targetUserId)

    if (!Number.isInteger(targetUserId)) {
      return NextResponse.json({ error: "Invalid target user id." }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { User_ID: targetUserId },
      select: {
        User_ID: true,
        Username: true,
        User_Type: true,
        Status: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found." }, { status: 404 })
    }

    if (targetUser.User_Type === "A") {
      return NextResponse.json(
        { error: "Cannot impersonate another admin." },
        { status: 403 }
      )
    }

    if (targetUser.Status !== "A") {
      return NextResponse.json(
        { error: "Cannot impersonate an inactive user." },
        { status: 403 }
      )
    }

    return NextResponse.json({
      ok: true,
      targetUser: {
        id: String(targetUser.User_ID),
        username: targetUser.Username,
        role: targetUser.User_Type,
      },
    })
  } catch (error) {
    console.error("Impersonation start error:", error)
    return NextResponse.json(
      { error: "Failed to start impersonation." },
      { status: 500 }
    )
  }
}