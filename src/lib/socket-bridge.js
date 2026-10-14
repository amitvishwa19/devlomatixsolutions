/**
 * Socket Bridge: Dispatches server-side real-time events to the socket-webrtc server.
 * Enables Baileys WhatsApp events (QR, connection, messages, receipts) to be pushed
 * instantly to connected clients in workspace rooms without database polling.
 */

const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'devlomatix_internal_secret_key_2026';

function getInternalSocketUrls() {
  const primaryUrl =
    process.env.INTERNAL_SOCKET_URL ||
    process.env.NEXT_PUBLIC_SOCKET_SERVER ||
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

  if (primaryUrl) {
    return [primaryUrl.replace(/\/+$/, '')];
  }

  if (process.env.NODE_ENV === 'production') {
    return ['https://socket.devlomatix.in'];
  }

  // In local development, check both common ports (5001 and 5000)
  return ['http://localhost:5001', 'http://localhost:5000'];
}

export async function emitKonnectxEvent(workspaceId, event, data) {
  if (!workspaceId || !event) return;

  const candidateUrls = getInternalSocketUrls();

  for (const baseUrl of candidateUrls) {
    try {
      const endpoint = `${baseUrl}/api/internal/emit`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': INTERNAL_SECRET
        },
        body: JSON.stringify({ workspaceId, event, data }),
        signal: AbortSignal.timeout(2000)
      });

      if (res.ok) {
        return; // Successfully dispatched
      }
    } catch (_) {
      // Continue to next candidate URL or fail safely without breaking caller
    }
  }

  // Non-intrusive debug log if all candidate URLs were unreachable
  // console.debug(`[SOCKET_BRIDGE_UNREACHABLE] Could not emit '${event}' to workspace '${workspaceId}'`);
}
