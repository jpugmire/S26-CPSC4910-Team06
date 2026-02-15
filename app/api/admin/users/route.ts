// app/api/admin/users/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
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

    // Find all users.
    const users = await prisma.user.findMany({
      select: {
        User_ID: true,
        Username: true,
        Status: true,
        User_Type: true,
      },
    })

    return NextResponse.json(
      {
        message: "Successfully fetched all users.",
        users: users,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json(
      { error: "An error occurred." },
      { status: 500 }
    )
  }
}