/**
 * Server-Side System Logger
 * Writes structured telemetry events directly to console.
 * DB logging removed as per request (API-only architecture).
 */

async function writeLog(level, message, options = {}) {
  const {
    type = "SYSTEM",
    workspaceId = null,
    userId = null,
    details = null,
  } = options;

  // Since DB is removed, we just log to console
  console.log(`[${level}] [${type}] ${message}`, {
    workspaceId,
    userId,
    details,
  });
}

const serverLogger = {
  log: (message, options) => writeLog("INFO", message, options),
  info: (message, options) => writeLog("INFO", message, options),
  warn: (message, options) => writeLog("WARNING", message, options),
  error: (message, options) => writeLog("ERROR", message, options),
  success: (message, options) => writeLog("SUCCESS", message, options),

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
      },
    });
  },
};

export default serverLogger;
