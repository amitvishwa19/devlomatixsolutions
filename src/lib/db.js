import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const getEffectiveConnectionString = () => {
    const isProd = process.env.NODE_ENV === 'production' || 
                   process.env.APP_MODE === 'prod' || 
                   process.env.VERCEL === '1';

    // In production / serverless environments, ALWAYS prioritize the pooled DATABASE_URL.
    // DIRECT_URL is direct session mode (port 5432) intended exclusively for migrations.
    let conn = isProd
        ? (process.env.DATABASE_URL || process.env.DIRECT_URL)
        : (process.env.DATABASE_URL || process.env.DIRECT_URL);

    if (!conn) return '';

    // If connecting to Supabase Pooler via Session Mode (port 5432),
    // automatically rewrite port 5432 to 6543 (Transaction Mode) to prevent (EMAXCONNSESSION).
    if (conn.includes('pooler.supabase.com:5432')) {
        conn = conn.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543');
        if (!conn.includes('pgbouncer=true')) {
            const separator = conn.includes('?') ? '&' : '?';
            conn = `${conn}${separator}pgbouncer=true`;
        }
    }

    return conn;
};

const prismaClientSingleton = () => {
    const connectionString = getEffectiveConnectionString();
    const isServerless = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

    // Configure pg.Pool with serverless-safe limits to prevent exhausting database connections
    const pool = new Pool({
        connectionString,
        max: isServerless ? 2 : 10,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

const SCHEMA_VERSION = 34; // Increment this to force a re-init in dev

// Store the singleton on the global object to prevent multiple instances in dev
const getBaseDb = () => {
    if (!globalThis.prismaGlobal) {
        globalThis.prismaGlobal = prismaClientSingleton();
        globalThis.prismaGlobal._schemaVersion = SCHEMA_VERSION;
    }
    
    // Self-healing: If the client was initialized before the new models or fields existed
    // We check for some new models/fields to trigger re-initialization in development
    const isStale = process.env.NODE_ENV !== 'production' && (
        !globalThis.prismaGlobal.crmEmailThread ||
        !globalThis.prismaGlobal.agentModel || 
        !globalThis.prismaGlobal.contactGroup ||
        !globalThis.prismaGlobal.whatsAppFlow ||
        !globalThis.prismaGlobal.role || 
        !globalThis.prismaGlobal.permission ||
        !globalThis.prismaGlobal.eCommerceStore ||
        !globalThis.prismaGlobal.konnectLegacyTemplate ||
        !globalThis.prismaGlobal.konnectLegacyTemplateGroup ||
        !globalThis.prismaGlobal.userLocationPoint ||
        globalThis.prismaGlobal._schemaVersion !== SCHEMA_VERSION
    );

    if (isStale) {
        globalThis.prismaGlobal = prismaClientSingleton();
        globalThis.prismaGlobal._schemaVersion = SCHEMA_VERSION;
    }
    
    return globalThis.prismaGlobal;
};

/**
 * Typed Proxy for the Prisma Client
 * Ensures self-healing in dev mode while providing full type support for TS/IDE
 * @type {import('@prisma/client').PrismaClient}
 */
export const db = new Proxy({}, {
    get: (target, prop) => {
        let currentDb = getBaseDb();
        if (prop === 'then') return undefined; // Avoid proxy being treated as a promise
        
        // Dynamic self-healing fallback for new models in dev mode
        if (process.env.NODE_ENV !== 'production' && typeof prop === 'string' && currentDb[prop] === undefined && !prop.startsWith('$') && !prop.startsWith('_')) {
            globalThis.prismaGlobal = prismaClientSingleton();
            globalThis.prismaGlobal._schemaVersion = SCHEMA_VERSION;
            currentDb = globalThis.prismaGlobal;
        }

        const value = currentDb[prop];
        if (typeof value === 'function') {
            return value.bind(currentDb);
        }
        return value;
    }
});

globalThis.prismaGlobal = getBaseDb();