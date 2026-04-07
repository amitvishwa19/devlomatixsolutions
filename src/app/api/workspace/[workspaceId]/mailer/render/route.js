import { NextResponse } from "next/server";
import Handlebars from "handlebars";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { filename, data, content, instrument } = await req.json();
        if (!filename && !content) {
            return NextResponse.json({ message: "Filename or content is required" }, { status: 400 });
        }

        let templateContent = content;

        // If content is not provided, fetch from DB
        if (!templateContent) {
            const assignment = await db.emailAssignment.findFirst({
                where: {
                    workspaceId,
                    templateName: filename
                }
            });

            if (!assignment || !assignment.content) {
                return NextResponse.json({ message: "Template not found" }, { status: 404 });
            }
            templateContent = assignment.content;
        }

        // 2. Fetch global app settings (Identity, Branding, Logo)
        const globalSettings = await db.appSettings.findUnique({
            where: { key: 'APP_GENERAL' }
        });

        const branding = globalSettings?.social || {
            appName: "Devlomatix",
            logoUrl: "",
            appDescription: "Your Productivity Platform"
        };

        // Inject instrumentation markers if requested
        let instrumentedContent = templateContent || '';
        if (instrument && instrumentedContent) {
            instrumentedContent = instrumentedContent.split('\n').map((line, idx) => {
                // Find first HTML tag start and inject line number
                // Regex: Starts with < followed by alphanumeric tag name, then space or closure
                return line.replace(/<([a-zA-Z0-9]+)(\s|>)/, `<$1 data-source-line="${idx + 1}"$2`);
            }).join('\n');
        }

        // 3. Compile HTML dynamically using Handlebars
        try {
            const template = Handlebars.compile(instrumentedContent);
            const combinedData = {
                ...branding,
                appLogo: branding.logoUrl, // Alias for easier use in templates
                platformName: branding.appName, // Alias
                ...data,
                workspaceId
            };
            const html = template(combinedData);
            
            return NextResponse.json({ html });
        } catch (engineError) {
            console.error("[HANDLEBARS_ERROR]", engineError);
            return NextResponse.json({ message: `Template compilation error: ${engineError.message}` }, { status: 500 });
        }

    } catch (error) {
        console.error("[MAILER_RENDER_POST]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
