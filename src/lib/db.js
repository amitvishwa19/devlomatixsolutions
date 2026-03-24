import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    console.log('Initializing Prisma Client...');
    const connectionString = process.env.APP_MODE === 'prod' ? process.env.DATABASE_URL : process.env.DIRECT_URL
    console.log('Using connection string:', connectionString ? connectionString.split('@')[1] : 'UNDEFINED'); // Log only host part for security
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    console.log('Prisma adapter created.');
    return new PrismaClient({ adapter })
}

global.prismaGlobal = global.prismaGlobal || prismaClientSingleton();

export const db = global.prismaGlobal;




if (process.env.APP_MODE !== 'prod') globalThis.prismaGlobal = db