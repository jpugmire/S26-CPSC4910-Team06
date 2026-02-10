import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 10)

    //create test admin
    const administrator = await prisma.user.create({
        data: {
            Username: "testadmin",
            Password: hashedPassword,
            Status: 'A',
            User_Type: 'A',
            Admin: {
                create: {}
            }
        }
    })

    console.log("test admin created.")
    console.log("Username: " + administrator.Username + ", password: admin123")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())