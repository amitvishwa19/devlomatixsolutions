import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";

export async function GET(req) {
    try {
        const targetDir = path.join(process.cwd(), 'src', 'emails');
        if (!fs.existsSync(targetDir)) {
            return NextResponse.json({ message: "No src/emails folder found" }, { status: 400 });
        }

        const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.jsx'));
        let migrated = 0;

        for (const filename of files) {
            console.log("Migrating", filename);
            try {
                // Dynamically import the compiled component (Next.js has pre-compiled these in dev)
                const module = await import(`@/emails/${filename}`);
                const EmailComponent = module.default;
                
                if (!EmailComponent) continue;

                // Render to HTML string
                // We pass generic safe properties to ensure no undefined crashes
                const htmlString = await render(<EmailComponent mailData={{ name: '{{mailData.name}}', boardTitle: '{{mailData.boardTitle}}', type: '{{mailData.type}}', boardUrl: '{{mailData.boardUrl}}' }} inviteUrl="{{inviteUrl}}" workspaceName="{{workspaceName}}" name="{{name}}" jobTitle="{{jobTitle}}" companyName="{{companyName}}" location="{{location}}" />);

                // Extract a simpler Handlebars-safe string by reverting the encoded brackets
                const decodedHtml = htmlString.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}');

                // Update DB with the RAW HTML instead of JSX
                await db.emailAssignment.updateMany({
                    where: { templateName: filename },
                    data: { content: decodedHtml }
                });
                migrated++;
            } catch (err) {
                console.error("Error migrating " + filename, err);
            }
        }

        return NextResponse.json({ message: `Successfully migrated ${migrated} templates to HTML!` });

    } catch (error) {
        console.error("[MIGRATE_POST]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
