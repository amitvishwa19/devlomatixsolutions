import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { encrypt, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/socket-token
 * Issues a cryptographically signed JWT token for authenticating Socket.io and WebRTC connections
 */
export async function GET() {
  try {
    // 1. Check NextAuth server session
    const nextAuthSession = await getServerSession(authOptions).catch(() => null);

    // 2. Check custom cookie session fallback
    const customSession = !nextAuthSession ? await getSession().catch(() => null) : null;

    const sessionUser = nextAuthSession?.user || customSession?.user || customSession?.data;
    const userId = sessionUser?.userId || sessionUser?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: User not authenticated' },
        { status: 401 }
      );
    }

    // 3. Generate signed socket token
    const token = await encrypt({
      userId,
      email: sessionUser?.email || null,
      displayName: sessionUser?.displayName || sessionUser?.name || 'User',
      avatar: sessionUser?.avatar || sessionUser?.image || null,
      workspaces: sessionUser?.workspaces || []
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        displayName: sessionUser?.displayName || sessionUser?.name || 'User',
        avatar: sessionUser?.avatar || sessionUser?.image || null
      }
    });
  } catch (error) {
    console.error('[API /api/auth/socket-token GET] Error generating socket token:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error generating socket token' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const nextAuthSession = await getServerSession(authOptions).catch(() => null);
    const customSession = !nextAuthSession ? await getSession().catch(() => null) : null;
    let body = {};
    try {
      body = await req.json();
    } catch (_) {}

    const sessionUser = nextAuthSession?.user || customSession?.user || customSession?.data || body;
    const userId = sessionUser?.userId || sessionUser?.id || body?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: User not authenticated' },
        { status: 401 }
      );
    }

    const token = await encrypt({
      userId,
      email: sessionUser?.email || null,
      displayName: sessionUser?.displayName || sessionUser?.name || 'User',
      avatar: sessionUser?.avatar || sessionUser?.image || null,
      workspaces: sessionUser?.workspaces || []
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        displayName: sessionUser?.displayName || sessionUser?.name || 'User',
        avatar: sessionUser?.avatar || sessionUser?.image || null
      }
    });
  } catch (error) {
    console.error('[API /api/auth/socket-token POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error generating socket token' },
      { status: 500 }
    );
  }
}
