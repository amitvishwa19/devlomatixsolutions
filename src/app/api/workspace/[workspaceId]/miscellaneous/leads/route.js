import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

import { symmetricDecrypt } from "@/lib/encryption";
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && !session?.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.userId || session.user.id;
        const body = await req.json();
        const { keyword, category, country, state, city, pincode, pageToken } = body;

        // 1. Fetch Google Places Credentials from DB (Look for one that actually has keys)
        const credentialRecords = await db.credentials.findMany({
            where: {
                userId,
                platform: {
                    in: ['GOOGLE_PLACES', 'google_places', 'Google Places']
                }
            }
        });

        // Find the record that most likely has the API key (has more than just profileName)
        const credentialRecord = credentialRecords.find(r => {
            if (!r.credentials) return false;
            const keys = Object.keys(r.credentials);
            return keys.some(k => k.toLowerCase().includes('key') || k.toLowerCase().includes('token'));
        }) || credentialRecords[0];

        if (!credentialRecord || !credentialRecord.credentials) {
            return NextResponse.json({ 
                success: false, 
                message: 'No Google Places API Key found in your credentials. Please add it in System > Credentials using the "GOOGLE_PLACES" platform.' 
            }, { status: 404 });
        }

        // 2. Decrypt API Key
        let apiKey = "";
        try {
            const creds = credentialRecord.credentials;
            // Support multiple possible field names, including 'enc' for fully encrypted objects
            let encryptedValue = creds.apiKey || creds['api-key'] || creds.api_key || creds.enc;
            
            if (!encryptedValue) {
                console.error("[LEADS_API] Incomplete Credentials object found:", JSON.stringify(creds));
                const availableKeys = Object.keys(creds).filter(k => k !== 'profileName').join(", ");
                throw new Error(availableKeys ? `API Key field not found. Available fields: ${availableKeys}` : "Credential object is empty. Please re-save your Google Places credentials.");
            }
            
            // Decrypt the value
            const decryptedValue = symmetricDecrypt(encryptedValue);

            // If it's a JSON string (sometimes the whole object is encrypted into 'enc'), parse it
            try {
                const parsed = JSON.parse(decryptedValue);
                apiKey = parsed.apiKey || parsed['api-key'] || parsed.api_key || decryptedValue;
            } catch (e) {
                // If not JSON, it's likely the raw API key
                apiKey = decryptedValue;
            }

            if (!apiKey) throw new Error("Could not extract API Key from decrypted credentials.");

        } catch (decryptError) {
            console.error("[LEADS_API] Decryption failed:", decryptError);
            return NextResponse.json({
                success: false,
                message: 'Failed to decrypt API Key. Please re-save your Google Places credentials.'
            }, { status: 500 });
        }

        // 3. Construct Google Places Query
        // Format: "Keyword in City, State, Country"
        // If pageToken is provided, Google ignores other search parameters
        let searchUrl = "";
        if (pageToken) {
            searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${apiKey}`;
        } else {
            const locationParts = [city, state, country].filter(Boolean).join(', ');
            const queryText = `${keyword}${category !== 'all' ? ` ${category}` : ''}${locationParts ? ` in ${locationParts}` : ''}`;
            searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryText)}&key=${apiKey}`;
        }

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.status === 'REQUEST_DENIED') {
            return NextResponse.json({ success: false, message: `Google API Error: ${searchData.error_message}` }, { status: 400 });
        }

        if (searchData.status === 'INVALID_REQUEST' && pageToken) {
             return NextResponse.json({ success: false, message: "Pagination token too fresh. Google requires a short delay (1-2s) between page requests. Please try again in a moment." }, { status: 429 });
        }

        if (!searchData.results || searchData.results.length === 0) {
            return NextResponse.json({
                success: true,
                leads: [],
                stats: { totalLeads: 0, withPhone: 0, withEmail: 0, avgRating: 0 }
            });
        }

        // 4. Fetch Details for phone/website (Standard Text Search doesn't return these)
        // We do this in parallel for all results in this batch (usually 20)
        const detailPromises = searchData.results.map(async (place) => {
            try {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website&key=${apiKey}`;
                const detailRes = await fetch(detailsUrl);
                const detailData = await detailRes.json();
                return {
                    id: place.place_id,
                    name: place.name,
                    phone: detailData.result?.formatted_phone_number || null,
                    email: null, // Google Places API does not provide emails
                    rating: place.rating || 0,
                    reviews: place.user_ratings_total || 0,
                    address: place.formatted_address || "Address not available",
                    website: detailData.result?.website || null,
                    category: category !== 'all' ? category : (place.types?.[0] || 'Business'),
                    location: place.formatted_address
                };
            } catch (err) {
                console.error(`[LEADS_API] Error fetching details for ${place.place_id}:`, err);
                return {
                    id: place.place_id,
                    name: place.name,
                    phone: null,
                    email: null,
                    rating: place.rating || 0,
                    reviews: place.user_ratings_total || 0,
                    address: place.formatted_address || "Address not available",
                    website: null,
                    category: category !== 'all' ? category : (place.types?.[0] || 'Business'),
                    location: place.formatted_address
                };
            }
        });

        const detailedLeads = await Promise.all(detailPromises);

        return NextResponse.json({
            success: true,
            leads: detailedLeads,
            nextPageToken: searchData.next_page_token || null,
            stats: {
                totalLeads: detailedLeads.length,
                withPhone: detailedLeads.filter(l => l.phone).length,
                withEmail: 0, // No emails from Google
                avgRating: (detailedLeads.reduce((acc, l) => acc + l.rating, 0) / (detailedLeads.length || 1)).toFixed(1)
            }
        });

    } catch (error) {
        console.error('Lead Generation Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
