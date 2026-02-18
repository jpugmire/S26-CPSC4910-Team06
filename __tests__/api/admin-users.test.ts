import { GET } from '@/app/api/admin/users/route'

jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findMany: jest.fn().mockResolvedValue([
                { User_ID: 1, Username: 'testuser', Status: 'A', User_Type: 'D' },
            ])
        }
    }
}))

//Mock auth
const mockAuth = jest.fn()
jest.mock('@/auth', () => ({
    auth: (...args: unknown[]) => mockAuth(...args)
}))

describe('GET /api/admin/users', () => {
    it('rejects unauthenticated requests', async() => {
        mockAuth.mockResolvedValue(null)

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Not logged in.')
    })

    it('rejects non-admin users', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'D' } })

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Not authorized.')
    })

    it('returns users for admin', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'A' } })

        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.users).toHaveLength(1)
        expect(data.users[0].Username).toBe('testuser')
    })
})