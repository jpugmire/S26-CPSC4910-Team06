// scripts/create-test-user.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create a test driver
  const hashedPassword = await bcrypt.hash("password123", 10)

  const driver = await prisma.user.create({
    data: {
      username: "testdriver",
      password: hashedPassword,
      email: "driver@test.com",
      role: "DRIVER",
      driverProfile: {
        create: {
          pointsBalance: 100,
        },
      },
    },
  })

  // Create a test sponsor
  const sponsor = await prisma.user.create({
    data: {
      username: "testsponsor",
      password: hashedPassword,
      email: "sponsor@test.com",
      role: "SPONSOR",
      sponsorProfile: {
        create: {
          companyName: "Test Company",
        },
      },
    },
  })

  console.log("Test users created:")
  console.log("Driver - username: testdriver, password: password123")
  console.log("Sponsor - username: testsponsor, password: password123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())