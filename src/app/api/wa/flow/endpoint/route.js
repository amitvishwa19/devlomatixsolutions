import { NextResponse } from "next/server";
import { WAFlowEncryption } from "@/lib/wa-flow-encryption";
import { db } from "@/lib/db";

const PRIVATE_KEY = process.env.WA_FLOW_PRIVATE_KEY;

/**
 * WhatsApp Flow Data Exchange Endpoint
 * This route handles real-time data interactions within a Flow.
 */
export async function POST(req) {
    if (!PRIVATE_KEY) {
        console.error("❌ [FlowEndpoint] WA_FLOW_PRIVATE_KEY is missing in ENV");
        return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { encrypted_flow_data, encrypted_aes_key, initial_vector } = body;

        if (!encrypted_flow_data || !encrypted_aes_key || !initial_vector) {
            return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });
        }

        // 1. Initialize Encryption
        const engine = new WAFlowEncryption(PRIVATE_KEY.replace(/\\n/g, '\n'));

        // 2. Decrypt Request
        const decryptedRequest = engine.decrypt(encrypted_flow_data, encrypted_aes_key, initial_vector);
        console.log("🔓 [FlowEndpoint] Decrypted Request:", JSON.stringify(decryptedRequest, null, 2));

        const { action, screen, data, flow_token } = decryptedRequest;

        // 3. Logic: Handle different actions/screens
        let responsePayload = {
            version: "6.0",
            screen: screen, // Stay on same screen by default
            data: {}
        };

        // Example: If user is on WELCOME screen and clicks "Start"
        if (action === "INIT") {
            // Initial data to load in the flow
            responsePayload.data = {
                greeting: "Welcome to our automated service!",
                user_name: data?.user_name || "Valued Customer"
            };
        }

        if (action === "data_exchange") {
            // Handle form submissions or dynamic updates
            // You can query DB here based on user input
            console.log(`🚀 [FlowEndpoint] Data Exchange for screen ${screen}:`, data);
            
            // Example response: Navigate to next screen or update current one
            responsePayload.data = {
                status: "success",
                message: "Data received perfectly"
            };
        }

        // 4. Encrypt Response
        const encryptedResponse = engine.encrypt(responsePayload, encrypted_aes_key, initial_vector);

        return new Response(encryptedResponse, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });

    } catch (error) {
        console.error("🔥 [FlowEndpoint] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
