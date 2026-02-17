// app/api/admin/deactivate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 })
    }

    if (session?.user?.role !== "A") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 })
    }

    const userId = Number(body.User_ID)

    if (!body.User_ID || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Valid User ID required." }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { User_ID: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 })
    }

    await prisma.user.update({
      where: { User_ID: userId },
      data: { Status: "D" },
    })

    return NextResponse.json(
      { message: "User status updated successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json(
      { error: "An error occurred during user status update" },
      { status: 500 }
    )
  }
}
