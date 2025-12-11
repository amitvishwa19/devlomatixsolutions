import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Check if prisma already exists globally
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
        log: ['warn', 'error']
    })
}

module.exports = globalForPrisma.prisma