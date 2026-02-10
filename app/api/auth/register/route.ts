// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { username, password, email, role } = await req.json()

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role: role || "DRIVER",
        ...(role === "DRIVER"
          ? {
              driverProfile: {
                create: {
                  pointsBalance: 0,
                },
              },
            }
          : role === "SPONSOR"
          ? {
              sponsorProfile: {
                create: {
                  companyName: username, // Default, can be updated later
                },
              },
            }
          : {}),
      },
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: user.id,
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