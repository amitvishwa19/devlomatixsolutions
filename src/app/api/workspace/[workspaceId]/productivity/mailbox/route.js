import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getGmailClient, formatMessage } from "@/lib/gmail";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const fs = require('fs');
        fs.appendFileSync('api_debug.txt', `[GMAIL_DEBUG_ENTRY] ${new Date().toISOString()} - userId: ${userId}\n`);
        const { searchParams } = new URL(req.url);
        // SUPER DIAGNOSTIC - PRINT ALL PLATFORMS IN DB
        const allCreds = await db.credentials.findMany({ select: { platform: true, status: true, profile: true } });
        console.log(`[MAILBOX_DB_DIAGNOSTIC] Total Creds: ${allCreds.length}`);
        console.log(`[MAILBOX_DB_DIAGNOSTIC] Platforms:`, allCreds.map(c => `${c.platform}(${c.status}, ${c.profile})`));
        
        const label = searchParams.get('label') || 'INBOX';
        const q = searchParams.get('q') || '';
        const maxResults = parseInt(searchParams.get('maxResults') || '20');
        const accountId = searchParams.get('accountId');

        // Fetch all connected Gmail accounts in the system (Global Access)
        const connectedAccounts = await db.credentials.findMany({
            where: {
                platform: { in: ['GMAIL', 'gmail', 'Gmail', 'GOOGLE', 'google', 'Google', 'google.com', 'gmail.com'] }
            },
            select: {
                id: true,
                profile: true
            }
        });
        console.log(`[MAILBOX_DB_DIAGNOSTIC] Connected Gmail Accounts Found: ${connectedAccounts.length}`);

        if (connectedAccounts.length === 0) {
            return NextResponse.json({ 
                connected: false, 
                message: "No Gmail accounts connected",
                debug_userId: userId
            });
        }

        // Try to fetch messages for the active account
        try {
            // Smart default: find the first workable account if no accountId provided
            let activeAccountId = accountId;
            let gmail;

            if (!activeAccountId) {
                // Try each account until one works
                for (const acc of connectedAccounts) {
                    try {
                        gmail = await getGmailClient(null, acc.id);
                        activeAccountId = acc.id;
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            } else {
                gmail = await getGmailClient(null, activeAccountId);
            }

            if (!gmail) {
                throw new Error('GMAIL_NOT_CONNECTED');
            }

            const response = await gmail.users.messages.list({
                userId: 'me',
                labelIds: (label === 'ALL' || !label) ? [] : [label],
                q,
                maxResults
            });

            const messages = response.data.messages || [];
            
            // Get full details for each message (limited for performance)
            const detailedMessages = await Promise.all(
                messages.map(async (m) => {
                    try {
                        const detail = await gmail.users.messages.get({
                            userId: 'me',
                            id: m.id,
                            format: 'metadata',
                            metadataHeaders: ['From', 'Subject', 'Date']
                        });
                        return formatMessage(detail);
                    } catch (err) {
                        return null;
                    }
                })
            );

        const { listLabels } = await import("@/lib/gmail");
        const labels = await listLabels(gmail);

        return NextResponse.json({
            connected: true,
            accounts: connectedAccounts.map(acc => ({
                id: acc.id,
                email: acc.profile || 'GOOGLE Account'
            })),
            activeAccountId,
            messages: detailedMessages.filter(m => m !== null), // Changed to detailedMessages as per original logic
            labels: labels,
            nextPageToken: response.data.nextPageToken
        });

        } catch (error) {
            console.error("[GMAIL_LIST_FETCH_ERROR]", error.message);
            // Even if message fetch fails, still return the accounts so UI can show them
            return NextResponse.json({
                accounts: connectedAccounts.map(a => ({ id: a.id, email: a.profile })),
                activeAccountId: accountId || connectedAccounts[0].id,
                messages: [],
                error: error.message,
                details: error.response?.data
            });
        }

        } catch (error) {
            console.error("[GMAIL_LIST_ERROR_DETAILED]", {
                message: error.message,
                stack: error.stack,
                details: error.response?.data
            });
            return NextResponse.json({ 
                message: "Failed to fetch messages", 
                error: error.message,
                details: error.response?.data 
            }, { status: 500 });
        }
}

/**
 * Handle message actions (trash, mark as read, etc.)
 */
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const body = await req.json();
        const { action, messageId, labelIds, accountId } = body;

        const gmail = await getGmailClient(null, accountId);

        if (action === 'trash') {
            await gmail.users.messages.trash({ userId: 'me', id: messageId });
        } else if (action === 'modify') {
            await gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    addLabelIds: labelIds?.add || [],
                    removeLabelIds: labelIds?.remove || []
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[GMAIL_ACTION_ERROR]", error);
        return NextResponse.json({ message: "Action failed" }, { status: 500 });
    }
}
