import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    const connectionString = process.env.APP_MODE === 'prod' ? process.env.DATABASE_URL : process.env.DIRECT_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

// Store the singleton on the global object to prevent multiple instances in dev
const getBaseDb = () => {
    if (!global.prismaGlobal) {
        global.prismaGlobal = prismaClientSingleton();
    }
    
    // Self-healing: If the client was initialized before the new models existed
    if (!global.prismaGlobal.agentModel && process.env.NODE_ENV !== 'production') {
        console.log("🔄 Stale Prisma Client detected (missing agentModel). Re-initializing...");
        global.prismaGlobal = prismaClientSingleton();
    }
    
    return global.prismaGlobal;
};

// Use a Proxy to ensure every access in dev mode checks for stale state
export const db = new Proxy({}, {
    get: (target, prop) => {
        const currentDb = getBaseDb();
        const value = currentDb[prop];
        if (typeof value === 'function') {
            return value.bind(currentDb);
        }
        return value;
    }
});

if (process.env.APP_MODE !== 'prod') globalThis.prismaGlobal = getBaseDb();