import { db } from "./db";

/**
 * Global System Logger
 * 
 * Usage:
 * import { logger } from "@/lib/logger";
 * 
 * await logger.info("User logged in", { type: 'AUTH', userId: '...' });
 * await logger.error("Cron failed", { type: 'CRON', details: { stack: error.stack } });
 */
export const logger = {
    async info(message, options = {}) {
        return this.log('INFO', message, options);
    },
    
    async error(message, options = {}) {
        return this.log('ERROR', message, options);
    },
    
    async warn(message, options = {}) {
        return this.log('WARNING', message, options);
    },
    
    async success(message, options = {}) {
        return this.log('SUCCESS', message, options);
    },
    
    async log(level, message, { workspaceId = null, type = 'SYSTEM', userId = null, details = null } = {}) {
        try {
            // Ensure message is a string
            const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
            
            return await db.systemLog.create({
                data: {
                    level,
                    type,
                    message: safeMessage,
                    workspaceId,
                    userId,
                    details: details ? JSON.parse(JSON.stringify(details)) : null
                }
            });
        } catch (err) {
            // Fallback to console if database is unavailable or schema not updated
            console.error(`[LOGGER_DB_FAIL] [${level}] [${type}] ${message}`, err);
            console.log(`[FALLBACK_LOG] [${level}] [${type}] ${message}`, details);
        }
    }
};
