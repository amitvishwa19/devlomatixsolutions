import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Helper: encrypt if key available, else return a wrapper object
function safeEncrypt(dataObj) {
    const key = process.env.ENCRYPTION_KEY;
    if (key) {
        try {
            const crypto = require('crypto');
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
            const crypto = require('crypto');
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
            const crypto = require('crypto');
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
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const accounts = credentials.map(c => {
            const decryptedData = safeDecrypt(c.credentials);

            return {
                id: c.id,
                platform: c.platform,
                profileName: c.profile || decryptedData?.profileName || decryptedData?.username || `${c.platform} Account`,
                status: c.status,
                expired: c.expired,
                details: decryptedData
            };
        });

        return NextResponse.json(accounts);
    } catch (error) {
        console.error("[SOCIAL_ACCOUNTS_GET]", error.message);
        return NextResponse.json({ message: "Failed to fetch social accounts" }, { status: 500 });
    }
}

// POST link a new credential
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId;
        const body = await req.json();
        const { platform, credentials, profile, status } = body;

        if (!platform || !credentials) {
            return NextResponse.json({ message: "Platform and credentials are required" }, { status: 400 });
        }

        const credentialsToStore = safeEncrypt(credentials);

        const credential = await db.credentials.create({
            data: {
                platform: platform.toUpperCase(),
                userId,
                profile: profile || null,
                status: status || "disconnected",
                credentials: credentialsToStore
            }
        });

        return NextResponse.json(credential);
    } catch (error) {
        console.error("[SOCIAL_ACCOUNTS_POST_ERROR]", error.message, error.stack);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
