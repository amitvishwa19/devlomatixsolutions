import { NextResponse } from 'next/server';
import { waManager } from '@/lib/whatsapp-v2';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const status = waManager.getState();
        console.log(`[Auth API] GET Status: ${status}, User: ${session?.user?.userId || 'none'}`);
        
        // Auto-connect if not connected but has session in DB
        if (status === 'welcome' && session?.user?.userId) {
            const auth = await db.whatsAppAuth.findUnique({
                where: { sessionId: session.user.userId }
            });
            
            if (auth && auth.credentials) {
                console.log("[Auth API] Auto-connecting session for user:", session.user.userId);
                waManager.connect(session.user.userId);
            } else {
                console.log("[Auth API] No saved credentials found for user:", session.user.userId);
            }
        }

        const qr = waManager.getQrCodeString();
        const currentStatus = waManager.getState();
        
        let authRecord = null;
        if (session?.user?.userId) {
            authRecord = await db.whatsAppAuth.findUnique({
                where: { sessionId: session.user.userId }
            });
        }

        return NextResponse.json({ 
            status: currentStatus,
            qr,
            metadata: authRecord?.metadata || {},
            user: waManager.getUser(),
            messages: waManager.getMessages() 
        });
    } catch (error) {
        console.error("[Auth API] GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        console.log(`[Auth API] POST Connect, User: ${session?.user?.userId || 'none'}`);
        if (!session?.user?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        waManager.connect(session.user.userId);
        return NextResponse.json({ success: true, status: waManager.getState() });
    } catch (error) {
        console.error("[Auth API] POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.userId;
        
        await waManager.disconnect();
        
        if (userId) {
            console.log(`[Auth API] Clearing session records from DB for user: ${userId}`);
            await db.whatsAppAuth.deleteMany({
                where: { sessionId: userId }
            });
            // also clear keys
            // CASCADE handles this in Prisma (from schema.prisma)
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Auth API] DELETE Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { deviceInfo } = await req.json();
        
        const sessionId = session.user.userId;
        
        const updatedAuth = await db.whatsAppAuth.upsert({
            where: { sessionId },
            update: {
                phoneNumber: deviceInfo?.phoneNumber,
                deviceName: deviceInfo?.deviceName,
                platform: deviceInfo?.platform,
                connectedAt: deviceInfo?.connectedAt,
                status: 'CONNECTED',
                userId: session.user.userId,
                isActive: true
            },
            create: {
                sessionId,
                userId: session.user.userId,
                phoneNumber: deviceInfo?.phoneNumber,
                deviceName: deviceInfo?.deviceName,
                platform: deviceInfo?.platform,
                connectedAt: deviceInfo?.connectedAt,
                status: 'CONNECTED',
                isActive: true
            }
        });

        return NextResponse.json({ success: true, data: updatedAuth });
    } catch (error) {
        console.error("PUT Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { metadata } = await req.json();
        const sessionId = session.user.userId;

        const auth = await db.whatsAppAuth.findUnique({ where: { sessionId } });
        if (!auth) {
            return NextResponse.json({ error: "No WhatsApp instance found. Connect first." }, { status: 404 });
        }

        const currentMetadata = typeof auth.metadata === 'object' && auth.metadata !== null ? auth.metadata : {};
        
        // Merge and validate testNumbers if provided
        const updatedMetadata = {
            ...currentMetadata,
            ...metadata
        };

        if (updatedMetadata.testNumbers) {
            updatedMetadata.testNumbers = Array.isArray(updatedMetadata.testNumbers) 
                ? updatedMetadata.testNumbers.slice(0, 5) 
                : [];
        }

        const updated = await db.whatsAppAuth.update({
            where: { sessionId },
            data: { metadata: updatedMetadata }
        });

        return NextResponse.json({ success: true, metadata: updated.metadata });
    } catch (error) {
        console.error("[Auth API] PATCH Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
