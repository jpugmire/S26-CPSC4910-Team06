import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

async function canAccessUser(
  sessionUserId: number,
  sessionUserRole: string,
  targetUserId: number
) {
  if (sessionUserRole === "A") return true
  if (sessionUserId === targetUserId) return true

  if (sessionUserRole === "S") {
    const sponsor = await prisma.sponsor.findUnique({
      where: { User_ID: sessionUserId },
      select: { Org_ID: true },
    })

    if (!sponsor?.Org_ID) return false

    const [targetDriver, targetSponsor] = await Promise.all([
      prisma.driver.findUnique({
        where: { User_ID: targetUserId },
        select: {
          driverSponsorOrgs: {
            select: { Org_ID: true },
          },
        },
      }),
      prisma.sponsor.findUnique({
        where: { User_ID: targetUserId },
        select: { Org_ID: true },
      }),
    ])

    const targetDriverOrgIds =
      targetDriver?.driverSponsorOrgs.map((dso) => dso.Org_ID) ?? []

    const targetSponsorOrgId = targetSponsor?.Org_ID ?? null

    if (targetSponsorOrgId !== null) {
      return sponsor.Org_ID === targetSponsorOrgId
    }

    return targetDriverOrgIds.includes(sponsor.Org_ID)
  }

  return false
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = Number(params.userId)

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const authorized = await canAccessUser(
      Number(session.user.id),
      session.user.role,
      userId
    )

    if (!authorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { User_ID: userId },
      select: {
        User_ID: true,
        Username: true,
        Email: true,
        Phone: true,
        User_Type: true,
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
                Point_Count: true,
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
    }

    if (user.User_Type === "S" && user.Sponsor?.Sponsor_Org) {
      response.Org_ID = user.Sponsor.Sponsor_Org.Org_ID
      response.Org_Name = user.Sponsor.Sponsor_Org.Org_Name
    }

    if (user.User_Type === "D") {
      response.joinedOrganizations =
        user.Driver?.driverSponsorOrgs.map((dso) => ({
          Org_ID: dso.Sponsor_Org.Org_ID,
          Org_Name: dso.Sponsor_Org.Org_Name,
          Point_Count: dso.Point_Count,
        })) ?? []
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = Number(params.userId)

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const authorized = await canAccessUser(
      Number(session.user.id),
      session.user.role,
      userId
    )

    if (!authorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { email, phone } = await req.json()

    const existingUser = await prisma.user.findFirst({
      where: {
        Status: "A",
        User_ID: { not: userId },
        OR: [{ Email: email }, { Phone: phone }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or phone already in use by another active user" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { User_ID: userId },
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