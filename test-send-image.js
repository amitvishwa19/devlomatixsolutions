import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { symmetricDecrypt } from './src/lib/encryption.js';
import * as cloudApi from './src/app/workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api.js';
dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const cred = await prisma.credentials.findFirst({
      where: {
        platform: 'WHATSAPP_CLOUD',
        isDefault: true
      }
    });

    if (!cred) {
      console.error("No default credentials found!");
      return;
    }

    let cloudCredentials = null;
    const stored = cred.credentials;
    if (stored) {
      if (typeof stored === 'string' && stored.includes(':')) {
        try { cloudCredentials = JSON.parse(symmetricDecrypt(stored)); } catch (e) { }
      } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
        try { cloudCredentials = JSON.parse(symmetricDecrypt(stored.enc)); } catch (e) { }
      } else if (typeof stored === 'object') {
        cloudCredentials = stored;
      } else {
        try { cloudCredentials = JSON.parse(stored); } catch (e) { }
      }
    }
    if (cloudCredentials?.enc) {
      try { cloudCredentials = JSON.parse(symmetricDecrypt(cloudCredentials.enc)); } catch (e) { }
    }

    const testPhone = "919712340450"; // We saw this was active in message logs
    const imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"; // A standard high-quality public image URL
    console.log("Sending direct media image to:", testPhone);
    console.log("Image URL:", imageUrl);
    console.log("Calling sendMediaMessage...");

    const result = await cloudApi.sendMediaMessage(cloudCredentials, testPhone, 'image', imageUrl, "Test Image Caption");
    console.log("Send Result:", JSON.stringify(result, null, 2));

  } catch (err) {
    console.error("Test send failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
