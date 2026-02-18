import { GET } from '@/app/api/admin/sponsors/route'

//mock prisma response of 1 sponsor user
jest.mock('@/lib/prisma', () => ({
    prisma: {
        sponsor_Org: {
            findMany: jest.fn().mockResolvedValue([
                { Org_ID: 1, Org_Name: 'testsponsor'}
            ])
        }
    }
}))

//mock auth
const mockAuth = jest.fn()
jest.mock('@/auth', () => ({
    auth:(...args: unknown[]) => mockAuth(...args)
}))

//tests
describe('GET /api/admin/sponsors', () => {
    it('rejects unauthenticated requests', async () => {
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
        expect(data.sponsorOrgs).toHaveLength(1)
        expect(data.sponsorOrgs[0].Org_Name).toBe('testsponsor')
    })
})