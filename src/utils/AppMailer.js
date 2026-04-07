import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import Handlebars from "handlebars";
import { db } from '@/lib/db';

export async function AppMailer(workspaceId, { to, subject, templateName, templateData, from }) {
    try {
        // 1. Get Resend Credentials for Workspace
        const credential = await db.credentials.findFirst({
            where: {
                workspaceId,
                platform: 'RESEND',
            }
        });

        let resendClient;

        if (credential && credential.credentials) {
            const creds = typeof credential.credentials === 'string' 
                ? JSON.parse(credential.credentials) 
                : credential.credentials;
            
            const apiKey = creds.apiKey || creds.api_key;
            resendClient = new Resend(apiKey);
        } else {
            // Fallback to Env
            if (!process.env.RESEND_API_KEY) {
                throw new Error("No Resend API key found for this workspace or environment");
            }
            resendClient = new Resend(process.env.RESEND_API_KEY);
        }

        // 2. Fetch Template from Database
        if (!templateName) {
            throw new Error("Template name is required");
        }

        const assignment = await db.emailAssignment.findFirst({
            where: {
                workspaceId,
                templateName
            }
        });

        if (!assignment || !assignment.content) {
            throw new Error(`Template ${templateName} not found in database or has no content.`);
        }

        let fromEmail = from || assignment.fromEmail || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        // 3. Get Global Branding for the App
        const globalSettings = await db.appSettings.findUnique({
            where: { key: 'APP_GENERAL' }
        });

        const branding = globalSettings?.social || {
            appName: 'Devlomatix',
            logoUrl: '',
            appDescription: ''
        };

        // 4. Render Template using Handlebars (Memory-safe, Production-safe)
        // Merge branding into templateData so it's available as {{appName}}, {{logoUrl}}, etc.
        const combinedData = {
            ...branding,
            appLogo: branding.logoUrl, // Alias for easier use
            platformName: branding.appName, // Alias
            ...templateData,
            workspaceId // Always include workspaceId just in case
        };

        let html = '';
        try {
            const template = Handlebars.compile(assignment.content);
            html = template(combinedData);
        } catch (error) {
            console.error("[APP_MAILER_HANDLEBARS_ERROR]", error);
            throw error;
        }

        // 5. Send via Resend
        const finalSubject = subject || assignment.subject || 'No Subject';
        const { data, error } = await resendClient.emails.send({
            from: fromEmail,
            to: to,
            subject: finalSubject,
            html: html,
        });

        if (error) {
            console.error("[RESEND_ERROR]", error);
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        console.error("[APP_MAILER_ERROR]", error);
        throw error;
    }
}
