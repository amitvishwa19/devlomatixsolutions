import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { symmetricDecrypt } from './src/lib/encryption.js';

const prisma = new PrismaClient();

async function main() {
  const template = await prisma.messageTemplate.findFirst({
    where: { category: 'UTILITY', type: 'carousel' },
    orderBy: { createdAt: 'desc' }
  });

  if (!template) {
    console.log("No carousel template found");
    return;
  }

  console.log("Testing submission for template:", template.name);

  const credential = await prisma.credentials.findFirst({
    where: { userId: template.userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
  });

  if (!credential) {
    console.log("No credentials found");
    return;
  }

  let cloudCreds = null;
  const stored = credential.credentials;
  if (typeof stored === 'string' && stored.includes(':')) {
      cloudCreds = JSON.parse(symmetricDecrypt(stored));
  } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
      cloudCreds = JSON.parse(symmetricDecrypt(stored.enc));
  }

  const getMetaHeaderHandle = async (mediaUrl, accessToken, format) => {
    const appId = process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId) return null;
    try {
        const mediaResponse = await fetch(mediaUrl);
        const buffer = Buffer.from(await mediaResponse.arrayBuffer());
        const fileLength = buffer.length;
        const fileType = mediaResponse.headers.get('content-type') || 'image/jpeg';
        const fileName = mediaUrl.split('/').pop()?.split('?')[0] || 'sample_file';

        const initiateUrl = `https://graph.facebook.com/v17.0/${appId}/uploads?file_name=${encodeURIComponent(fileName)}&file_length=${fileLength}&file_type=${fileType}&access_token=${accessToken}`;
        const initiateRes = await fetch(initiateUrl, { method: "POST" });
        const initiateData = await initiateRes.json();
        const uploadSessionId = initiateData.id;

        const uploadUrl = `https://graph.facebook.com/v17.0/${uploadSessionId}`;
        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Authorization": `OAuth ${accessToken}`,
                "file_offset": "0",
                "Content-Type": "application/octet-stream"
            },
            body: buffer
        });
        const uploadData = await uploadRes.json();
        return uploadData.h;
    } catch (error) {
        console.error("Upload error:", error);
        return null;
    }
  };

  const components = [];

  // CAROUSEL
  if (template.metadata?.cards) {
      const cards = [];

      for (const cardData of template.metadata.cards) {
          const cardComponents = [];
          
          cardComponents.push({
              type: "HEADER",
              format: "IMAGE",
              example: { header_handle: ["4::dW5rbm93bg==::"] }
          });
          
          const cText = (cardData.body || "").trim();
          cardComponents.push({ type: "BODY", text: cText || "Carousel card details" });
          
          const cButtons = [];
          if (cardData.buttons && Array.isArray(cardData.buttons)) {
              cardData.buttons.forEach(bText => {
                  const btnText = (bText || "").trim();
                  if (btnText) cButtons.push({ type: "QUICK_REPLY", text: btnText });
              });
          }
          if (cButtons.length === 0) {
              cButtons.push({ type: "QUICK_REPLY", text: "Select Option" });
          }
          cardComponents.push({ type: "BUTTONS", buttons: cButtons });

          cards.push({ components: cardComponents });
      }

      if (cards.length === 1) cards.push(cards[0]);

      if (cards.length > 0) {
          components.push({
              type: "CAROUSEL",
              cards: cards
          });
      }
  }

  const metaPayload = {
      name: "test_carousal_" + Date.now(),
      language: template.language || "en_US",
      category: (template.category || "UTILITY").toUpperCase(),
      components: components
  };

  console.log("Sending payload:", JSON.stringify(metaPayload, null, 2));

  const response = await fetch(
      `https://graph.facebook.com/v17.0/${cloudCreds.wabaId}/message_templates`,
      {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${cloudCreds.accessToken}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify(metaPayload)
      }
  );

  const result = await response.json();
  console.log("Meta Response:", JSON.stringify(result, null, 2));
}

main().finally(() => prisma.$disconnect());
