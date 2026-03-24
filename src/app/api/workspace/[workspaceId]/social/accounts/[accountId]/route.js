import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Helper: encrypt if key available, else return data as-is
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
    return dataObj;
}

// PATCH update a specific credential
export async function PATCH(req, { params }) {
    try {
        const { workspaceId, accountId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { platform, credentials, profile, status, expired } = body;

        if (!credentials) {
            return NextResponse.json({ message: "Credentials are required" }, { status: 400 });
        }

        const credentialsToStore = safeEncrypt(credentials);

        const updatedCredential = await db.credentials.update({
            where: { id: accountId },
            data: {
                platform: platform?.toUpperCase(),
                profile: profile !== undefined ? profile : undefined,
                status: status !== undefined ? status : undefined,
                expired: expired !== undefined ? expired : undefined,
                credentials: credentialsToStore
            }
        });

        return NextResponse.json(updatedCredential);
    } catch (error) {
        console.error("[SOCIAL_ACCOUNT_PATCH_ERROR]", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE a specific credential
export async function DELETE(req, { params }) {
    try {
        const { workspaceId, accountId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db.credentials.delete({
            where: { id: accountId }
        });

        return NextResponse.json({ message: "Credential deleted successfully" });
    } catch (error) {
        console.error("[SOCIAL_ACCOUNT_DELETE]", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
