// app/api/user/[userId]/route.ts

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ userId: string }>
}

async function canAccessUser(
  sessionUserId: number,
  sessionUserRole: string,
  targetUserId: number
) {
  if (sessionUserRole === "A") {
    return true
  }

  if (sessionUserId === targetUserId) {
    return true
  }

  if (sessionUserRole === "S") {
    const sponsor = await prisma.sponsor.findUnique({
      where: { User_ID: sessionUserId },
      select: { Org_ID: true },
    })

    if (!sponsor?.Org_ID) {
      return false
    }

    const targetDriver = await prisma.driver.findUnique({
      where: { User_ID: targetUserId },
      select: { Org_ID: true },
    })

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

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { userId } = await params

    if (Number.isNaN(Number(userId))) {
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
        User_Type: true,
        Sponsor: {
          select: {
            Sponsor_Org: {
              select: {
                Org_Name: true,
              },
            },
          },
        },
        Driver: {
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

    let orgName = null
    if (user.User_Type === "S") {
      orgName = user.Sponsor?.Sponsor_Org?.Org_Name ?? null
    } else if (user.User_Type === "D") {
      orgName = user.Driver?.Sponsor_Org?.Org_Name ?? null
    }

    return NextResponse.json({
      Username: user.Username,
      Email: user.Email,
      Phone: user.Phone,
      Org_Name: orgName,
    })
  } catch (error) {
    console.error("GET /api/user/[userId] error:", error)
    return NextResponse.json(
      { error: "Error fetching user info" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { userId } = await params

    if (Number.isNaN(Number(userId))) {
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
      where: { User_ID: Number(userId) },
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
