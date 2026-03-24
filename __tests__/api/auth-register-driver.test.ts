import { POST } from "@/app/api/auth/register/driver/route"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

const mockAuth = jest.fn()
jest.mock("@/auth", () => ({
    auth: (...args: unknown[]) => mockAuth(...args)
}))

jest.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn()
        },
        sponsor_Org: {
            findUnique: jest.fn()
        },
        driver_Application: {
            create: jest.fn()
        }
    }
}))

jest.mock("bcryptjs", () => ({
    hash: jest.fn().mockResolvedValue("hashedpassword")
}))

const registerUrl = "http://localhost/api/auth/register/driver"

describe("POST /api/auth/register/driver", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects missing username", async () => {
        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ password: "password123" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Username and password are required")
    })

    it("rejects missing password", async () => {
        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "testuser" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Username and password are required")
    })

    it("rejects short password", async () => {
        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "testuser", password: "12345" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Password must be at least 6 characters")
    })

    it("rejects duplicate username", async () => {
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ Username: "existinguser" })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "existinguser", password: "password123" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Username already exists")
    })

    it("rejects duplicate email", async () => {
        ;(prisma.user.findUnique as jest.Mock)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ Email: "test@example.com" })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newuser", password: "password123", email: "test@example.com" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Email already registered")
    })

    it("creates driver user successfully without application", async () => {
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.user.create as jest.Mock).mockResolvedValue({ User_ID: 123, Username: "newdriver" })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newdriver", password: "password123" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("Driver registered successfully")
        expect(data.userId).toBe(123)
        expect(data.applied).toBe(false)
    })

    it("creates driver user and applies to sponsor org", async () => {
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.user.create as jest.Mock).mockResolvedValue({ User_ID: 124, Username: "newdriver2" })
        ;(prisma.sponsor_Org.findUnique as jest.Mock).mockResolvedValue({ Org_ID: 1, Org_Name: "Test Org" })
        ;(prisma.driver_Application.create as jest.Mock).mockResolvedValue({ Application_ID: 1 })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newdriver2", password: "password123", sponsorOrgId: 1 }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("Driver registered successfully")
        expect(data.userId).toBe(124)
        expect(data.applied).toBe(true)
        expect(prisma.driver_Application.create).toHaveBeenCalledWith({
            data: {
                User_ID: 124,
                Org_ID: 1,
                Status: "P"
            }
        })
    })

    it("does not create application for invalid org", async () => {
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.user.create as jest.Mock).mockResolvedValue({ User_ID: 125, Username: "newdriver3" })
        ;(prisma.sponsor_Org.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newdriver3", password: "password123", sponsorOrgId: 999 }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.applied).toBe(false)
        expect(prisma.driver_Application.create).not.toHaveBeenCalled()
    })

    it("handles database errors", async () => {
        ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"))

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "testuser", password: "password123" }),
            headers: { "Content-Type": "application/json" }
        }))

        expect(response.status).toBe(500)
    })
})
