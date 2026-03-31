import { POST } from "@/app/api/auth/register/route"
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
        sponsor: {
            findUnique: jest.fn()
        }
    }
}))

jest.mock("bcryptjs", () => ({
    hash: jest.fn().mockResolvedValue("hashedpassword")
}))

const registerUrl = "http://localhost/api/auth/register"

describe("POST /api/auth/register", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects unauthenticated users", async () => {
        mockAuth.mockResolvedValue(null)

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "test", password: "pass", userType: "D" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not logged in.")
    })

    it("rejects non-admin users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "test", password: "pass", userType: "D" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized.")
    })

    it("rejects missing required fields", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "test" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Username, password, and userType are required")
    })

    it("rejects invalid userType", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "test", password: "pass", email: "test@test.com", userType: "X" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("userType must be 'D' (Driver), 'S' (Sponsor), or 'A' (Admin)")
    })

    it("rejects duplicate username", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ Username: "testuser" })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "testuser", password: "pass", email: "test@test.com", userType: "A" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Username already exists")
    })

    it("rejects missing sponsorOrgId for driver", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newuser", password: "pass", email: "new@test.com", userType: "D" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Sponsor organization required")
    })

    it("creates driver user successfully", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.user.create as jest.Mock).mockResolvedValue({ User_ID: 123, Username: "newdriver" })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newdriver", password: "pass", email: "driver@test.com", userType: "D", sponsorOrgId: 1 }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("User created successfully")
        expect(data.userId).toBe(123)
    })

    it("creates admin user successfully", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.user.create as jest.Mock).mockResolvedValue({ User_ID: 124, Username: "newadmin" })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newadmin", password: "pass", email: "admin@test.com", userType: "A" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("User created successfully")
    })

    it("handles database errors", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "A" } })
        ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"))

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "test", password: "pass", email: "test@test.com", userType: "A" }),
            headers: { "Content-Type": "application/json" }
        }))

        expect(response.status).toBe(500)
    })
})

describe("POST /api/auth/register (Sponsor)", () => {
    const mockSponsor = { User_ID: 1, Org_ID: 10 }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("rejects driver users", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "D" } })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "test", password: "pass", userType: "D" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Not authorized.")
    })

    it("allows sponsor to create driver in their org", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.user.create as jest.Mock).mockResolvedValue({ User_ID: 200, Username: "newdriver" })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newdriver", password: "pass", userType: "D" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("User created successfully")
        expect(data.userId).toBe(200)
    })

    it("allows sponsor to create sponsor user in their org", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(mockSponsor)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.user.create as jest.Mock).mockResolvedValue({ User_ID: 201, Username: "newsponsor" })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newsponsor", password: "pass", userType: "S" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.message).toBe("User created successfully")
        expect(data.userId).toBe(201)
    })

    it("rejects sponsor creating admin user", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newadmin", password: "pass", userType: "A" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Sponsors cannot create admin users.")
    })

    it("rejects sponsor if org not found", async () => {
        mockAuth.mockResolvedValue({ user: { id: "1", role: "S" } })
        ;(prisma.sponsor.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await POST(new NextRequest(registerUrl, {
            method: "POST",
            body: JSON.stringify({ username: "newuser", password: "pass", userType: "D" }),
            headers: { "Content-Type": "application/json" }
        }))
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe("Sponsor organization not found.")
    })
})
