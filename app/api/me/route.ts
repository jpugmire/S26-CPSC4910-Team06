import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = Number(session.user.id)

    const user = await prisma.user.findUnique({
      where: { User_ID: userId },
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
            driverSponsorOrgs: {
              select: {
                Org_ID: true,
                Point_Count: true,
                Sponsor_Org: {
                  select: {
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

    let orgName = null

    if (user.User_Type === "S") {
      orgName = user.Sponsor?.Sponsor_Org?.Org_Name ?? null
    } else if (user.User_Type === "D") {
      orgName = user.Driver?.driverSponsorOrgs?.[0]?.Sponsor_Org?.Org_Name ?? null
    }

    return NextResponse.json({
      Username: user.Username,
      Email: user.Email,
      Phone: user.Phone,
      User_Type: user.User_Type,
      Org_Name: orgName,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching user info" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const { email, phone } = await req.json()

    const existingUser = await prisma.user.findFirst({
      where: {
        Status: "A",
        User_ID: {
          not: userId,
        },
        OR: [
          { Email: email },
          { Phone: phone },
        ],
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
    return NextResponse.json(
      { error: "Error updating user info" },
      { status: 500 }
    )
  }
}