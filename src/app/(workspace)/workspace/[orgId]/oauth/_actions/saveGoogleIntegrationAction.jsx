"use server";

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

/* -------------------------------------
   Schema
------------------------------------- */
const SaveGoogleIntegrationSchema = z.object({
    orgId: z.string(),
    code: z.string(),
});

/* -------------------------------------
   Handler
------------------------------------- */
const handler = async ({ orgId, code }) => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        /* -------------------------------------
           Exchange code → tokens
        ------------------------------------- */
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${process.env.NEXTAUTH_URL}/workspace/${orgId}/oauth/google`,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error("Google token error:", tokenData);
            return { error: "Failed to authenticate with Google" };
        }

        const {
            access_token,
            refresh_token,
            expires_in,
            scope,
            token_type,
        } = tokenData;

        /* -------------------------------------
           Save to DB
        ------------------------------------- */
        await db.appSettings.upsert({
            where: {
                orgId,
            },
            update: {
                integrations: {
                    google: {
                        connected: true,
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        scope,
                        tokenType: token_type,
                        expiresAt: new Date(
                            Date.now() + expires_in * 1000
                        ),
                    },
                },
            },
            create: {
                orgId,
                integrations: {
                    google: {
                        connected: true,
                        accessToken: access_token,
                        refreshToken: refresh_token,
                        scope,
                        tokenType: token_type,
                        expiresAt: new Date(
                            Date.now() + expires_in * 1000
                        ),
                    },
                },
            },
        });

        return {
            data: {
                success: true,
            },
        };
    } catch (error) {
        console.error("saveGoogleIntegrationAction error:", error);
        return {
            error: "Google integration failed",
        };
    }
};

/* -------------------------------------
   Export Safe Action
------------------------------------- */
export const saveGoogleIntegrationAction =
    createSafeAction(SaveGoogleIntegrationSchema, handler);
