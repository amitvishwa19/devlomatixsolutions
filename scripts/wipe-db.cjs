const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Wiping database tables...');
  
  // Split into individual commands to avoid "cannot insert multiple commands into a prepared statement"
  await prisma.$executeRawUnsafe(`DROP SCHEMA public CASCADE`);
  await prisma.$executeRawUnsafe(`CREATE SCHEMA public`);
  await prisma.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO postgres`);
  await prisma.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO public`);
  
  console.log('✅ All tables deleted successfully. Your database is now completely empty.');
}

main()
  .catch((e) => {
    console.error('❌ Error wiping database:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
