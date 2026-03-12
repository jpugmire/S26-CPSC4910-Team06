import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user?.role;
  if (role !== "S" && role !== "A") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const typeParams = req.nextUrl.searchParams.getAll("type");
  const typeIds = typeParams.map(Number).filter((n) => !isNaN(n));
  if (typeIds.length === 0) {
    return NextResponse.json({ error: "No types provided" }, { status: 400 });
  }

  const orgIdParam = req.nextUrl.searchParams.get("orgId");
  const orgId = orgIdParam ? Number(orgIdParam) : null;

  const minDateParam = req.nextUrl.searchParams.get("minDate");
  const maxDateParam = req.nextUrl.searchParams.get("maxDate");
  
  // Parse dates explicitly to handle YYYY-MM-DD format consistently
  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  
  if (minDateParam) {
    const [year, month, day] = minDateParam.split('-').map(Number);
    minDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  
  if (maxDateParam) {
    const [year, month, day] = maxDateParam.split('-').map(Number);
    maxDate = new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  let userIdsInOrg: number[] | null = null;

  if (orgId != null) {
    // Get all User_IDs belonging to this org (sponsors + drivers)
    const [sponsors, drivers] = await Promise.all([
      prisma.sponsor.findMany({ where: { Org_ID: orgId }, select: { User_ID: true } }),
      prisma.driver.findMany({ where: { Org_ID: orgId }, select: { User_ID: true } }),
    ]);
    userIdsInOrg = [
      ...sponsors.map((s) => s.User_ID),
      ...drivers.map((d) => d.User_ID),
    ];
  }

  const rows = await prisma.audit.findMany({
    where: {
      Message_Type_ID: { in: typeIds },
      ...(userIdsInOrg != null ? { User_ID: { in: userIdsInOrg } } : {}),
      ...(minDate || maxDate ? {
        Date_Created: {
          ...(minDate ? { gte: minDate } : {}),
          ...(maxDate ? { lte: maxDate } : {}),
        },
      } : {}),
    },
    orderBy: { Date_Created: "desc" },
  });

  return NextResponse.json(rows);
}