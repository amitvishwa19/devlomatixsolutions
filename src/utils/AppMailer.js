import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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
        let fromEmail = from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

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

        // 3. Render Template via Temp File (Next.js compatibility hack)
        const targetDir = path.join(process.cwd(), 'src', 'emails');
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, templateName);
        fs.writeFileSync(filePath, assignment.content, 'utf8');

        let html = '';
        try {
            // Give the Next.js dev server/webpack a tiny moment to recognize the new file
            await new Promise(resolve => setTimeout(resolve, 300));

            // Standard dynamic import (Turbopack strictly requires predictable literals)
            const module = await import(`@/emails/${templateName}`);
            const EmailComponent = module.default;
            html = await render(<EmailComponent {...(templateData || {})} />);
        } catch (error) {
            console.error("[APP_MAILER_IMPORT_ERROR]", error);
            throw error;
        }

        // 4. Send via Resend
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
