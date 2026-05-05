import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";



export async function GET(request, { params }) {
  const { workspaceId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const stores = await db.eCommerceStore.findMany({
      where: { userId: session.user.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, stores });
  } catch (error) {
    console.error("[GET_STORES_ERROR]", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  console.log('post from frontend');
  const data = await request.json();

  const { appIdentifier, storeName, webhookUrl, apiKey, isActive } = data

  //const { appIdentifier, storeName, webhookUrl, apiKey, isActive } = await request.json();
  //this will be the incoming data that frontend will send 


  console.log(appIdentifier);
  console.log(storeName);
  console.log(webhookUrl);
  console.log(apiKey);
  console.log(isActive);

  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API Key is required" }, { status: 400 });
  }

  let decryptedApiKey;
  try {
    decryptedApiKey = symmetricDecrypt(apiKey);
    console.log("🚀 ~ symmetricDecrypt decryptedApiKey:", decryptedApiKey)
  } catch (error) {
    console.error("[DECRYPTION_ERROR]", error.message);
    return NextResponse.json({ success: false, message: "Invalid API Key format or decryption failed" }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "post from frontend" }, { status: 202 });
}