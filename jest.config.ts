import type { Config } from 'jest'

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    projects: [
        {
            displayName: 'api',
            preset: 'ts-jest',
            testEnvironment: 'node',
            testMatch: ['**/__tests__/api/**/*.test.ts'],
            moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
        },
        {
            displayName: 'components',
            preset: 'ts-jest',
            testEnvironment: 'jsdom',
            testMatch: ['**/__tests__/components/**/*.test.tsx'],
            moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' }
        }
    ]
}

export default config