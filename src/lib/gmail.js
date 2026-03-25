import { google } from 'googleapis';
import { db } from './db.js';
import fs from 'fs';

const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/workspace/callback/google`;

/**
 * Get a Google OAuth2 client
 */
export const getOAuth2Client = (workspaceId) => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_ID,
        process.env.GOOGLE_SECRET,
        REDIRECT_URI
    );
};

export const getGmailClient = async (userId = null, credentialId = null) => {
    const whereClause = {
        platform: { in: ['GMAIL', 'gmail', 'Gmail', 'GOOGLE', 'google', 'Google'] },
        status: 'connected'
    };

    if (credentialId) {
        whereClause.id = credentialId;
    } else if (userId) {
        whereClause.userId = userId;
    }

    const credential = await db.credentials.findFirst({
        where: whereClause
    });

    if (!credential || !credential.credentials) {
        throw new Error('GMAIL_NOT_CONNECTED');
    }

    // Handle encrypted vs plain credentials based on our db.js logic
    const tokens = credential.credentials.enc ? await decryptTokens(credential.credentials) : credential.credentials;

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_ID,
        process.env.GOOGLE_SECRET,
        REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);

    // Auto-refresh token if expired
    oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
            // Update DB with new tokens
            const encrypted = await encryptTokens(newTokens);
            await db.credentials.update({
                where: { id: credential.id },
                data: { credentials: encrypted }
            });
        }
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
};

// Internal helpers for encryption (syncing with accounts/route.js logic)
async function decryptTokens(storedData) {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) return storedData;
    
    try {
        const crypto = await import('crypto');
        const ALG = 'aes-256-cbc';
        const parts = storedData.enc.split(':');
        const ivBuffer = Buffer.from(parts[0], 'hex');
        const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALG, Buffer.from(key, 'hex'), ivBuffer);
        let decrypted = decipher.update(encText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return JSON.parse(decrypted.toString());
    } catch (e) {
        console.error("[GMAIL_DECRYPT_FAILED]", e.message);
        return storedData;
    }
}

async function encryptTokens(dataObj) {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) return dataObj;
    
    try {
        const crypto = await import('crypto');
        const ALG = 'aes-256-cbc';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALG, Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(JSON.stringify(dataObj));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { enc: iv.toString('hex') + ':' + encrypted.toString('hex') };
    } catch (e) {
        console.error("[GMAIL_ENCRYPT_FAILED]", e.message);
        return dataObj;
    }
}

/**
 * Format Gmail message details
 */
export const formatMessage = (msg) => {
    try {
        const headers = msg.data.payload?.headers || [];
        
        const findHeader = (target) => {
            const h = headers.find(h => h.name && h.name.trim().toLowerCase() === target.toLowerCase());
            return h ? h.value : null;
        };

        const subject = findHeader('subject') || '(No Subject)';
        const from = findHeader('from') || 'Unknown';
        const dateStr = findHeader('date') || '';
        const snippet = msg.data.snippet || '';
        const labelIds = msg.data.labelIds || [];

        let isoDate = new Date().toISOString();
        try {
            if (dateStr) {
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) {
                    isoDate = d.toISOString();
                }
            }
        } catch (e) {}

        return {
            id: msg.data.id,
            threadId: msg.data.threadId,
            labelIds: labelIds,
            snippet,
            from,
            subject,
            date: isoDate,
            isRead: !labelIds.includes('UNREAD'),
            isStarred: labelIds.includes('STARRED')
        };
    } catch (error) {
        console.error("[FORMAT_MESSAGE_ERROR]", error);
        return {
            id: msg.data?.id || 'unknown',
            snippet: 'Error formatting message',
            from: 'System',
            subject: 'Formatting Error',
            date: new Date().toISOString(),
            isRead: true,
            isStarred: false
        };
    }
};

/**
 * Send an email
 */
export const sendMail = async (gmail, { to, subject, body, threadId = null }) => {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
    ];
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
            threadId: threadId
        }
    });

    return res.data;
};

/**
 * Add or remove labels from a message
 */
export const modifyMessage = async (gmail, messageId, addLabelIds = [], removeLabelIds = []) => {
    const res = await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            addLabelIds,
            removeLabelIds
        }
    });
    return res.data;
};

/**
 * List all labels for the account
 */
export const listLabels = async (gmail) => {
    const res = await gmail.users.labels.list({
        userId: 'me'
    });
    return res.data.labels || [];
};
