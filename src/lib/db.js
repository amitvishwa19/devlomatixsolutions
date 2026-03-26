import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    const connectionString = process.env.APP_MODE === 'prod' ? process.env.DATABASE_URL : process.env.DIRECT_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

global.prismaGlobal = global.prismaGlobal || prismaClientSingleton();

export const db = global.prismaGlobal;




if (process.env.APP_MODE !== 'prod') globalThis.prismaGlobal = db