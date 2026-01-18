'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

const SETTINGS_KEY = "global";

const AllowedTypes = [
    "general",
    "departments",
    "permissions",
    "notifications",
    "staff",
    "patients",
    "appointments",
    "security",
    "integrations",
    "consultation",
    "privacy",
    "terms"
];

const UpsertGeneralSetting = z.object({
    userId: z.string().optional(),
    type: z.enum(AllowedTypes),
    payload: z.any(),
});

const handler = async ({ userId, type, payload }) => {
    const session = await getServerSession(authOptions);

    // 🔐 Auth check
    if (!session || session.user.userId !== userId) {
        return { error: "Unauthorized access" };
    }

    try {
        const settings = await db.appSettings.upsert({
            where: {
                key: SETTINGS_KEY,
            },
            update: {
                [type]: payload,
            },
            create: {
                key: SETTINGS_KEY,
                [type]: payload,
            },
        });

        //console.log("@generalsetting server action:", payload);

        return {
            data: 'settings',
        };

    } catch (err) {
        console.error("Settings upsert failed:", err);
        return {
            error: "Failed to save settings",
        };
    }
};

export const upsertGeneralSetting =
    createSafeAction(UpsertGeneralSetting, handler);
