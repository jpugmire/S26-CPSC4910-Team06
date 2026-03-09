// app/api/user/[userId]/route.ts

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

async function canAccessUser(
  sessionUserId: number,
  sessionUserRole: string,
  targetUserId: number
) {
  // Admin can access anyone
  if (sessionUserRole === "A") {
    return true
  }

  // User can access themself
  if (sessionUserId === targetUserId) {
    return true
  }

  // Sponsor can access users in the same org
  if (sessionUserRole === "S") {
    const sponsor = await prisma.sponsor.findUnique({
      where: { User_ID: sessionUserId },
      select: { Org_ID: true },
    })

    if (!sponsor?.Org_ID) {
      return false
    }

    // Check target user's org as a driver
    const targetDriver = await prisma.driver.findUnique({
      where: { User_ID: targetUserId },
      select: { Org_ID: true },
    })

    // Check target user's org as a sponsor
    const targetSponsor = await prisma.sponsor.findUnique({
      where: { User_ID: targetUserId },
      select: { Org_ID: true },
    })

    const targetOrgId = targetDriver?.Org_ID ?? targetSponsor?.Org_ID ?? null

    if (!targetOrgId) {
      return false
    }

    return sponsor.Org_ID === targetOrgId
  }

  return false
}

export async function GET(req: NextRequest, context: RouteContext<"/api/user/[userId]">) {
  try {
    const session = await auth()

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { userId } = await context.params

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const authorized = await canAccessUser(
      Number(session.user.id),
      session.user.role,
      Number(userId)
    )

    if (!authorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { User_ID: Number(userId) },
      select: {
        Username: true,
        Email: true,
        Phone: true,
        Sponsor: {
          select: {
            Sponsor_Org: {
              select: {
                Org_Name: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      Username: user.Username,
      Email: user.Email,
      Phone: user.Phone,
      Org_Name: user.Sponsor?.Sponsor_Org?.Org_Name ?? null,
    })
  } catch (error) {
    console.error("GET /api/user/[userId] error:", error)
    return NextResponse.json(
      { error: "Error fetching user info" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, context: RouteContext<"/api/user/[userId]">) {
  try {
    const session = await auth()

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { userId } = await context.params

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const authorized = await canAccessUser(
      Number(session.user.id),
      session.user.role,
      Number(userId)
    )

    if (!authorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { email, phone } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { User_ID: Number(session.user.id) },
      data: {
        Email: email,
        Phone: phone,
      },
      select: {
        Username: true,
        Email: true,
        Phone: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("PUT /api/user/[userId] error:", error)
    return NextResponse.json(
      { error: "Error updating user info" },
      { status: 500 }
    )
  }
}