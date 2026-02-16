// scripts/create-test-user.ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create a test driver
  const driver = await prisma.user.upsert({
    where: { Username: "testdriver" },
    update: {}, //already exists, do nothing
    create: {
      Username: "testdriver",
      Password: hashedPassword,
      Status: "A",
      User_Type: "D",
      Driver: {
        create: {
          Point_Count: 100,
        },
      },
    },
  })

  // Create a test sponsor
  const sponsor = await prisma.user.upsert({
    where: { Username: "testsponsor" },
    update: {},
    create: {
      Username: "testsponsor",
      Password: hashedPassword,
      Status: "A",
      User_Type: "S",
      Sponsor: {
        create: {},
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
