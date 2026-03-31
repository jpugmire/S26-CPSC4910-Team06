// lib/registerUser.ts
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type RegisterUserInput = {
  username: string;
  password: string;
  userType: "D" | "S" | "A";
  sponsorOrgId?: number;
};

export async function registerUser({
  username,
  password,
  userType,
  sponsorOrgId,
}: RegisterUserInput) {
  if (!username || !password || !userType) {
    console.log(username);
    console.log(password);
    console.log(userType);
    throw new Error("Username, password, and userType are required");
  }

  if (!["D", "S", "A"].includes(userType)) {
    throw new Error("userType must be 'D' (Driver), 'S' (Sponsor), or 'A' (Admin)");
  }

  if ((userType === "S" || userType === "D") && !sponsorOrgId) {
    throw new Error("Sponsor organization required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { Username: username },
  });

  if (existingUser) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      Username: username,
      Password: hashedPassword,
      Status: "A",
      User_Type: userType,
      ...(userType === "D"
        ? {
            Driver: {
              create: {
                Point_Count: 0,
                driverSponsorOrgs: {
                  create: {
                    Org_ID: sponsorOrgId!,
                    Point_Count: 0,
                  },
                },
              },
            },
          }
        : userType === "S"
        ? {
            Sponsor: {
              create: {
                Org_ID: sponsorOrgId!,
              },
            },
          }
        : {
            Admin: {
              create: {},
            },
          }),
    },
  });

  return user;
}