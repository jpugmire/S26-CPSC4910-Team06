import { GET } from '@/app/api/me/route'
import { prisma } from '@/lib/prisma'
import { NextRequest} from 'next/server'

//mock prisma response
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn().mockResolvedValue({
                Username: 'testuser',
                Email: 'testuseremail@email.com',
                Phone: 1234567890,
                Sponsor: {
                    Sponsor_Org: {
                        Org_Name: 'testOrganization'
                    }
                }
            })
        }
    }
}))

//mock auth
const mockAuth = jest.fn()
jest.mock('@/auth', () => ({
    auth:(...args: unknown[]) => mockAuth(...args)
}))

//tests
describe('GET /api/me', () => {
    it('reports user not found for bad ID', async () => {
        mockAuth.mockResolvedValue({ user: { id: '001', role: 'D' } })
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null)

        const response = await GET(new NextRequest('http://localhost/api/me'))
        const data = await response.json()
        expect(response.status).toBe(404)
        expect(data.error).toBe('User not found')
    })
})