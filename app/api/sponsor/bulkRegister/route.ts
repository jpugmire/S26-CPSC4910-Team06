import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { parse } from "csv-parse/sync";
import { registerUser } from "@/lib/registerUser";
import { prisma } from "@/lib/prisma";

type CsvRow = {
  Username: string;
  Password: string;
  UserType: "D" | "S";
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

    const sponsor = await prisma.sponsor.findUnique({
      where: { User_ID: Number(session.user?.id) },
    });

    if (!sponsor || !sponsor.Org_ID) {
      return NextResponse.json(
        { error: "Sponsor organization not found." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "CSV file is required" },
        { status: 400 }
      );
    }

    const text = await file.text();

    const rows = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CsvRow[];

    const results: {
      row: number;
      username?: string;
      status: "success" | "error";
      message: string;
    }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        await registerUser({
          username: row.Username,
          password: row.Password,
          userType: row.UserType,
          sponsorOrgId: sponsor.Org_ID,
        });

        results.push({
          row: rowNumber,
          username: row.Username,
          status: "success",
          message: `${row.UserType === "D" ? "Driver" : "Sponsor"} created`,
        });
      } catch (error) {
        results.push({
          row: rowNumber,
          username: row.Username,
          status: "error",
          message: error instanceof Error ? error.message : "Failed to create user",
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
    console.error("Bulk upload error:", error);

    return NextResponse.json(
      { error: "An error occurred during bulk upload" },
      { status: 500 }
    );
  }
}
