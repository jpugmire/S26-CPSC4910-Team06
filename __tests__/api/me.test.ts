import { GET } from '@/app/api/me/route'
import { PUT } from '@/app/api/me/route'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse} from 'next/server'

//mock prisma response
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn().mockResolvedValue({
                Username: 'testuser',
                Email: 'testuseremail@email.com',
                Phone: '1234567890',
                User_Type: 'S',
                Sponsor: {
                    Sponsor_Org: {
                        Org_Name: 'testOrganization'
                    }
                }
            }),
            update: jest.fn().mockResolvedValue({
                Username: 'testuser',
                Email: 'testuserupdated@email.com',
                Phone: '0000000000',
            })
        }
    }
}))

//mock auth
const mockAuth = jest.fn()
jest.mock('@/auth', () => ({
    auth:(...args: unknown[]) => mockAuth(...args)
}))

const nextRequestUrl = 'http://localhost/api/me'

//tests
describe('GET /api/me', () => {
    it('rejects unauthenticated users', async () => {
        mockAuth.mockResolvedValue({ user: { id: null, role: 'D' } });

        const response = await GET(new NextRequest(nextRequestUrl))
        const data = await response.json()
        expect(response.status).toBe(401)
        expect(data.error).toBe('Not authenticated')
    })

    it('returns user info on valid ID entered for authenticated user', async () => {
        mockAuth.mockResolvedValue({ user: {id: '001' } })

        const response = await GET(new NextRequest(nextRequestUrl))
        const data = await response.json()
        expect(response.status).toBe(200)
        expect(data.Username).toBe('testuser')
        expect(data.Email).toBe('testuseremail@email.com')
        expect(data.Phone).toBe('1234567890')
        expect(data.Org_Name).toBe('testOrganization')
    })

    it('catches error fetching info', async () => {
        mockAuth.mockResolvedValue({ user: {id: '001' } });
        (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB connection failed'))

        const response = await GET(new NextRequest(nextRequestUrl))
        const data = await response.json()
        expect(response.status).toBe(500)
        expect(data.error).toBe('Error fetching user info')
    })

    it('reports user not found for bad ID', async () => {
        mockAuth.mockResolvedValue({ user: { id: '001', role: 'D' } });
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null)

        const response = await GET(new NextRequest(nextRequestUrl))
        const data = await response.json()
        expect(response.status).toBe(404)
        expect(data.error).toBe('User not found')
    })
})

describe('PUT /api/me', () => {
    it('rejects unauthenticated users', async () => {
        mockAuth.mockResolvedValue(null);

        const response = await PUT(new NextRequest(nextRequestUrl))
        const data = await response.json()
        expect(response.status).toBe(401)
        expect(data.error).toBe('Not authenticated')
    })

    it('returns error if error in db operation', async () => {
        mockAuth.mockResolvedValue({ user: { id: '001' } });
        (prisma.user.update as jest.Mock).mockRejectedValueOnce(new Error('DB connection failed'))

        const response = await PUT(new NextRequest(nextRequestUrl, {
            method: 'PUT',
            body: JSON.stringify({ email: 'blah', phone: '1'}),
            headers: { 'Content-Type': 'application/json' }
        }))
        const data = await response.json()
        expect(response.status).toBe(500)
        expect(data.error).toBe('Error updating user info')
    })

    it('updates user info when authenticated', async () => {
        mockAuth.mockResolvedValue({ user: { id: '001' } })
        
        const response = await PUT(new NextRequest(nextRequestUrl, {
            method: 'PUT',
            body: JSON.stringify({ email: 'testuserupdated@email.com', phone: '0000000000' }),
            headers: { 'Content-Type': 'application/json' }
        }))
        const data = await response.json()
        expect(response.status).toBe(200)
        expect(data.Email).toBe('testuserupdated@email.com')
        expect(data.Phone).toBe('0000000000')
    })

})