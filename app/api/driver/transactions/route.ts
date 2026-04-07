import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "D") {
      return NextResponse.json({ error: "Not authorized" }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const orgIdParam = searchParams.get("orgId")
    const limit = parseInt(searchParams.get("limit") || "5", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    const orgId = orgIdParam ? parseInt(orgIdParam, 10) : null

    const whereClause: Record<string, unknown> = {
      User_ID: parseInt(session.user.id),
    }

    if (orgId !== null) {
      whereClause.Catalog_Item = {
        Catalog_Listing: {
          some: {
            Catalog: {
              Org_ID: orgId,
            },
          },
        },
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.point_Transaction.findMany({
        where: whereClause,
        include: {
          Catalog_Item: {
            select: {
              Item_Name: true,
              Point_Price: true,
              Catalog_Listing: {
                include: {
                  Catalog: {
                    select: {
                      Org_ID: true,
                      Sponsor_Org: {
                        select: {
                          Org_Name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { Transaction_Date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.point_Transaction.count({ where: whereClause }),
    ])

    const formattedTransactions = transactions.map((t) => {
      const catalogListing = t.Catalog_Item.Catalog_Listing[0]
      const orgInfo = catalogListing?.Catalog.Sponsor_Org
      return {
        Transaction_ID: t.Transaction_ID,
        Org_ID: catalogListing?.Catalog.Org_ID ?? null,
        Org_Name: orgInfo?.Org_Name ?? "Unknown",
        Item_Name: t.Catalog_Item.Item_Name,
        Point_Cost: t.Catalog_Item.Point_Price ?? 0,
        Transaction_Date: t.Transaction_Date,
      }
    })

    return NextResponse.json({
      transactions: formattedTransactions,
      total,
      hasMore: offset + limit < total,
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching driver transactions:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
