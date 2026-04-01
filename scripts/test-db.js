import { db } from '../src/lib/db.js';

async function main() {
  try {
    console.log("Testing SystemCron existence using project db instance...");
    
    // Check if the property exists on the db object
    if (db.systemCron) {
        console.log("Prisma: systemCron property FOUND");
        const count = await db.systemCron.count();
        console.log("SystemCron count in DB:", count);
    } else {
        console.log("Prisma: systemCron property MISSING on exported db instance");
        console.log("Available keys:", Object.keys(db).filter(k => !k.startsWith('_')));
    }
  } catch (err) {
    console.error("Prisma Execution Error:", err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    // Note: in the project db.js, the pool isn't explicitly exposed for disconnection in this simplified test
    // but the process will exit anyway.
  }
}

main();
