/**
 * tmp/seed_wa_cloud.js
 * 
 * Seeding script for WhatsApp Cloud API Templates.
 * Generates 9 samples across all platform-supported message types.
 */

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const connectionString = process.env.APP_MODE === 'prod' ? process.env.DATABASE_URL : process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Identify Target User (Explicitly looking for bot@admin.com)
    const user = await prisma.user.findFirst({
        where: { email: 'bot@admin.com' }
    });

    if (!user) {
        console.error("User 'bot@admin.com' not found in database. Please check your account email.");
        process.exit(1);
    }
    const userId = 'cmnbhiehs000058ikhvvibcxx';
    console.log(`Using User ID [bot@admin.com]: ${userId}`);

    // 2. Define Template Suite
    const templates = [
        {
            name: "cloud_welcome_text",
            category: "UTILITY",
            language: "en_US",
            type: "text",
            body: "Hello {{1}}, welcome to BotBee! 🐝 \n\nYour order {{2}} has been received. Our team will verify it shortly.",
            footer: "Instant Support Available 24/7",
            platform: "WHATSAPP_CLOUD",
            isDefault: false,
            userId
        },
        {
            name: "cloud_promo_image",
            category: "MARKETING",
            language: "en_US",
            type: "image",
            body: "Look what just arrived! 🌟\n\nFlash Sale: Use Code *CLOUDBEE* for 15% off site-wide.",
            footer: "Valid until Sunday",
            platform: "WHATSAPP_CLOUD",
            metadata: { mediaUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000" },
            isDefault: false,
            userId
        },
        {
            name: "cloud_tutorial_video",
            category: "UTILITY",
            language: "en_US",
            type: "video",
            body: "Need help getting started?\n\nWatch this 2-minute setup guide to master the Cloud API console.",
            platform: "WHATSAPP_CLOUD",
            metadata: { mediaUrl: "https://vjs.zencdn.net/v/oceans.mp4" },
            isDefault: false,
            userId
        },
        {
            name: "cloud_service_guide",
            category: "UTILITY",
            language: "en_US",
            type: "document",
            body: "Here is your detailed service pricing guide for 2024.",
            footer: "Confidential - For Registered Users Only",
            platform: "WHATSAPP_CLOUD",
            metadata: { mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            isDefault: false,
            userId
        },
        {
            name: "cloud_store_location",
            category: "UTILITY",
            language: "en_US",
            type: "location",
            body: "Visit us at our flagship experience center!",
            platform: "WHATSAPP_CLOUD",
            metadata: {
                latitude: "37.7749",
                longitude: "-122.4194",
                locationName: "BotBee Flagship Store",
                locationAddress: "123 Market St, San Francisco, CA"
            },
            isDefault: false,
            userId
        },
        {
            name: "cloud_support_survey",
            category: "UTILITY",
            language: "en_US",
            type: "interactive-button",
            body: "Was your recent support conversation helpful?",
            buttons: ["Excellent", "Neutral", "Unsatisfied"],
            platform: "WHATSAPP_CLOUD",
            isDefault: false,
            userId
        },
        {
            name: "cloud_main_menu",
            category: "UTILITY",
            language: "en_US",
            type: "interactive-group",
            body: "Welcome to the Main Menu!\n\nPlease select an option to continue.",
            footer: "Main Menu v2.0",
            platform: "WHATSAPP_CLOUD",
            metadata: {
                listButton: "Open Menu",
                listSections: [
                    { title: "Our Products", rows: [{ title: "Enterprise", description: "Scale your business" }, { title: "Personal", description: "Budget-friendly plans" }] },
                    { title: "Get Help", rows: [{ title: "Documentation", description: "Developer API docs" }, { title: "Contact Us", description: "Talk to human support" }] }
                ]
            },
            isDefault: false,
            userId
        },
        {
            name: "cloud_product_carousel",
            category: "MARKETING",
            language: "en_US",
            type: "carousel",
            body: "Swipe through our new tech collection! 📱",
            footer: "Free Worldwide Shipping",
            platform: "WHATSAPP_CLOUD",
            metadata: {
                carouselCards: [
                    { title: "Smart Watch", description: "Amoled display, 7-day battery", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", buttonText: "View Watch" },
                    { title: "Audio Pro Buds", description: "Noise cancelling, bass boost", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", buttonText: "View Audio" },
                    { title: "Classic Camera", description: "4k Mirrorless, 24MP", imageUrl: "https://images.unsplash.com/photo-1526170315830-ef18a673990d", buttonText: "View Camera" }
                ]
            },
            isDefault: false,
            userId
        },
        {
            name: "cloud_audio_greeting",
            category: "UTILITY",
            language: "en_US",
            type: "audio",
            body: "Listen to this voice welcome note from our Founder.",
            platform: "WHATSAPP_CLOUD",
            metadata: { mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            isDefault: false,
            userId
        }
    ];

    // 3. Upsert Logic
    for (const t of templates) {
        try {
            await prisma.messageTemplate.upsert({
                where: { userId_name: { name: t.name, userId: t.userId } },
                update: t,
                create: t
            });
            console.log(`Successfully seeded: ${t.name}`);
        } catch (e) {
            console.error(`Error seeding ${t.name}:`, e.message);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
