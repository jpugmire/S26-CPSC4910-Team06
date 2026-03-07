import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session || !(session.user?.role == "S" || session.user?.role== "A")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const typeParams = req.nextUrl.searchParams.getAll("type");
  const typeIds = typeParams.map(Number).filter((n) => !isNaN(n));

  if (typeIds.length === 0) {
    return NextResponse.json({ error: "No types provided" }, { status: 400 });
  }

  const rows = await prisma.audit.findMany({
    where: {
      Message_Type_ID: { in: typeIds },
    },
    orderBy: {
      Date_Created: "desc",
    },
  });

  return NextResponse.json(rows);
}