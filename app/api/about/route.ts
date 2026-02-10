import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const version = await prisma.version.findFirst({
    orderBy: { VersionCreated: "asc" },
  })

  return NextResponse.json({
    message: "About Page!",
    version: version?.VersionNum,
    created: version?.VersionCreated,
  })
}
