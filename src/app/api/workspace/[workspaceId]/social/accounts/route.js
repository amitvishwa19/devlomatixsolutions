import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import crypto from 'node:crypto';
import { logger } from "@/lib/logger";

// Helper: encrypt if key available, else return a wrapper object
function safeEncrypt(dataObj) {
    const key = process.env.ENCRYPTION_KEY;
    if (key) {
        try {
            const ALG = 'aes-256-cbc';
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(ALG, Buffer.from(key, 'hex'), iv);
            let encrypted = cipher.update(JSON.stringify(dataObj));
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return { enc: iv.toString('hex') + ':' + encrypted.toString('hex') };
        } catch (e) {
            console.error("[ENCRYPT_FAILED]", e.message);
        }
    }
    // Fallback: store as plain JSON (no encryption key set)
    return dataObj;
}

// Helper: decrypt if data has enc field, else return as-is
function safeDecrypt(storedData) {
    if (!storedData) return storedData;

    const key = process.env.ENCRYPTION_KEY;

    // New format: { enc: "iv:hexdata" }
    if (storedData.enc && typeof storedData.enc === 'string' && key) {
        try {
            const ALG = 'aes-256-cbc';
            const parts = storedData.enc.split(':');
            const ivBuffer = Buffer.from(parts[0], 'hex');
            const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
            const decipher = crypto.createDecipheriv(ALG, Buffer.from(key, 'hex'), ivBuffer);
            let decrypted = decipher.update(encText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
        } catch (e) {
            console.error("[DECRYPT_FAILED]", e.message);
        }
    }

    // Legacy string format "iv:hexdata"
    if (typeof storedData === 'string' && storedData.includes(':') && key) {
        try {
            const ALG = 'aes-256-cbc';
            const parts = storedData.split(':');
            const ivBuffer = Buffer.from(parts[0], 'hex');
            const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
            const decipher = crypto.createDecipheriv(ALG, Buffer.from(key, 'hex'), ivBuffer);
            let decrypted = decipher.update(encText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
        } catch (e) {
            console.error("[DECRYPT_FAILED_LEGACY]", e.message);
        }
    }

    // Plain JSON (no encryption was used)
    return storedData;
}

// GET all connected credentials for the authenticated user
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;

        const credentials = await db.credentials.findMany({
            where: {
                OR: [
                    { userId },
                    { platform: { in: ['GMAIL', 'gmail', 'Gmail', 'GOOGLE', 'google', 'Google'] } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        const accounts = credentials.map(c => {
            const decryptedData = safeDecrypt(c.credentials);
            const account = {
                id: c.id,
                platform: c.platform,
                type: c.type,
                profileName: c.profile || decryptedData?.profileName || decryptedData?.username || `${c.platform} Account`,
                profileImage: c.avatar || decryptedData?.profileImage || decryptedData?.profile_image_url_https || null,
                avatar: c.avatar,
                userInfo: c.userInfo,
                status: c.status,
                expired: c.expired,
                expiresAt: c.expiresAt,
                environment: c.environment,
                details: decryptedData
            };
            return account;
        });

        return NextResponse.json(accounts);
    } catch (error) {
        console.error("[SOCIAL_ACCOUNTS_GET]", error.message);
        return NextResponse.json({ message: "Failed to fetch social accounts" }, { status: 500 });
    }
}

// POST link a new credential
export async function POST(req, { params }) {
    let workspaceId = null;
    try {
        const resolvedParams = await params;
        workspaceId = resolvedParams.workspaceId;

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const body = await req.json();
        const { platform, credentials, profile, status, expiresAt, environment, type } = body;

        if (!platform || !credentials) {
            return NextResponse.json({ message: "Platform and credentials are required" }, { status: 400 });
        }

        const credentialsToStore = safeEncrypt(credentials);

        const credential = await db.credentials.create({
            data: {
                platform: platform.toUpperCase(),
                userId,
                workspaceId,
                profile: profile || null,
                type: type || null,
                status: status || "disconnected",
                credentials: credentialsToStore,
                expiresAt: (expiresAt && !isNaN(new Date(expiresAt).getTime())) ? new Date(expiresAt) : null,
                environment: environment || "PROD"
            }
        });

        return NextResponse.json(credential);
    } catch (error) {
        console.error("[SOCIAL_ACCOUNTS_POST_ERROR]", error.message, error.stack);
        if (workspaceId) {
            await logger.error(`Credential saving failed: ${error.message}`, {
                workspaceId,
                type: 'SYSTEM',
                details: { error: error.message, stack: error.stack }
            });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
