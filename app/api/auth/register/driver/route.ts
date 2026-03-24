// app/api/auth/register/driver/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { username, password, email, phone, sponsorOrgId } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { Username: username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { Email: email },
      })
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        Username: username,
        Password: hashedPassword,
        Status: "A",
        User_Type: "D",
        Email: email,
        Phone: phone,
        Driver: {
          create: {
            Point_Count: 0,
            Org_ID: null,
          },
        },
      },
    })

    let applicationCreated = false
    if (sponsorOrgId) {
      const orgExists = await prisma.sponsor_Org.findUnique({
        where: { Org_ID: sponsorOrgId },
      })

      if (orgExists) {
        await prisma.driver_Application.create({
          data: {
            User_ID: user.User_ID,
            Org_ID: sponsorOrgId,
            Status: "P",
          },
        })
        applicationCreated = true
      }
    }

    return NextResponse.json(
      {
        message: "Driver registered successfully",
        userId: user.User_ID,
        applied: applicationCreated,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Driver registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
