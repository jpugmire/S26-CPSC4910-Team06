// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const { username, password, userType, sponsorOrgId } = await req.json()
    const session  = await auth();

    // Validation
    if (!session) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 400 }
      )
    }

    if (session?.user?.role !== 'A') {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 400 }
      )
    }

    if (!username || !password || !userType) {
      return NextResponse.json(
        { error: "Username, password, and userType are required" },
        { status: 400 }
      )
    }

    if (!["D", "S", "A"].includes(userType)) {
      return NextResponse.json(
        { error: "userType must be 'D' (Driver), 'S' (Sponsor), or 'A' (Admin)" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { Username: username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    if ((userType === "S" || userType === "D") && !sponsorOrgId) {
      return NextResponse.json(
        { error: "Sponsor organization required" },
        { status: 400 }
    )}

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        Username: username,
        Password: hashedPassword,
        Status: "A",
        User_Type: userType,
        ...(userType === "D"
          ? {
              Driver: {
                  create: {
                    Point_Count: 0,
                    driverSponsorOrgs: {
                      create: {
                        Org_ID: sponsorOrgId,
                        Point_Count: 0,
                      },
                    },
                  },
              },
            }
          : userType === "S"
          ? {
              Sponsor: {
                create: {
                  Org_ID: sponsorOrgId,
                },
              },
            }
          : userType === "A"
          ? {
              Admin: {
                create: {},
              },
            }
          : {}),
      },
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: user.User_ID,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
