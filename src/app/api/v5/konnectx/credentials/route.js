import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricEncrypt, symmetricDecrypt } from "@/lib/encryption";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const credentials = await db.credentials.findMany({
      where: { userId, platform: { in: ['WHATSAPP', 'WHATSAPP_CLOUD'] } },
      orderBy: { updatedAt: 'desc' }
    });

    const processedCredentials = credentials.map(cred => {
      let phoneNumberId = '';
      let wabaId = '';
      let accessToken = '';
      let googlePlaceId = '';
      let defaultTemplateId = '';
      
      const stored = cred.credentials;
      if (stored) {
        let decrypted = null;
        if (typeof stored === 'string' && stored.includes(':')) {
          try {
            decrypted = JSON.parse(symmetricDecrypt(stored));
          } catch (e) { }
        } else if (typeof stored === 'object' && stored.enc && typeof stored.enc === 'string' && stored.enc.includes(':')) {
          try {
            decrypted = JSON.parse(symmetricDecrypt(stored.enc));
          } catch (e) { }
        } else if (typeof stored === 'object' && !stored.enc) {
          decrypted = stored;
        }

        if (decrypted) {
          phoneNumberId = decrypted.phoneNumberId || decrypted.phone_number_id || '';
          wabaId = decrypted.wabaId || decrypted.waba_id || '';
          accessToken = decrypted.accessToken || decrypted.system_access_token || decrypted.token || '';
          googlePlaceId = decrypted.googlePlaceId || '';
          defaultTemplateId = decrypted.defaultTemplateId || '';
        }
      }

      return {
        ...JSON.parse(JSON.stringify(cred)),
        profile: cred.profile || '',
        phoneNumberId,
        wabaId,
        accessToken,
        googlePlaceId,
        defaultTemplateId
      };
    });

    return NextResponse.json({ data: { success: true, credentials: processedCredentials } });
  } catch (error) {
    console.error("GET credentials error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch credentials" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const body = await request.json();
    const { id, profile, phoneNumberId, wabaId, accessToken } = body;

    if (!phoneNumberId || !wabaId || (!id && !accessToken)) {
      return NextResponse.json({ error: "phoneNumberId, wabaId and accessToken are required" }, { status: 400 });
    }

    let account;
    let finalEncrypted;

    if (id) {
      const oldAccount = await db.credentials.findFirst({ where: { id, userId } });
      if (!oldAccount) {
        return NextResponse.json({ error: "Credential not found" }, { status: 404 });
      }

      const oldCredsRaw = oldAccount.credentials;
      let oldDecrypted = null;

      if (typeof oldCredsRaw === 'string') {
        if (oldCredsRaw.includes(':')) {
          try {
            oldDecrypted = JSON.parse(symmetricDecrypt(oldCredsRaw));
          } catch (e) {}
        } else {
          try {
            oldDecrypted = JSON.parse(oldCredsRaw);
          } catch (e) {}
        }
      } else if (typeof oldCredsRaw === 'object' && oldCredsRaw !== null) {
        if (oldCredsRaw.enc && typeof oldCredsRaw.enc === 'string' && oldCredsRaw.enc.includes(':')) {
          try {
            oldDecrypted = JSON.parse(symmetricDecrypt(oldCredsRaw.enc));
          } catch (e) {}
        } else {
          oldDecrypted = oldCredsRaw;
        }
      }

      let finalAccessToken = accessToken;
      if (!finalAccessToken || String(finalAccessToken).trim() === '') {
        if (oldDecrypted) {
          finalAccessToken = oldDecrypted.accessToken || oldDecrypted.system_access_token || oldDecrypted.token;
        }
      }

      const credObj = {
        accessToken: finalAccessToken,
        phoneNumberId: phoneNumberId || oldDecrypted?.phoneNumberId || oldDecrypted?.phone_number_id,
        wabaId: wabaId || oldDecrypted?.wabaId || oldDecrypted?.waba_id,
      };

      finalEncrypted = symmetricEncrypt(JSON.stringify(credObj));

      account = await db.credentials.update({
        where: { id },
        data: {
          profile,
          credentials: { enc: finalEncrypted },
          status: 'connected'
        }
      });
    } else {
      const credObj = {
        accessToken,
        phoneNumberId,
        wabaId,
      };
      finalEncrypted = symmetricEncrypt(JSON.stringify(credObj));

      const existingCreds = await db.credentials.findFirst({
        where: { userId, platform: 'WHATSAPP_CLOUD' }
      });

      account = await db.credentials.create({
        data: {
          userId,
          platform: 'WHATSAPP_CLOUD',
          profile,
          credentials: { enc: finalEncrypted },
          status: 'connected',
          isDefault: !existingCreds
        }
      });
    }

    return NextResponse.json({ success: true, accountId: account.id });
  } catch (error) {
    console.error("POST credentials error:", error);
    return NextResponse.json({ error: error.message || "Failed to save credentials" }, { status: 500 });
  }
}
