import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/auth";
import { symmetricDecrypt } from "@/lib/encryption";

async function getUserIdFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const payload = await decrypt(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { keyword, category, country, state, city, pincode, pageToken, workspaceId } = body;

    if (!keyword) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    // 1. Fetch Google Places Credentials
    const credentialRecords = await db.credentials.findMany({
      where: {
        userId,
        platform: { in: ["GOOGLE_PLACES", "google_places", "Google Places"] },
      },
    });

    const credentialRecord = credentialRecords.find((r) => {
      if (!r.credentials) return false;
      const keys = Object.keys(r.credentials);
      return keys.some((k) => k.toLowerCase().includes("key") || k.toLowerCase().includes("token"));
    }) || credentialRecords[0];

    if (!credentialRecord || !credentialRecord.credentials) {
      return NextResponse.json({
        success: false,
        message: "No Google Places API Key found. Please add it in System > Credentials.",
      }, { status: 404 });
    }

    // 2. Decrypt API Key
    let apiKey = "";
    try {
      const creds = credentialRecord.credentials;
      let encryptedValue = creds.apiKey || creds["api-key"] || creds.api_key || creds.enc;
      if (!encryptedValue) {
        throw new Error("API Key field not found in credentials");
      }
      const decryptedValue = symmetricDecrypt(encryptedValue);
      try {
        const parsed = JSON.parse(decryptedValue);
        apiKey = parsed.apiKey || parsed["api-key"] || parsed.api_key || decryptedValue;
      } catch {
        apiKey = decryptedValue;
      }
      if (!apiKey) throw new Error("Could not extract API Key");
    } catch (decryptError) {
      return NextResponse.json({
        success: false,
        message: "Failed to decrypt API Key. Please re-save your Google Places credentials.",
      }, { status: 500 });
    }

    // 3. Google Places Text Search
    let searchUrl = "";
    if (pageToken) {
      searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${apiKey}`;
    } else {
      const locationParts = [city, state, country].filter(Boolean).join(", ");
      const queryText = `${keyword}${category !== "all" ? ` ${category}` : ""}${locationParts ? ` in ${locationParts}` : ""}`;
      searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryText)}&key=${apiKey}`;
    }

    let searchRes = await fetch(searchUrl);
    let searchData = await searchRes.json();

    if (searchData.status === "INVALID_REQUEST" && pageToken) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      searchRes = await fetch(searchUrl);
      searchData = await searchRes.json();
    }

    if (searchData.status === "REQUEST_DENIED") {
      return NextResponse.json({
        success: false,
        message: `Google API Error: ${searchData.error_message}`,
      }, { status: 400 });
    }

    if (!searchData.results || searchData.results.length === 0) {
      return NextResponse.json({
        success: true,
        leads: [],
        stats: { totalLeads: 0, withPhone: 0, withEmail: 0, avgRating: 0 },
        nextPageToken: null,
      });
    }

    // 4. Fetch Place Details for phone/website
    const detailPromises = searchData.results.map(async (place) => {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website&key=${apiKey}`;
        const detailRes = await fetch(detailsUrl);
        const detailData = await detailRes.json();
        return {
          id: place.place_id,
          name: place.name,
          phone: (() => {
            const rawPhone = detailData.result?.formatted_phone_number;
            if (!rawPhone) return null;
            let clean = rawPhone.replace(/\D/g, "");
            if (clean.length === 11 && clean.startsWith("0")) {
              clean = clean.substring(1);
            }
            return clean.length === 10 ? `91${clean}` : clean;
          })(),
          email: null,
          rating: place.rating || 0,
          reviews: place.user_ratings_total || 0,
          address: place.formatted_address || "Address not available",
          website: detailData.result?.website || null,
          category: category !== "all" ? category : (place.types?.[0] || "Business"),
          location: {
            address: place.formatted_address,
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng,
          },
        };
      } catch {
        return {
          id: place.place_id,
          name: place.name,
          phone: null,
          email: null,
          rating: place.rating || 0,
          reviews: place.user_ratings_total || 0,
          address: place.formatted_address || "Address not available",
          website: null,
          category: category !== "all" ? category : (place.types?.[0] || "Business"),
          location: {
            address: place.formatted_address,
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng,
          },
        };
      }
    });

    const results = await Promise.allSettled(detailPromises);
    const detailedLeads = results.filter((r) => r.status === "fulfilled").map((r) => r.value);

    // 5. Duplicate detection
    const phoneNumbers = detailedLeads.map((l) => l.phone).filter(Boolean);
    const wsId = workspaceId || "cmnbhifag000458ikwhv1zso2";
    const existingContacts = await db.contact.findMany({
      where: { workspaceId: wsId, phone: { in: phoneNumbers } },
      select: { phone: true },
    });
    const existingPhones = new Set(existingContacts.map((c) => c.phone));

    const leadsWithStatus = detailedLeads.map((lead) => ({
      ...lead,
      isSaved: existingPhones.has(lead.phone),
    }));

    return NextResponse.json({
      success: true,
      leads: leadsWithStatus,
      nextPageToken: searchData.next_page_token || null,
      stats: {
        totalLeads: leadsWithStatus.length,
        withPhone: leadsWithStatus.filter((l) => l.phone).length,
        withEmail: 0,
        avgRating: (leadsWithStatus.reduce((acc, l) => acc + l.rating, 0) / (leadsWithStatus.length || 1)).toFixed(1),
      },
    });
  } catch (error) {
    console.error("LeadGen API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
