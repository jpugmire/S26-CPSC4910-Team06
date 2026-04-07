// scripts/create-test-user.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create a test driver
  let driver = await prisma.user.findUnique({
    where: { Username: "testdriver" },
  })

  if (!driver) {
    driver = await prisma.user.create({
      data: {
        Username: "testdriver",
        Password: hashedPassword,
        Status: "A",
        User_Type: "D",
      },
    })

    await prisma.driver.create({
      data: {
        User_ID: driver.User_ID,
      },
    })
  }

  // Create a test sponsor
  let sponsor = await prisma.user.findUnique({
    where: { Username: "testsponsor" },
  })

  if (!sponsor) {
    sponsor = await prisma.user.create({
      data: {
        Username: "testsponsor",
        Password: hashedPassword,
        Status: "A",
        User_Type: "S",
      },
    })

    await prisma.sponsor.create({
      data: {
        User_ID: sponsor.User_ID,
      },
    })
  }

  console.log("Test users created:")
  console.log("Driver - username: testdriver, password: password123")
  console.log("Sponsor - username: testsponsor, password: password123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
