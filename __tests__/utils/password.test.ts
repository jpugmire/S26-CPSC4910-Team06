import bcrypt from 'bcryptjs'

describe('password hashing', () => {
    it('hashed password matches original', async () => {
        const password = 'testPassword123'
        const hash = await bcrypt.hash(password, 10)

        expect(await bcrypt.compare(password, hash)).toBe(true)
    })

    it('wrong password does not match', async () => {
        const hash = await bcrypt.hash('correct', 10)

        expect(await bcrypt.compare('wrong', hash)).toBe(false)
    })
})