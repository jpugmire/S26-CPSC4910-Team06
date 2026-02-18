import { POST } from '@/app/api/admin/deactivate/route'
import { prisma } from '@/lib/prisma'

//mock prisma response
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn().mockResolvedValue(
                { User_ID: 1, Username: 'testuser', Status: 'A', User_Type: 'D' }
            ),
            update: jest.fn().mockResolvedValue(
                { User_ID: 1, Username: 'testuser', Status: 'D', User_Type: 'D' }
            )
        }
    }

}))

//mock auth
const mockAuth = jest.fn()
jest.mock('@/auth', () => ({
    auth:(...args: unknown[]) => mockAuth(...args)
}))

//mock request

//tests
describe('POST /api/admin/deactivate', () => {
    //error if no session
    it('rejects if not logged in', async () => {
        mockAuth.mockResolvedValue(null)

        const req = new Request('http://localhost/api/admin/deactivate', {
            method: 'POST',
            body: JSON.stringify({ User_ID: 1 })
        }) as any

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Not logged in.')

    })

    //error if user not admin
    it('rejects non-admin users', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'D' } })

        const req = new Request('http://localhost/api/admin/deactivate', {
            method: 'POST',
            body: JSON.stringify({ User_ID: 1 })
        }) as any

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Not authorized.')
    })

    //error if invalid user ID
    it('rejects invalid user ID', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'A' } })

        const req = new Request('http://localhost/api/admin/deactivate', {
            method: 'POST',
            body: JSON.stringify({ User_ID: 'abc' })
        }) as any

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Valid User ID required.')
    })

    //error if no user ID passed
    it('rejects missing user ID', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'A' } })

        const req = new Request('http://localhost/api/admin/deactivate', {
            method: 'POST',
            body: JSON.stringify({})
        }) as any

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Valid User ID required.')
    })

    //error on no users returned
    it('rejects if user does not exist', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'A' } });
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null)

        const req = new Request('http://localhost/api/admin/deactivate', {
            method: 'POST',
            body: JSON.stringify({ User_ID: 999})
        }) as any

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('User does not exist')
    })

    //update user success
    it('updates valid user ID for admin', async () => {
        mockAuth.mockResolvedValue({ user: { role: 'A' } });

        const req = new Request('http://localhost/api/admin/deactivate', {
            method: 'POST',
            body: JSON.stringify({ User_ID: 1 })
        }) as any

        const response = await POST(req)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { User_ID: 1 },
            data: { Status: 'D' }
        })
        expect(data.message).toBe('User status updated successfully.')
    })
})