'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const TestMetaApiSchema = z.object({
    workspaceId: z.string(),
    url: z.string(),
    method: z.string().optional().default('GET'),
    headers: z.any().optional(),
    body: z.any().optional(),
});

const handler = async (data) => {
    const { workspaceId, url, method, headers, body } = data;
    console.log(`[TestMetaApi] Requesting: ${method} ${url}`);

    try {
        await ensureWorkspaceAccess(workspaceId);



        // Security check: ensure the URL is actually a Meta Graph API URL or similar
        if (!url.startsWith('https://graph.facebook.com/')) {
            return { error: "Invalid API target URL. Only Meta Graph API is allowed." };
        }

        const options = {
            method,
            headers: {
                ...headers,
                'Content-Type': headers?.['Content-Type'] || 'application/json',
            },
        };

        if (method?.toUpperCase() !== 'GET' && method?.toUpperCase() !== 'HEAD' && body) {
            console.log("[TestMetaApi] Body:", body);
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const result = await response.json();
        console.log("[result] result:", result);
        return {
            data: {
                success: response.ok,
                status: response.status,
                statusText: response.statusText,
                apiData: JSON.parse(JSON.stringify(result)),
                error: response.ok ? null : (result.error?.message || response.statusText)
            }
        };
    } catch (error) {
        return { error: error.message || "Request failed" };
    }
};

export const testMetaApi = createSafeAction(TestMetaApiSchema, handler);
