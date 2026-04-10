import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getGmailClient, formatMessage } from "@/lib/gmail";

export async function GET(req, { params }) {
    try {
        const { workspaceId, messageId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get('accountId');

        // Use global client
        const gmail = await getGmailClient(null, accountId);

        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        const payload = response.data.payload || {};
        const headers = payload.headers || [];
        let body = '';

        // Helper to extract body from parts (Robust version)
        const getBody = (part) => {
            if (!part) return '';
            if (part.body?.data) {
                try {
                    return Buffer.from(part.body.data, 'base64').toString();
                } catch (e) {
                    return '';
                }
            }
            if (part.parts) {
                for (let p of part.parts) {
                    const b = getBody(p);
                    if (b) return b;
                }
            }
            return '';
        };

        // Try to find HTML first, then plain text
        const findPart = (parts, mimeType) => {
            if (!parts || !Array.isArray(parts)) return null;
            for (let part of parts) {
                if (part.mimeType === mimeType) return part;
                if (part.parts) {
                    const found = findPart(part.parts, mimeType);
                    if (found) return found;
                }
            }
            return null;
        };

        const parts = payload.parts || [payload];
        const htmlPart = findPart(parts, 'text/html');
        const textPart = findPart(parts, 'text/plain');

        if (htmlPart && htmlPart.body?.data) {
            body = Buffer.from(htmlPart.body.data, 'base64').toString();
        } else if (textPart && textPart.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
        }

        const details = formatMessage(response);
        
        return NextResponse.json({
            ...details,
            body,
            mimeType: htmlPart ? 'text/html' : 'text/plain',
            headers: payload.headers || []
        });

    } catch (error) {
        console.error("[GMAIL_DETAIL_ERROR_DETAILED]", {
            message: error.message,
            stack: error.stack,
            details: error.response?.data
        });
        return NextResponse.json({ 
            message: "Failed to fetch message details",
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { workspaceId, messageId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { action, accountId, to, subject, body, labelId, remove } = await req.json();
        const { getGmailClient, sendMail, modifyMessage } = await import("@/lib/gmail");
        const gmail = await getGmailClient(null, accountId);

        let result;
        switch (action) {
            case 'reply':
            case 'forward':
                result = await sendMail(gmail, { to, subject, body, threadId: messageId });
                break;
            case 'label':
                result = await modifyMessage(gmail, messageId, remove ? [] : [labelId], remove ? [labelId] : []);
                break;
            case 'trash':
                result = await gmail.users.messages.trash({ userId: 'me', id: messageId });
                break;
            case 'untrash':
                result = await gmail.users.messages.untrash({ userId: 'me', id: messageId });
                break;
            case 'star':
                result = await modifyMessage(gmail, messageId, ['STARRED'], []);
                break;
            case 'unstar':
                result = await modifyMessage(gmail, messageId, [], ['STARRED']);
                break;
            default:
                return NextResponse.json({ message: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("[GMAIL_ACTION_ERROR]", error);
        return NextResponse.json({ message: "Action failed", error: error.message }, { status: 500 });
    }
}
