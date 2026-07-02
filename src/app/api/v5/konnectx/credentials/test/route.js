import { NextResponse } from "next/server";
import * as cloudApi from "../../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";

export async function POST(request) {
  try {
    const body = await request.json();
    const { accessToken, phoneNumberId } = body;

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ error: "accessToken and phoneNumberId are required" }, { status: 400 });
    }

    const result = await cloudApi.testCloudConnection({ accessToken, phoneNumberId });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
