'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { getGmailClient, formatMessage, sendMail, modifyMessage, listLabels } from "@/lib/gmail";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Fetch initial mailbox data (accounts, labels, and first page of messages)
 */
export async function getMailboxDataAction(workspaceId, folder = 'INBOX', query = '', accountId = null) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new Error("Unauthorized");

        const userId = session.user.userId || session.user.id;

        // 1. Get connected accounts
        const rawAccounts = await db.credentials.findMany({
            where: {
                workspaceId,
                platform: { in: ['GMAIL', 'GOOGLE'] },
                status: 'connected'
            },
            select: {
                id: true,
                profile: true,
                userInfo: true,
                platform: true
            }
        });

        const connectedAccounts = rawAccounts.map(acc => ({
            ...acc,
            email: acc.userInfo?.email || acc.profile?.split('-')[1] || 'Unknown'
        }));

        if (connectedAccounts.length === 0) {
            return { connected: false, accounts: [] };
        }

        // 2. Select account to use
        const activeAccount = accountId 
            ? connectedAccounts.find(a => a.id === accountId) 
            : connectedAccounts[0];
        
        if (!activeAccount) throw new Error("Selected account not found");

        const gmail = await getGmailClient(null, activeAccount.id);

        // 3. Fetch Labels
        const labels = await listLabels(gmail);

        // 4. Fetch Messages
        let q = query || '';
        if (folder === 'SENT') q += ' in:sent';
        else if (folder === 'TRASH') q += ' in:trash';
        else if (folder === 'SPAM') q += ' in:spam';
        else if (folder === 'STARRED') q += ' is:starred';
        else if (folder === 'DRAFT') q += ' is:draft';
        else if (folder === 'INBOX') q += ' in:inbox';
        else if (folder && folder !== 'all') q += ` label:${folder}`;

        const listRes = await gmail.users.messages.list({
            userId: 'me',
            q: q.trim(),
            maxResults: 20
        });

        const messages = [];
        if (listRes.data.messages) {
            for (const m of listRes.data.messages) {
                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: m.id,
                    format: 'minimal'
                });
                messages.push(formatMessage(detail));
            }
        }

        return {
            connected: true,
            accounts: connectedAccounts,
            activeAccountId: activeAccount.id,
            labels,
            messages,
            nextPageToken: listRes.data.nextPageToken
        };

    } catch (error) {
        console.error("[MAILBOX_ACTION_ERROR]", error);
        return { error: error.message };
    }
}

/**
 * Fetch detailed message content
 */
export async function getMailDetailAction(workspaceId, messageId, accountId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new Error("Unauthorized");

        const gmail = await getGmailClient(null, accountId);

        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        const payload = response.data.payload || {};
        const parts = payload.parts || [payload];
        
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

        const htmlPart = findPart(parts, 'text/html');
        const textPart = findPart(parts, 'text/plain');

        let body = '';
        if (htmlPart && htmlPart.body?.data) {
            body = Buffer.from(htmlPart.body.data, 'base64').toString();
        } else if (textPart && textPart.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
        }

        const details = formatMessage(response);
        
        return {
            ...details,
            body,
            mimeType: htmlPart ? 'text/html' : 'text/plain',
            headers: payload.headers || []
        };

    } catch (error) {
        console.error("[MAIL_DETAIL_ACTION_ERROR]", error);
        return { error: error.message };
    }
}

/**
 * Execute a mailbox action (trash, star, reply, etc.)
 */
export async function executeMailActionAction(workspaceId, accountId, messageId, data) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new Error("Unauthorized");

        const gmail = await getGmailClient(null, accountId);
        const { action, to, subject, body, labelId, remove } = data;

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
            case 'markRead':
                result = await modifyMessage(gmail, messageId, [], ['UNREAD']);
                break;
            case 'markUnread':
                result = await modifyMessage(gmail, messageId, ['UNREAD'], []);
                break;
            default:
                throw new Error("Invalid action: " + action);
        }

        return { success: true, result };

    } catch (error) {
        console.error("[EXECUTE_MAIL_ACTION_ERROR]", error);
        return { error: error.message };
    }
}

/**
 * Summarize an email using Gemini AI
 */
export async function summarizeEmailAction(accountId, messageId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) throw new Error("Unauthorized");

        const gmail = await getGmailClient(null, accountId);
        const res = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        const getBody = (payload) => {
            if (payload.body && payload.body.data) {
                return Buffer.from(payload.body.data, 'base64').toString();
            }
            if (payload.parts) {
                const plainTextPart = payload.parts.find(p => p.mimeType === 'text/plain');
                if (plainTextPart) return getBody(plainTextPart);
                const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
                if (htmlPart) return getBody(htmlPart);
                return getBody(payload.parts[0]);
            }
            return "";
        };

        const messageBody = getBody(res.data.payload);
        if (!messageBody || messageBody.trim().length < 20) {
            return { summary: "This message is too short to summarize." };
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = "Summarize the following email in a single, concise sentence that captures the core takeaway. Focus on the 'bottom line'. Do not use introductory phrases.";
        
        const result = await model.generateContent([
            { text: systemPrompt },
            { text: messageBody.substring(0, 10000) }
        ]);
        
        return { summary: result.response.text().trim() };

    } catch (error) {
        console.error("[SUMMARIZE_MAIL_ACTION_ERROR]", error);
        return { error: error.message };
    }
}
