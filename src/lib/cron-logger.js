import { db } from '@/lib/db';

/**
 * Utility to log all incoming cron requests, webhooks, and executions into the database.
 * 
 * @param {Request} req - The incoming Next.js / HTTP request object
 * @param {Object} options - Additional metadata
 * @param {string} [options.jobName] - Custom job name (e.g., 'Daily Sync', 'Vercel Keepalive')
 * @param {string} [options.source] - 'VERCEL' | 'RENDER' | 'CRON_JOB_ORG' | 'GITHUB_ACTIONS' | 'INTERNAL' | 'WEBHOOK'
 * @param {string} [options.status] - 'SUCCESS' | 'FAILED' | 'UNAUTHORIZED' | 'RUNNING'
 * @param {number} [options.statusCode] - HTTP status code
 * @param {any} [options.response] - Response body or execution summary
 * @param {string} [options.errorMessage] - Error string if failed
 * @param {number} [options.durationMs] - Execution duration in ms
 * @param {string} [options.workspaceId] - Workspace ID if applicable
 * @param {string} [options.cronId] - Associated SystemCron ID if applicable
 * @param {any} [options.payload] - Request payload body
 */
export async function logCronRequest(req, options = {}) {
  try {
    const url = req?.url ? new URL(req.url) : null;
    const endpoint = url ? url.pathname : (options.endpoint || '/api/cron');
    const method = req?.method || options.method || 'GET';

    // Extract Headers safely (masking sensitive tokens if needed)
    const headersObj = {};
    if (req?.headers) {
      if (typeof req.headers.forEach === 'function') {
        req.headers.forEach((val, key) => {
          // Mask secrets partially for security
          if (key.toLowerCase() === 'authorization') {
            headersObj[key] = val ? `${val.slice(0, 10)}...` : '';
          } else {
            headersObj[key] = val;
          }
        });
      } else if (typeof req.headers.entries === 'function') {
        for (const [key, val] of req.headers.entries()) {
          headersObj[key] = key.toLowerCase() === 'authorization' ? `${val.slice(0, 10)}...` : val;
        }
      }
    }

    // Extract query parameters
    const queryParams = {};
    if (url?.searchParams) {
      url.searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });
    }

    // Extract IP address & User-Agent
    const ipAddress = req?.headers?.get?.('x-forwarded-for') ||
      req?.headers?.get?.('x-real-ip') ||
      req?.headers?.['x-forwarded-for'] ||
      req?.ip ||
      '127.0.0.1';

    const userAgent = req?.headers?.get?.('user-agent') ||
      req?.headers?.['user-agent'] ||
      'cron-client';

    // Determine default source if not explicitly provided
    let source = options.source;
    if (!source) {
      if (headersObj['x-vercel-cron'] || userAgent.toLowerCase().includes('vercel')) {
        source = 'VERCEL';
      } else if (headersObj['x-render-cron'] || userAgent.toLowerCase().includes('render')) {
        source = 'RENDER';
      } else if (userAgent.toLowerCase().includes('cron-job.org')) {
        source = 'CRON_JOB_ORG';
      } else if (userAgent.toLowerCase().includes('github')) {
        source = 'GITHUB_ACTIONS';
      } else {
        source = 'EXTERNAL_WEBHOOK';
      }
    }

    const logRecord = await db.cronLog.create({
      data: {
        jobName: options.jobName || (queryParams.job || queryParams.name || 'Incoming Cron'),
        source,
        endpoint,
        method,
        headers: headersObj,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : null,
        payload: options.payload || null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : null,
        userAgent,
        status: options.status || (options.statusCode && options.statusCode >= 400 ? 'FAILED' : 'SUCCESS'),
        statusCode: options.statusCode || 200,
        response: options.response || null,
        errorMessage: options.errorMessage || null,
        durationMs: options.durationMs || 0,
        workspaceId: options.workspaceId || queryParams.workspaceId || null,
        cronId: options.cronId || null,
        completedAt: new Date()
      }
    });

    return logRecord;
  } catch (err) {
    console.error('[CRON_LOG_ERROR] Failed to save cron log to database:', err);
    return null;
  }
}
