import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    const results = [];

    try {
        await db.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "Message";`);
        results.push("✅ Enabled replication for Message table");
    } catch (e) {
        if (e.message?.includes("already member")) {
            results.push("ℹ️ Message table already has replication enabled");
        } else {
            results.push("❌ Error for Message: " + e.message);
        }
    }

    try {
        await db.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "DirectMessage";`);
        results.push("✅ Enabled replication for DirectMessage table");
    } catch (e) {
        if (e.message?.includes("already member")) {
            results.push("ℹ️ DirectMessage table already has replication enabled");
        } else {
            results.push("❌ Error for DirectMessage: " + e.message);
        }
    }

    return NextResponse.json({ results });
}
