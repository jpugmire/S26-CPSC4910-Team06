import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAccountInfoChangedEmail } from "@/lib/email"

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
    let joinedOrganizations: string[] = []
    if (user.User_Type === "S") {
      orgName = user.Sponsor?.Sponsor_Org?.Org_Name ?? null
    } else if (user.User_Type === "D") {
      joinedOrganizations = user.Driver?.driverSponsorOrgs?.map((d: { Sponsor_Org: { Org_Name: string } }) => d.Sponsor_Org?.Org_Name).filter(Boolean) as string[] ?? []
      orgName = joinedOrganizations[0] ?? null
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

    const currentUser = await prisma.user.findUnique({
      where: { User_ID: userId },
      select: { Email: true, Username: true },
    })

    // Check if another ACTIVE user already has this email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        Status: "A",            // Only active users
        User_ID: {
          not: userId,          // Exclude current user
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

    // If no conflict, update user
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

    if (currentUser?.Email) {
      sendAccountInfoChangedEmail(currentUser.Email, currentUser.Username).catch(() => {})
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating user info" },
      { status: 500 }
    )
  }
}