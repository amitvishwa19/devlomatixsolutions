import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = 'force-dynamic';

const DEFAULT_DEV_SOCKET =
  process.env.NEXT_PUBLIC_SOCKET_SERVER ||
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
  'http://localhost:5001';

const DEFAULT_PROD_SOCKET =
  process.env.NEXT_PUBLIC_SOCKETSERVER ||
  'https://socket.devlomatix.in';

/**
 * GET /api/system/socket-config
 * Returns the global socket server configuration and active resolved URL
 */
export async function GET(req) {
  try {
    const globalSettings = await prisma.appSettings.findUnique({
      where: { key: 'global' }
    }).catch(() => null);

    const glTechnical = (globalSettings?.technical && typeof globalSettings.technical === 'object')
      ? globalSettings.technical
      : {};
    const glGeneral = (globalSettings?.general && typeof globalSettings.general === 'object')
      ? globalSettings.general
      : {};

    const socketServer = glTechnical?.socketServer || glGeneral?.socketServer || {};

    const devUrl = (socketServer.devUrl || DEFAULT_DEV_SOCKET).replace(/\/+$/, '');
    const prodUrl = (socketServer.prodUrl || DEFAULT_PROD_SOCKET).replace(/\/+$/, '');
    const environmentMode = socketServer.environmentMode || 'auto'; // 'auto' | 'development' | 'production'
    const internalSecret = socketServer.internalSecret || process.env.INTERNAL_SERVICE_SECRET || 'devlomatix_internal_secret_key_2026';
    const enableLocalFallback = socketServer.enableLocalFallback ?? true;

    // Detect active URL based on requested host or environment mode
    const hostHeader = req.headers.get('host') || '';
    const isLocalHost = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1');
    const isDevEnv = process.env.NODE_ENV !== 'production';

    let activeUrl = prodUrl;
    if (environmentMode === 'development') {
      activeUrl = devUrl;
    } else if (environmentMode === 'production') {
      activeUrl = prodUrl;
    } else {
      // 'auto' mode
      activeUrl = (isLocalHost || isDevEnv) ? devUrl : prodUrl;
    }

    return NextResponse.json({
      success: true,
      config: {
        devUrl,
        prodUrl,
        environmentMode,
        internalSecret,
        enableLocalFallback,
        updatedAt: socketServer.updatedAt || null,
        activeUrl,
        isLocalHost,
        isDevEnv
      }
    });
  } catch (error) {
    console.error('[GET /api/system/socket-config] Error:', error);
    return NextResponse.json({
      success: true, // Graceful fallback
      config: {
        devUrl: DEFAULT_DEV_SOCKET,
        prodUrl: DEFAULT_PROD_SOCKET,
        environmentMode: 'auto',
        activeUrl: process.env.NODE_ENV !== 'production' ? DEFAULT_DEV_SOCKET : DEFAULT_PROD_SOCKET,
        fallback: true
      }
    });
  }
}

/**
 * PATCH /api/system/socket-config
 * Updates the global socket server configuration in appSettings (key: 'global')
 */
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { devUrl, prodUrl, environmentMode, internalSecret, enableLocalFallback } = body;

    const currentGlobal = await prisma.appSettings.findUnique({
      where: { key: 'global' }
    }).catch(() => null);

    const existingTechnical = (currentGlobal?.technical && typeof currentGlobal.technical === 'object')
      ? currentGlobal.technical
      : {};

    const existingSocket = (existingTechnical.socketServer && typeof existingTechnical.socketServer === 'object')
      ? existingTechnical.socketServer
      : {};

    const updatedSocketServer = {
      ...existingSocket,
      devUrl: devUrl !== undefined ? String(devUrl).trim().replace(/\/+$/, '') : existingSocket.devUrl || DEFAULT_DEV_SOCKET,
      prodUrl: prodUrl !== undefined ? String(prodUrl).trim().replace(/\/+$/, '') : existingSocket.prodUrl || DEFAULT_PROD_SOCKET,
      environmentMode: environmentMode || existingSocket.environmentMode || 'auto',
      internalSecret: internalSecret !== undefined ? String(internalSecret).trim() : existingSocket.internalSecret || 'devlomatix_internal_secret_key_2026',
      enableLocalFallback: enableLocalFallback !== undefined ? Boolean(enableLocalFallback) : (existingSocket.enableLocalFallback ?? true),
      updatedAt: new Date().toISOString()
    };

    await prisma.appSettings.upsert({
      where: { key: 'global' },
      create: {
        key: 'global',
        technical: {
          ...existingTechnical,
          socketServer: updatedSocketServer
        }
      },
      update: {
        technical: {
          ...existingTechnical,
          socketServer: updatedSocketServer
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Global socket server settings updated successfully",
      config: updatedSocketServer
    });
  } catch (error) {
    console.error('[PATCH /api/system/socket-config] Error:', error);
    return NextResponse.json({ success: false, message: error.message || "Failed to update socket config" }, { status: 500 });
  }
}
