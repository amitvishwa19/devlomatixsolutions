import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const returnTo = searchParams.get('returnTo') || `/workspace/${workspaceId}/system/setting`;

    if (!workspaceId) {
        return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connect/google/callback`;
    
    // Scopes required for identity and basic access
    // You can add more scopes here (e.g. calendar, drive) if needed
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid'
    ].join(' ');

    const state = JSON.stringify({ 
        workspaceId, 
        userId: session.user.userId || session.user.id,
        returnTo
    });

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', clientId);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', scopes);
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('prompt', 'select_account consent'); // Shows account chooser + requests refresh token
    googleAuthUrl.searchParams.append('state', Buffer.from(state).toString('base64'));

    return NextResponse.redirect(googleAuthUrl.toString());
}
