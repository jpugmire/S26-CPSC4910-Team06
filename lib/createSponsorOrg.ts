// lib/createSponsorOrg.ts
import { prisma } from "@/lib/prisma";

type CreateSponsorInput = {
  Org_Name: string;
};

export async function createSponsorOrg({
  Org_Name,
}: CreateSponsorInput) {
  if (!Org_Name) {
    console.log(Org_Name);
    throw new Error("Organization name is required.");
  }

  const org = await prisma.sponsor_Org.create({
    data: {
      Org_Name: Org_Name
    },
  });

  return org;
}