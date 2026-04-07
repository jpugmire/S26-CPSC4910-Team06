// app/api/admin/impersonate/stop/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 })
  }

  const realRole = session.user.realUserRole ?? session.user.role

  if (realRole !== "A") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}