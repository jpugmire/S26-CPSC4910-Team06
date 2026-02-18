import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminPanel from '@/components/admin-panel'

//mock fetch
global.fetch = jest.fn()

beforeEach(() => {
    (fetch as jest.Mock).mockReset()
})

describe('AdminPanel', () => {
    it('renders the table headers', async () => {
        //mock both fetch calls component makes (users, sponsors)
        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ users: [] })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sponsorOrgs: [] })
            })
        render (<AdminPanel />)

        expect(screen.getByText('ID')).toBeInTheDocument()
        expect(screen.getByText('Username')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Type')).toBeInTheDocument()
        expect(screen.getByText('Sponsor Name')).toBeInTheDocument()
    })

    it('displays error on failed user fetch', async () => {
        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Failed to fetch users' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sponsorOrgs: [] })
            })
        render(<AdminPanel />)

        // findByText waits for the element to appear (async)
        expect(await screen.findByText('Failed to fetch users' )).toBeInTheDocument()
    })

    it('displays error on failed sponsor fetch', async () => {
        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async() => ({ users: [] })
            })
            .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Failed to fetch sponsors' })
            })
        render(<AdminPanel />)

        expect(await screen.findByText('Failed to fetch sponsors')).toBeInTheDocument()
    })
})