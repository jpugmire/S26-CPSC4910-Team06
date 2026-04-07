// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { registerUser } from "@/lib/registerUser";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, password, userType, sponsorOrgId } = await req.json();
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Not logged in." }, { status: 400 });
    }

    const role = session.user?.role;

    if (role === "A") {
      const user = await registerUser({
        username,
        password,
        userType,
        sponsorOrgId: sponsorOrgId ? Number(sponsorOrgId) : undefined,
      });

      return NextResponse.json(
        {
          message: "User created successfully",
          userId: user.User_ID,
        },
        { status: 201 }
      );
    }

    if (role === "S") {
      if (userType === "A") {
        return NextResponse.json(
          { error: "Sponsors cannot create admin users." },
          { status: 400 }
        );
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

      const user = await registerUser({
        username,
        password,
        userType,
        sponsorOrgId: sponsor.Org_ID,
      });

      return NextResponse.json(
        {
          message: "User created successfully",
          userId: user.User_ID,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Not authorized." }, { status: 400 });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error) {
      if (
        error.message === "Username, password, and userType are required" ||
        error.message === "userType must be 'D' (Driver), 'S' (Sponsor), or 'A' (Admin)" ||
        error.message === "Sponsor organization required" ||
        error.message === "Username already exists"
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}