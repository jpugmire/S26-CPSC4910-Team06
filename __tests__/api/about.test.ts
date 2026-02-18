import { GET } from '@/app/api/about/route'

jest.mock('a/lib/prisma', () => ({
    prisma: {
        version: {
            findFirst: jest.fn().mockResolvedValue({
                VersionNum: '1.0.0',
                VersionCreated: new Date('2025-01-01'),
            }),
        }
    }
}))

describe('GET /api/about', () => {
    it('returns version info', async () => {
        const response = await GET()
        const data = await response.json()

        expect(response.status).toBe(200)
        
    })
})