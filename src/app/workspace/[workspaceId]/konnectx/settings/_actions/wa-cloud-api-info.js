'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const WaCloudApiInfoSchema = z.object({
    workspaceId: z.string(),
    accessToken: z.string(),
    phoneNumberId: z.string().optional(),
    version: z.string().optional().default('v25.0'),
});

const handler = async (data) => {
    const { workspaceId, accessToken, phoneNumberId, version } = data;
    console.log(`[WaCloudApiInfo] Fetching info for workspace: ${workspaceId}`);

    try {
        await ensureWorkspaceAccess(workspaceId);

        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        const requests = [];

        // 1. Debug Token (App Info)
        requests.push(
            fetch(`https://graph.facebook.com/${version}/debug_token?input_token=${accessToken}`, { headers })
                .then(res => res.json())
        );

        // 2. & 3. Display Names and OBA Status (if phoneId provided)
        if (phoneNumberId) {
            requests.push(
                fetch(`https://graph.facebook.com/${version}/${phoneNumberId}?fields=verified_name,name_status`, { headers })
                    .then(res => res.json())
            );
            requests.push(
                fetch(`https://graph.facebook.com/${version}/${phoneNumberId}?fields=name_status,code_verification_status`, { headers })
                    .then(res => res.json())
            );
        }

        const [appInfo, displayNames, obaStatus] = await Promise.all(requests);

        return {
            data: {
                success: true,
                appInfo: {
                    success: !!appInfo?.data,
                    data: appInfo?.data,
                    error: appInfo?.error?.message
                },
                displayNames: displayNames ? {
                    success: !displayNames?.error,
                    data: displayNames,
                    error: displayNames?.error?.message
                } : null,
                obaStatus: obaStatus ? {
                    success: !obaStatus?.error,
                    data: obaStatus,
                    error: obaStatus?.error?.message
                } : null
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch cloud API info" };
    }
};

export const waCloudApiInfo = createSafeAction(WaCloudApiInfoSchema, handler);
