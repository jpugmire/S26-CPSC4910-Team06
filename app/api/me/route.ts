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