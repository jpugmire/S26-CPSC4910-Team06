// lib/updatePoints.ts
import { prisma } from "@/lib/prisma";

type UpdatePointsInput = {
  username: string;
  pointCount: number;
  sponsorUserId: number;
};

export async function updatePoints({
  username,
  pointCount,
  sponsorUserId,
}: UpdatePointsInput) {
  if (!username?.trim()) {
    throw new Error("Username is required.");
  }

  if (pointCount === undefined || pointCount === null || Number.isNaN(Number(pointCount))) {
    throw new Error("Point count is required.");
  }

  const normalizedPoints = Number(pointCount);

  const sponsor = await prisma.sponsor.findUnique({
    where: { User_ID: sponsorUserId },
    select: { Org_ID: true },
  });

  if (!sponsor) {
    throw new Error("Current user is not a sponsor.");
  }

  const user = await prisma.user.findUnique({
    where: { Username: username.trim() },
    select: {
      User_ID: true,
      User_Type: true,
    },
  });

  if (!user) {
    throw new Error("Username does not exist.");
  }

  if (user.User_Type !== "D") {
    throw new Error("User is not a driver.");
  }

  const driverOrgMembership = await prisma.driver_Sponsor_Org.findUnique({
    where: {
      User_ID_Org_ID: {
        User_ID: user.User_ID,
        Org_ID: Number(sponsor.Org_ID),
      },
    },
    select: {
      User_ID: true,
      Org_ID: true,
      Point_Count: true,
    },
  });

  if (!driverOrgMembership) {
    throw new Error("Driver is not in your sponsor organization.");
  }

  const pointUpdate = await prisma.driver_Sponsor_Org.update({
    where: {
      User_ID_Org_ID: {
        User_ID: user.User_ID,
        Org_ID: Number(sponsor.Org_ID),
      },
    },
    data: {
      Point_Count: { increment: normalizedPoints },
    },
  });

  return pointUpdate;
}