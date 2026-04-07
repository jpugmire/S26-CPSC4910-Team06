// app/api/user/[userId]/route.ts

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { sendAccountInfoChangedEmail } from "@/lib/email"

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
      select: {
        driverSponsorOrgs: {
          select: { Org_ID: true }
        }
      },
    })

    if (targetDriver) {
      const driverOrgIds = targetDriver.driverSponsorOrgs.map(dso => dso.Org_ID)
      return driverOrgIds.includes(sponsor.Org_ID)
    }

    const targetSponsor = await prisma.sponsor.findUnique({
      where: { User_ID: targetUserId },
      select: { Org_ID: true },
    })

    return targetSponsor?.Org_ID === sponsor.Org_ID
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
        User_ID: true,
        Username: true,
        Email: true,
        Phone: true,
        User_Type: true,
        twoFactorEnabled: true,
        Sponsor: {
          select: {
            Sponsor_Org: {
              select: {
                Org_ID: true,
                Org_Name: true,
              },
            },
          },
        },
        Driver: {
          select: {
            driverSponsorOrgs: {
              select: {
                Org_ID: true,
                Sponsor_Org: {
                  select: {
                    Org_ID: true,
                    Org_Name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const response: Record<string, unknown> = {
      User_ID: user.User_ID,
      Username: user.Username,
      Email: user.Email,
      Phone: user.Phone,
      User_Type: user.User_Type,
      twoFactorEnabled: user.twoFactorEnabled
    }

    if (user.User_Type === "S") {
      if (user.Sponsor?.Sponsor_Org) {
        response.Org_ID = user.Sponsor.Sponsor_Org.Org_ID
        response.Org_Name = user.Sponsor.Sponsor_Org.Org_Name
      }
    } else if (user.User_Type === "D") {
      const joinedOrganizations = user.Driver?.driverSponsorOrgs?.map(
        (dso: { Org_ID: number; Sponsor_Org: { Org_ID: number; Org_Name: string } }) => ({
          Org_ID: dso.Sponsor_Org.Org_ID,
          Org_Name: dso.Sponsor_Org.Org_Name,
        })
      ) ?? []
      response.joinedOrganizations = joinedOrganizations
    }

    return NextResponse.json(response)
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

    const currentUser = await prisma.user.findUnique({
      where: { User_ID: Number(userId) },
      select: { Email: true, Username: true },
    })

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

    if (currentUser?.Email) {
      await sendAccountInfoChangedEmail(currentUser.Email, currentUser.Username)
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("PUT /api/user/[userId] error:", error)
    return NextResponse.json(
      { error: "Error updating user info" },
      { status: 500 }
    )
  }
}