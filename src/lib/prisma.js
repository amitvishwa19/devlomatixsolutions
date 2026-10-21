import { db } from './db.js';

/**
 * Centered Prisma Client for ATS & Backend
 * This file delegates to src/lib/db.js to ensure a single Prisma instance
 * across the entire application.
 */
export const prisma = db;
