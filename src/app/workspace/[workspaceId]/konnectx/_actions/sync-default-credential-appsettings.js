'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";

const SyncDefaultCredentialSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    // Global AppSettings integration is strictly managed from the Workspace Setting Modal.
    // KonnectX account switching is isolated and does not mutate global AppSettings.
    return { success: true, message: "Global AppSettings is managed via Workspace Settings Modal" };
};

export const syncDefaultCredentialAppsettings = createSafeAction(SyncDefaultCredentialSchema, handler);
