import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.APP_MODE === 'prod' ? process.env.DATABASE_URL : process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createTemplates() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("No user found in the database. Please create a user first.");
      return;
    }

    const userId = user.id;
    console.log(`Using User ID: ${userId} (${user.email || user.username})`);

    const templates = [
      {
        name: "standard_text_template",
        category: "UTILITY",
        type: "text",
        body: "Hello! This is a standard WhatsApp text template. How are you doing today?",
        footer: "HealthyFine Solutions",
        status: "APPROVED"
      },
      {
        name: "image_message_template",
        category: "MARKETING",
        type: "image",
        body: "Check out this beautiful image from HealthyFine!",
        footer: "Health & Wellness",
        metadata: {
          mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
        },
        status: "APPROVED"
      },
      {
        name: "video_message_template",
        category: "MARKETING",
        type: "video",
        body: "Watch our latest wellness guide video.",
        footer: "Guided by Experts",
        metadata: {
          mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
        },
        status: "APPROVED"
      },
      {
        name: "audio_voice_note_template",
        category: "UTILITY",
        type: "audio",
        body: "Voice message from your health counselor.",
        metadata: {
          mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },
        status: "APPROVED"
      },
      {
        name: "document_message_template",
        category: "UTILITY",
        type: "document",
        body: "Your health report is attached here as a PDF.",
        footer: "Confidential",
        metadata: {
          mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        },
        status: "APPROVED"
      },
      {
        name: "contact_vcard_template",
        category: "UTILITY",
        type: "text",
        body: "Save our official contact details.",
        metadata: {
          vcard: {
            fullName: "HealthyFine Official",
            org: "HealthyFine",
            phone: "+1234567890",
            email: "support@healthyfine.com"
          }
        },
        status: "APPROVED"
      },
      {
        name: "buttons_interactive_template",
        category: "MARKETING",
        type: "interactive-button",
        body: "Would you like to book a consultation?",
        footer: "Select an option below",
        buttons: ["Yes, Book Now", "Tell me more", "Maybe later"],
        status: "APPROVED"
      },
      {
        name: "list_message_template",
        category: "UTILITY",
        type: "interactive-group",
        body: "Please choose your preferred department.",
        footer: "Tap the button to view options",
        metadata: {
          listButton: "View Departments",
          listSections: [
            {
              title: "General",
              rows: [
                { title: "OPD", description: "Outpatient Department" },
                { title: "Pharmacy", description: "Buy medicines" }
              ]
            }
          ]
        },
        status: "APPROVED"
      },
      {
        name: "carousel_advanced_template",
        category: "MARKETING",
        type: "text",
        body: "Our Top Wellness Packages:\n\n1. Gold Plan - All features included\n2. Silver Plan - Essential features\n3. Bronze Plan - Basic features",
        footer: "Reply with the plan name to subscribe",
        metadata: {
          isCarousel: true,
          plans: ["Gold", "Silver", "Bronze"]
        },
        status: "APPROVED"
      },
      {
        name: "disappearing_view_once_template",
        category: "UTILITY",
        type: "text",
        body: "Your one-time access code is: 9988. This message will disappear.",
        metadata: {
          viewOnce: true
        },
        status: "APPROVED"
      }
    ];

    console.log(`Starting creation of ${templates.length} templates...`);

    for (const template of templates) {
      await prisma.messageTemplate.upsert({
        where: {
          userId_name: {
            userId: userId,
            name: template.name
          }
        },
        update: { ...template },
        create: {
          ...template,
          userId: userId
        }
      });
      console.log(`- Created/Updated: ${template.name}`);
    }

    console.log("Template seeding completed successfully.");

  } catch (error) {
    console.error("Error seeding templates:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTemplates();
