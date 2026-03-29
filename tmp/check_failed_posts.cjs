const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const failedPosts = await prisma.post.findMany({
        where: { status: 'FAILED' },
        orderBy: { updatedAt: 'desc' },
        take: 5
    });

    console.log(`Analyzing last ${failedPosts.length} failed posts:`);
    failedPosts.forEach(post => {
        console.log(`ID: ${post.id}, Status: ${post.status}, Platform: ${post.platforms}`);
        console.log(`Error: ${post.errorLog}`);
        console.log('---');
    });
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
