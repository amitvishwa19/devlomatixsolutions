import { db } from "@/lib/db";

/**
 * Server-Side System Logger
 * Writes structured telemetry events directly to SystemLog via Prisma.
 * Use this in API routes, webhooks, and server-side functions.
 * 
 * Usage:
 *   import serverLogger from "@/utils/serverLogger";
 * 
 *   await serverLogger.info("User logged in", { type: "AUTH", workspaceId, details: { userId } });
 *   await serverLogger.error("Payment failed", { type: "BILLING", workspaceId, details: { error } });
 *   await serverLogger.warn("Rate limit approaching", { type: "SYSTEM", details: { usage: 95 } });
 *   await serverLogger.success("Deployment complete", { type: "SYSTEM", workspaceId });
 * 
 *   // From API routes with request context (auto-extracts IP, user-agent, URL):
 *   await serverLogger.fromRequest(req, "Webhook received", { type: "WEBHOOK", workspaceId });
 */

async function writeLog(level, message, options = {}) {
    const { type = "SYSTEM", workspaceId = null, userId = null, details = null } = options;

    try {
        await db.systemLog.create({
            data: {
                level,
                type,
                message,
                workspaceId: workspaceId || null,
                userId: userId || null,
                details: details || null,
            }
        });
    } catch (e) {
        console.error(`[SERVER_LOGGER_ERROR] [${level}]`, message, e?.message || e);
    }
}

const serverLogger = {
    /**
     * Default log — INFO level when no params specified
     * @param {string} message - Human-readable event description
     * @param {object} [options] - { type, workspaceId, userId, details }
     */
    log: (message, options) => writeLog("INFO", message, options),

    /**
     * Log an INFO level event
     * @param {string} message - Human-readable event description
     * @param {object} options - { type, workspaceId, userId, details }
     */
    info: (message, options) => writeLog("INFO", message, options),

    /**
     * Log a WARNING level event
     */
    warn: (message, options) => writeLog("WARNING", message, options),

    /**
     * Log an ERROR level event
     */
    error: (message, options) => writeLog("ERROR", message, options),

    /**
     * Log a SUCCESS level event
     */
    success: (message, options) => writeLog("SUCCESS", message, options),

    /**
     * Log from an API route request — automatically extracts IP, user-agent, and URL
     * @param {Request} req - The Next.js request object
     * @param {string} message - Event description
     * @param {object} options - { type, workspaceId, userId, details }
     */
    fromRequest: (req, message, options = {}) => {
        const ip = req.headers.get?.("x-forwarded-for") || req.ip || "Unknown IP";
        const userAgent = req.headers.get?.("user-agent") || "Unknown Agent";

        return writeLog(options.level || "INFO", message, {
            ...options,
            details: {
                ...(options.details || {}),
                ip,
                userAgent,
                url: req.url,
                method: req.method,
            }
        });
    },
};

export default serverLogger;
