import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { parse } from "csv-parse/sync";
import { updatePoints } from "@/lib/updatePoints";

type CsvRow = {
  Username: string;
  PointCount: number;
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 });
    }

    if (session.user?.role !== "S") {
      return NextResponse.json({ error: "Not authorized." }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const text = await file.text();

    const rows = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CsvRow[];

    const results: {
      row: Number;
      Username: string;
      PointCount: Number;
      status: "success" | "error";
      message: string;
    }[] = [];

    const sponsorUserId = Number(session.user.id);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        await updatePoints({
          username: row.Username,
          pointCount: row.PointCount,
          sponsorUserId: sponsorUserId,
        });

        results.push({
          row: rowNumber,
          Username: row.Username,
          PointCount: row.PointCount,
          status: "success",
          message: "Points updated.",
        });
      } catch (error) {
        results.push({
          row: rowNumber,
          Username: row.Username,
          PointCount: row.PointCount,
          status: "error",
          message: error instanceof Error ? error.message : "Failed to update points.",
        });
      }
    }

    return NextResponse.json({
      summary: {
        total: rows.length,
        created: results.filter((r) => r.status === "success").length,
        failed: results.filter((r) => r.status === "error").length,
      },
      results,
    });
  } catch (error) {
    console.error("Bulk update error:", error);

    return NextResponse.json(
      { error: "An error occurred during bulk update" },
      { status: 500 }
    );
  }
}