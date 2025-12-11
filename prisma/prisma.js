import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

global.prismaGlobal = global.prismaGlobal || prismaClientSingleton();

export const prisma = global.prismaGlobal;

if (process.env.APP_MODE !== 'prod') globalThis.prismaGlobal = prisma