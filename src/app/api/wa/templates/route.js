import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/options";

// Sample templates shared from the project seeder logic
const SAMPLE_TEMPLATES = [
    {
        name: "Cloud Standard Text",
        templateName: "cloud_standard_text",
        category: "UTILITY",
        language: "en_US",
        type: "text",
        body: "Hello! This is an official WhatsApp Cloud API text template. Welcome {{1}}!",
        footer: "Powered by HealthyFine UI"
    },
    {
        name: "Cloud Image Message",
        templateName: "cloud_image_message",
        category: "MARKETING",
        language: "en_US",
        type: "image",
        body: "Check out our latest product catalog here!",
        footer: "Health & Wellness",
        metadata: { mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" }
    },
    {
        name: "Cloud Video Message",
        templateName: "cloud_video_message",
        category: "MARKETING",
        language: "en_US",
        type: "video",
        body: "Watch this short tutorial on API integration.",
        footer: "Guided by Experts",
        metadata: { mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" }
    },
    {
        name: "Cloud Audio Note",
        templateName: "cloud_audio_note",
        category: "UTILITY",
        language: "en_US",
        type: "audio",
        body: "Your daily health tip voice note is ready.",
        metadata: { mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
    },
    {
        name: "Cloud Document PDF",
        templateName: "cloud_document_pdf",
        category: "UTILITY",
        language: "en_US",
        type: "document",
        body: "Your invoice #{{1}} has been generated successfully.",
        footer: "Confidential",
        metadata: { mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    },
    {
        name: "Cloud Interactive Location",
        templateName: "cloud_interactive_location",
        category: "UTILITY",
        language: "en_US",
        type: "location",
        body: "Here is the exact location for your appointment tomorrow.",
        footer: "Use maps to navigate",
        metadata: {
            latitude: "18.5204",
            longitude: "73.8567",
            locationName: "HealthyFine Headquarters",
            locationAddress: "123 Wellness Ave, Pune, 411001"
        }
    },
    {
        name: "Cloud Authentication PIN",
        templateName: "cloud_authentication_pin",
        category: "AUTHENTICATION",
        language: "en_US",
        type: "text",
        body: "Your secure login code is {{1}}. Never share it with anyone.",
        footer: "Security Team",
        buttons: ["Copy Code CTA"]
    },
    {
        name: "Cloud Quick Replies",
        templateName: "cloud_quick_replies",
        category: "MARKETING",
        language: "en_US",
        type: "interactive-button",
        body: "Would you like to speak to our representative?",
        footer: "Select an option",
        buttons: ["Yes Please!", "No, Thanks", "Later"]
    },
    {
        name: "Cloud Interactive Menu",
        templateName: "cloud_interactive_menu",
        category: "UTILITY",
        language: "en_US",
        type: "interactive-group",
        body: "Please choose the department you wish to consult.",
        footer: "Tap below",
        metadata: {
            listButton: "View Departments",
            listSections: [{
                title: "Medical",
                rows: [
                    { title: "Cardiology", description: "Heart specialists" },
                    { title: "Neurology", description: "Brain and nerves" }
                ]
            }]
        }
    },
    {
        name: "Cloud Product Carousel",
        templateName: "cloud_product_carousel",
        category: "MARKETING",
        language: "en_US",
        type: "carousel",
        body: "Browse our premium healthcare plans.",
        footer: "Swipe to view all",
        metadata: {
            isCarousel: true,
            carouselCards: [
                { title: "Gold Plan", description: "All features unlocked", imageUrl: "https://picsum.photos/300", buttonText: "Buy Gold" },
                { title: "Silver Plan", description: "Essential care", imageUrl: "https://picsum.photos/301", buttonText: "Buy Silver" },
                { title: "Bronze Plan", description: "Basic coverage", imageUrl: "https://picsum.photos/302", buttonText: "Buy Bronze" }
            ]
        }
    }
];

// Sample templates for Browser platform
const BROWSER_SAMPLES = [
    { name: "Standard Text", category: "UTILITY", language: "en_US", type: "text", body: "Hello! This is a standard WhatsApp text template. How are you doing today?", footer: "HealthyFine Solutions", platform: "WHATSAPP_BROWSER" },
    { name: "Image Message", category: "MARKETING", language: "en_US", type: "image", body: "Check out this beautiful image from HealthyFine!", footer: "Health & Wellness", metadata: { mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" }, platform: "WHATSAPP_BROWSER" },
    { name: "Video Message", category: "MARKETING", language: "en_US", type: "video", body: "Watch our latest wellness guide video.", footer: "Guided by Experts", metadata: { mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" }, platform: "WHATSAPP_BROWSER" },
    { name: "Audio Voice Note", category: "UTILITY", language: "en_US", type: "audio", body: "Voice message from your health counselor.", metadata: { mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }, platform: "WHATSAPP_BROWSER" },
    { name: "Document Message", category: "UTILITY", language: "en_US", type: "document", body: "Your health report is attached here as a PDF.", footer: "Confidential", metadata: { mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }, platform: "WHATSAPP_BROWSER" },
    { name: "Interactive Buttons", category: "MARKETING", language: "en_US", type: "interactive-button", body: "Would you like to book a consultation?", footer: "Select an option below", buttons: ["Yes, Book Now", "Tell me more", "Maybe later"], platform: "WHATSAPP_BROWSER" },
    { name: "Interactive List", category: "UTILITY", language: "en_US", type: "interactive-group", body: "Please choose your preferred department.", footer: "Tap the button to view options", metadata: { listButton: "View Departments", listSections: [{ rows: [{ title: "OPD", description: "Outpatient Department" }, { title: "Pharmacy", description: "Buy medicines" }], title: "General" }] }, platform: "WHATSAPP_BROWSER" }
];

// Sample templates for Cloud platform
const CLOUD_SAMPLES = [
    {
        name: "Cloud Standard Text",
        templateName: "cloud_standard_text",
        category: "UTILITY",
        language: "en_US",
        type: "text",
        body: "Hello! This is an official WhatsApp Cloud API text template. Welcome {{1}}!",
        footer: "Powered by HealthyFine UI",
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Image Message",
        templateName: "cloud_image_message",
        category: "MARKETING",
        language: "en_US",
        type: "image",
        body: "Check out our latest product catalog here!",
        footer: "Health & Wellness",
        metadata: { mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" },
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Video Message",
        templateName: "cloud_video_message",
        category: "MARKETING",
        language: "en_US",
        type: "video",
        body: "Watch this short tutorial on API integration.",
        footer: "Guided by Experts",
        metadata: { mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Audio Note",
        templateName: "cloud_audio_note",
        category: "UTILITY",
        language: "en_US",
        type: "audio",
        body: "Your daily health tip voice note is ready.",
        metadata: { mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Document PDF",
        templateName: "cloud_document_pdf",
        category: "UTILITY",
        language: "en_US",
        type: "document",
        body: "Your invoice #{{1}} has been generated successfully.",
        footer: "Confidential",
        metadata: { mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Interactive Location",
        templateName: "cloud_interactive_location",
        category: "UTILITY",
        language: "en_US",
        type: "location",
        body: "Here is the exact location for your appointment tomorrow.",
        footer: "Use maps to navigate",
        metadata: {
            latitude: "18.5204",
            longitude: "73.8567",
            locationName: "HealthyFine Headquarters",
            locationAddress: "123 Wellness Ave, Pune, 411001"
        },
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Authentication PIN",
        templateName: "cloud_authentication_pin",
        category: "AUTHENTICATION",
        language: "en_US",
        type: "text",
        body: "Your secure login code is {{1}}. Never share it with anyone.",
        footer: "Security Team",
        buttons: ["Copy Code CTA"],
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Quick Replies",
        templateName: "cloud_quick_replies",
        category: "MARKETING",
        language: "en_US",
        type: "interactive-button",
        body: "Would you like to speak to our representative?",
        footer: "Select an option",
        buttons: ["Yes Please!", "No, Thanks", "Later"],
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Interactive Menu",
        templateName: "cloud_interactive_menu",
        category: "UTILITY",
        language: "en_US",
        type: "interactive-group",
        body: "Please choose the department you wish to consult.",
        footer: "Tap below",
        metadata: {
            listButton: "View Departments",
            listSections: [{
                title: "Medical",
                rows: [
                    { title: "Cardiology", description: "Heart specialists" },
                    { title: "Neurology", description: "Brain and nerves" }
                ]
            }]
        },
        platform: "WHATSAPP_CLOUD"
    },
    {
        name: "Cloud Product Carousel",
        templateName: "cloud_product_carousel",
        category: "MARKETING",
        language: "en_US",
        type: "carousel",
        body: "Browse our premium healthcare plans.",
        footer: "Swipe to view all",
        metadata: {
            isCarousel: true,
            carouselCards: [
                { title: "Gold Plan", description: "All features unlocked", imageUrl: "https://picsum.photos/300", buttonText: "Buy Gold" },
                { title: "Silver Plan", description: "Essential care", imageUrl: "https://picsum.photos/301", buttonText: "Buy Silver" },
                { title: "Bronze Plan", description: "Basic coverage", imageUrl: "https://picsum.photos/302", buttonText: "Buy Bronze" }
            ]
        },
        platform: "WHATSAPP_CLOUD"
    }
];

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.userId || session.user.id;
        const { searchParams } = new URL(req.url);
        const forceSeed = searchParams.get("forceSeed") === "true";

        // 1. Check Seeding Requirements
        const hasBrowserSamples = await db.messageTemplate.findFirst({
            where: { userId, name: "Standard Text" }
        });

        const hasCloudSamples = await db.messageTemplate.findFirst({
            where: { userId, name: "Cloud Standard Text" }
        });

        const hasCredentials = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD' }
        });

        // 2. Perform Auto-Seeding (or Force Seed)
        // Seeding Browser Samples (Always for new users or if forced)
        if (!hasBrowserSamples || forceSeed) {
            console.log(`[Templates API] Seeding Browser samples for user (${userId})`);
            for (const tpl of BROWSER_SAMPLES) {
                try {
                    await db.messageTemplate.upsert({
                        where: { userId_name: { userId, name: tpl.name } },
                        update: {},
                        create: { ...tpl, userId, isDefault: true, status: 'APPROVED', approved: true }
                    });
                } catch (e) { }
            }
        }

        // Seeding Cloud Samples (If credentials exist or if forced)
        if ((!hasCloudSamples && hasCredentials) || (forceSeed && hasCredentials)) {
            console.log(`[Templates API] Seeding Cloud samples for user (${userId})`);
            for (const tpl of CLOUD_SAMPLES) {
                try {
                    await db.messageTemplate.upsert({
                        where: { userId_name: { userId, name: tpl.name } },
                        update: {},
                        create: { ...tpl, userId, isDefault: true, status: 'DRAFT', approved: false }
                    });
                } catch (e) { }
            }
        }

        // 3. Fetch ONLY user-owned templates
        const templates = await db.messageTemplate.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, templates });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(req) {
    // Reuse existing POST logic from singular route if needed
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.userId || session.user.id;
        const body = await req.json();
        const { id, name, category, language, type, body: msgBody, footer, buttons, metadata, status } = body;
        if (!name || !msgBody) {
            return NextResponse.json({ error: "Name and body are required fields." }, { status: 400 });
        }
        const cleanName = name;
        let template;
        if (id) {
            const existing = await db.messageTemplate.findUnique({ where: { id } });
            if (!existing || existing.userId !== userId) {
                return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 403 });
            }
            template = await db.messageTemplate.update({
                where: { id },
                data: {
                    name: cleanName,
                    category: category || "UTILITY",
                    language: language || "en_US",
                    type: type || "TEXT",
                    body: msgBody,
                    footer: footer || null,
                    buttons: buttons || [],
                    metadata: metadata || null,
                    status: status || "DRAFT"
                }
            });
        } else {
            const existingName = await db.messageTemplate.findFirst({ where: { userId, name: cleanName } });
            if (existingName) {
                return NextResponse.json({ error: "A template with this name already exists." }, { status: 400 });
            }
            template = await db.messageTemplate.create({
                data: {
                    userId,
                    name: cleanName,
                    category: category || "UTILITY",
                    language: language || "en_US",
                    type: type || "TEXT",
                    body: msgBody,
                    footer: footer || null,
                    buttons: buttons || [],
                    metadata: metadata || null,
                    status: "PENDING"
                }
            });
        }
        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error("Error saving template:", error);
        return NextResponse.json({ error: error?.message || "Failed to save template" }, { status: 500 });
    }
}
