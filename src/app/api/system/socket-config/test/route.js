import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * POST /api/system/socket-config/test
 * Tests connectivity to a given socket server URL
 * Checks /health, /api/internal/health, or root /
 */
export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({
        success: false,
        message: "A valid socket server URL is required"
      }, { status: 400 });
    }

    const cleanUrl = url.trim().replace(/\/+$/, '');
    const startTime = Date.now();

    // Try health check endpoint first, then root fallback
    let response = null;
    let endpointTested = `${cleanUrl}/health`;

    try {
      response = await fetch(endpointTested, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3500)
      });
    } catch (healthErr) {
      // Fallback to root /
      try {
        endpointTested = `${cleanUrl}/`;
        response = await fetch(endpointTested, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(3500)
        });
      } catch (rootErr) {
        const latency = Date.now() - startTime;
        return NextResponse.json({
          success: false,
          url: cleanUrl,
          latency,
          error: rootErr.message || 'Connection refused or timed out',
          message: `Unable to reach socket server at ${cleanUrl}. Ensure the server is running and accessible.`
        });
      }
    }

    const latency = Date.now() - startTime;

    let responseData = null;
    try {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text.slice(0, 150);
      }
    } catch {
      responseData = null;
    }

    if (response.ok) {
      return NextResponse.json({
        success: true,
        url: cleanUrl,
        endpointTested,
        statusCode: response.status,
        latency,
        data: responseData,
        message: `Socket server responded successfully (${latency}ms)`
      });
    } else {
      return NextResponse.json({
        success: false,
        url: cleanUrl,
        endpointTested,
        statusCode: response.status,
        latency,
        data: responseData,
        message: `Server returned status code ${response.status} (${response.statusText})`
      });
    }
  } catch (error) {
    console.error('[POST /api/system/socket-config/test] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to execute server connectivity test"
    }, { status: 500 });
  }
}
