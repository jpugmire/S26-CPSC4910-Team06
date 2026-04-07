// app/api/sponsor/register/driver/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { registerUser } from "@/lib/registerUser"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 })
    }

    if (session.user.role !== "S") {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 })
    }

    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 })
    }

    const sponsor = await prisma.sponsor.findUnique({
      where: { User_ID: Number(session.user.id) },
      select: { Org_ID: true },
    })

    if (!sponsor?.Org_ID) {
      return NextResponse.json({ error: "Sponsor has no organization." }, { status: 400 })
    }

    const user = await registerUser({
      username,
      password,
      userType: "D",
      sponsorOrgId: sponsor.Org_ID,
    })

    return NextResponse.json(
      { message: "Driver created successfully.", userId: user.User_ID },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred during registration."
    const validationErrors = ["Username, password, and userType are required", "Username already exists"]
    const isValidation = validationErrors.includes(message)
    return NextResponse.json({ error: message }, { status: isValidation ? 400 : 500 })
  }
}
