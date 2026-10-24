import { db as prisma } from '@/lib/db';

let cachedSocketConfig = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30000; // 30s in-memory cache

async function getGlobalSocketConfig() {
  const now = Date.now();
  if (cachedSocketConfig && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedSocketConfig;
  }
  try {
    const globalSettings = await prisma.appSettings.findUnique({
      where: { key: 'global' }
    });
    const glTechnical = (typeof globalSettings?.technical === 'object' && globalSettings?.technical) ? globalSettings.technical : {};
    const glGeneral = (typeof globalSettings?.general === 'object' && globalSettings?.general) ? globalSettings.general : {};
    const socketServer = glTechnical?.socketServer || glGeneral?.socketServer || null;
    cachedSocketConfig = socketServer;
    lastCacheTime = now;
    return socketServer;
  } catch (err) {
    // Non-fatal, use cached or fallback
    return cachedSocketConfig;
  }
}

async function getInternalSocketUrlsAndSecret() {
  const config = await getGlobalSocketConfig();

  const devUrl = (config?.devUrl || process.env.NEXT_PUBLIC_SOCKET_SERVER || process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://socket.devlomatix.com').replace(/\/+$/, '');
  const prodUrl = (config?.prodUrl || 'https://socket.devlomatix.com').replace(/\/+$/, '');
  const mode = config?.environmentMode || 'auto';
  const secret = process.env.INTERNAL_SERVICE_SECRET || config?.internalSecret || 'b9f781c6465e99dfb8cd41fa313002a007bf0a03d2bebac11937bd998d8ac3dd';
  const enableLocalFallback = config?.enableLocalFallback ?? true;

  if (mode === 'development') {
    const urls = [devUrl, 'https://socket.devlomatix.com'];
    if (enableLocalFallback && !devUrl.includes(':5000')) urls.push('http://localhost:5000');
    return { urls: [...new Set(urls)], secret };
  }

  if (mode === 'production') {
    return { urls: [prodUrl], secret };
  }

  // 'auto' mode
  const envUrl = process.env.INTERNAL_SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_SERVER || process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  if (envUrl) {
    const urls = [envUrl.replace(/\/+$/, ''), 'https://socket.devlomatix.com'];
    if (enableLocalFallback && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      urls.push('http://localhost:5001', 'http://localhost:5000');
    }
    return { urls: [...new Set(urls)], secret };
  }

  if (process.env.NODE_ENV === 'production') {
    return { urls: [prodUrl], secret };
  }

  const urls = [devUrl, 'https://socket.devlomatix.com'];
  if (enableLocalFallback) {
    urls.push('http://localhost:5001', 'http://localhost:5000');
  }
  return { urls: [...new Set(urls)], secret };
}

export async function emitKonnectxEvent(workspaceId, event, data, options = {}) {
  if (!workspaceId || !event) return;

  const { urls: candidateUrls, secret } = await getInternalSocketUrlsAndSecret();
  const payload = {
    workspaceId,
    event,
    data,
    ...(options.targetUserId ? { targetUserId: options.targetUserId } : {}),
    ...(options.targetRoom ? { targetRoom: options.targetRoom } : {})
  };

  for (const baseUrl of candidateUrls) {
    try {
      const endpoint = `${baseUrl}/api/internal/emit`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': secret
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2000)
      });

      if (res.ok) {
        console.log(`[SOCKET_BRIDGE] Dispatched '${event}' to workspace '${workspaceId}' via ${baseUrl}`);
        return; // Successfully dispatched
      } else {
        console.warn(`[SOCKET_BRIDGE_FAIL] ${res.status} ${res.statusText} from ${endpoint}`);
      }
    } catch (err) {
      console.warn(`[SOCKET_BRIDGE_ERR] Failed connecting to ${baseUrl}: ${err.message}`);
    }
  }
}
