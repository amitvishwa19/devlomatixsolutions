import { NextResponse } from "next/server";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        const { url } = await req.json();

        if (!session?.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (!url) {
            return NextResponse.json({ message: "URL is required" }, { status: 400 });
        }

        const isDevelopment = process.env.NODE_ENV === 'development';
        const urlValue = url.toLowerCase();
        
        if (!urlValue.startsWith('https://') && (!isDevelopment || !urlValue.startsWith('http://'))) {
             return NextResponse.json({ message: "Invalid URL protocol" }, { status: 400 });
        }

        console.log(`[Webhook Test] Workspace: ${workspaceId}`);
        console.log(`[Webhook Test] Target URL: ${url}`);

        try {
            const response = await axios.post(url, {
                event: "webhook.test",
                workspaceId: workspaceId,
                timestamp: new Date().toISOString(),
                message: "This is a test ping from Devlomatix Solutions."
            }, {
                timeout: 5000, 
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Devlomatix-Webhook-Test'
                }
            });

            console.log(`[Webhook Test] Success: ${response.status} ${response.statusText}`);

            return NextResponse.json({
                success: true,
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });
        } catch (axiosError) {
             console.error("[Webhook Test] Axios Error:", axiosError.message);
             if (axiosError.response) {
                 console.error("[Webhook Test] Response Status:", axiosError.response.status);
                 console.error("[Webhook Test] Response Data:", axiosError.response.data);
             }
             return NextResponse.json({
                success: false,
                message: axiosError.message,
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText
            }, { status: 200 }); 
        }

    } catch (error) {
        console.error("[Webhook Test] System Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
