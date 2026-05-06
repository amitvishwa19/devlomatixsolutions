// Dummy db object to prevent compilation errors during migration to Devlomatix API
// All Prisma models will return empty or throw when called if not handled.

const dummyProxy = new Proxy({}, {
  get: function(target, prop) {
    if (prop === 'then') return undefined; // Promise chaining fix
    return new Proxy({}, {
      get: function(target2, prop2) {
        if (prop2 === 'then') return undefined;
        return async () => {
          console.warn(`[Mock DB] Attempted to access db.${prop}.${prop2} after Prisma removal.`);
          return null; // Return null or [] depending on expectation
        };
      }
    });
  }
});

export const db = dummyProxy;
export const prisma = dummyProxy;