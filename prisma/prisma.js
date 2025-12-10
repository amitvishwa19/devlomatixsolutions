import { PrismaClient } from '@prisma/client'



//export const prisma = globalThis.prisma || new PrismaClient({ log: ['query'] })
//export const prisma = globalThis.prisma || new PrismaClient()
//export const prisma = new PrismaClient()



const prismaClientSingleton = () => {
    return new PrismaClient()
}

global.prismaGlobal = global.prismaGlobal || prismaClientSingleton();

export const prisma = global.prismaGlobal;




if (process.env.APP_MODE !== 'prod') globalThis.prismaGlobal = prisma