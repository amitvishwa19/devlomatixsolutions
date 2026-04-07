import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET /api/workspace/[workspaceId]/mailer/files
export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const assignments = await db.emailAssignment.findMany({
            where: { workspaceId }
        });

        // Get unique templates
        const uniqueTemplates = new Map();
        for (const a of assignments) {
            if (!uniqueTemplates.has(a.templateName)) {
                uniqueTemplates.set(a.templateName, {
                    name: a.templateName,
                    size: a.content ? a.content.length : 0,
                    updatedAt: a.updatedAt
                });
            }
        }

        return NextResponse.json(Array.from(uniqueTemplates.values()));
    } catch (error) {
        console.error("[MAILER_FILES_GET]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/workspace/[workspaceId]/mailer/files
// Create a new template file (saves as an unassigned template in DB)
export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, content } = await req.json();
        if (!name) {
            return NextResponse.json({ message: "File name is required" }, { status: 400 });
        }

        const filename = name.endsWith(".jsx") ? name : `${name}.jsx`;

        // Check if template already exists
        const existing = await db.emailAssignment.findFirst({
            where: { workspaceId, templateName: filename }
        });

        if (existing) {
            return NextResponse.json({ message: "Template already exists" }, { status: 400 });
        }

        const defaultContent = content || `
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

export const Template = ({ name = "User" }) => (
  <Html>
    <Head />
    <Preview>Welcome to our platform!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome, {name}!</Heading>
        <Text style={text}>
          Thank you for joining us. We are excited to have you on board.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default Template;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "0",
  margin: "30px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};
`;

        // Create a dummy assignment just to store the template
        await db.emailAssignment.create({
            data: {
                workspaceId,
                event: `UNASSIGNED_${Date.now()}`,
                templateName: filename,
                subject: 'New Template',
                content: defaultContent.trim(),
                isActive: false
            }
        });

        return NextResponse.json({ message: "Template created successfully", name: filename });
    } catch (error) {
        console.error("[MAILER_FILES_POST]", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
