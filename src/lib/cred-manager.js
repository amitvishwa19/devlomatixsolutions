/**
 * cred-manager.js
 * 
 * Credential Manager — Platform Connection Testing Library
 * 
 * Each platform tester receives the decrypted credentials object
 * and returns: { success: boolean, message: string, data?: any }
 * 
 * To add a new platform, add a function to PLATFORM_TESTERS
 * matching the platform name (uppercase).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { symmetricDecrypt } from "./encryption";

// ─────────────────────────────────────────────────────────────────────────────
// Platform Testers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Helper: make a fetch request with a timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }
        return { ok: res.ok, status: res.status, data };
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Facebook / Meta Graph API
 * Required keys: accessToken (or access_token)
 */
async function testFacebook(credentials) {
    const token = credentials.accessToken || credentials.access_token || credentials.token;
    if (!token) return { success: false, message: 'Missing accessToken in credentials' };

    const { ok, data } = await fetchWithTimeout(
        `https://graph.facebook.com/me?access_token=${token}&fields=id,name,picture.type(large)`
    );
    if (ok && data?.id) {
        return { 
            success: true, 
            message: `Connected as ${data.name} (${data.id})`, 
            data: {
                ...data,
                profileName: data.name,
                profileImage: data.picture?.data?.url
            } 
        };
    }
    return { success: false, message: data?.error?.message || 'Connection failed', data };
}

/**
 * Instagram (Graph API — requires Facebook access token)
 * Required keys: accessToken
 */
async function testInstagram(credentials) {
    // Be more flexible with key names (e.g. accessToken, access_token, TOKEN, etc.)
    const token = credentials.accessToken || credentials.access_token || credentials.token || 
                  credentials['access-token'] || credentials.AccessToken;
    const igUserId = credentials.igUserId || credentials.ig_user_id || credentials.IGUserId ||
                     credentials['ig-user-id'] || credentials.userId;

    if (!token) return { success: false, message: 'Missing "accessToken" field. Please ensure the key name is correct.' };

    // If igUserId is provided, test the Business/Graph API (preferred for publishing)
    if (igUserId) {
        const testUrlValue = `https://graph.facebook.com/v18.0/${igUserId}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(token)}`;
        console.log(`[INSTAGRAM_TEST_DEBUG] URL: ${testUrlValue.replace(token, 'REDACTED')}`);
        
        const { ok, status, data } = await fetchWithTimeout(testUrlValue);
        if (ok && data?.id) {
            return { 
                success: true, 
                message: `Connected as ${data.name} (@${data.username})`, 
                data: {
                    ...data,
                    profileName: data.name || data.username,
                    profileImage: data.profile_picture_url
                } 
            };
        }
        console.error("[INSTAGRAM_TEST_ERROR_BUSINESS]", status, JSON.stringify(data));
        return { success: false, message: data?.error?.message || 'Instagram Business API connection failed', data };
    }

    // Fallback: Test the Basic Display API (if only token is available)
    console.log("[INSTAGRAM_TEST_DEBUG] Testing Basic Display API fallback...");
    const { ok, status, data } = await fetchWithTimeout(
        `https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(token)}`
    );
    if (ok && data?.id) {
        return { 
            success: true, 
            message: `Connected to Basic API as @${data.username}. Note: Business ID (igUserId) is required for publishing.`, 
            data 
        };
    }
    
    console.error("[INSTAGRAM_TEST_ERROR_BASIC]", status, JSON.stringify(data));
    return { 
        success: false, 
        message: 'Instagram connection failed. For publishing, please provide "igUserId" (Business Account ID).', 
        data 
    };
}

/**
 * Twitter / X API v2
 * Required keys: bearerToken (or bearer_token)
 */
async function testTwitter(credentials) {
    const apiKey = (credentials.apiKey || credentials['api-key'] || '').trim();
    const apiSecret = (credentials.apiSecret || credentials['api-secret'] || '').trim();
    const accessToken = (credentials.accessToken || credentials['access-token'] || '').trim();
    const accessSecret = (credentials.accessSecret || credentials['access-secret'] || '').trim();

    console.log(`[TWITTER_TEST] Fields present: apiKey=${!!apiKey}, apiSecret=${!!apiSecret}, accessToken=${!!accessToken}, accessSecret=${!!accessSecret}`);

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
        // Fallback for just Bearer Token if provided
        const bearerToken = (credentials.bearerToken || credentials.bearer_token || credentials.token || '').trim();
        if (bearerToken) {
            console.log(`[TWITTER_TEST] Attempting legacy Bearer token test...`);
            const { ok, status, data } = await fetchWithTimeout(
                'https://api.twitter.com/2/tweets/search/recent?query=twitter',
                { headers: { Authorization: `Bearer ${bearerToken}` } }
            );
            if (ok) return { success: true, message: 'Bearer Token Valid (Read-only access confirmed)', data };
            return { success: false, message: 'Invalid Bearer Token', data };
        }
        return { success: false, message: 'Twitter requires apiKey, apiSecret, accessToken, and accessSecret for full connection' };
    }

    // 1. OAuth 1.0a Verification (required for posting)
    try {
        const crypto = require('crypto');
        const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
        const method = 'GET';

        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = crypto.randomBytes(16).toString('hex');

        const oauthParams = {
            oauth_consumer_key: apiKey,
            oauth_nonce: nonce,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: timestamp,
            oauth_token: accessToken,
            oauth_version: '1.0',
        };

        const paramString = Object.entries(oauthParams)
            .sort()
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');

        const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
        const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;
        const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

        const authHeader = 'OAuth ' + Object.entries({ ...oauthParams, oauth_signature: signature })
            .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
            .join(', ');

        console.log(`[TWITTER_TEST] Calling verify_credentials...`);
        const { ok, status, data } = await fetchWithTimeout(
            url,
            { headers: { Authorization: authHeader } }
        );

        if (ok && data?.screen_name) {
            console.log(`[TWITTER_TEST_SUCCESS] Connected as @${data.screen_name}`);
            return { 
                success: true, 
                message: `Connected as @${data.screen_name}`, 
                data: {
                    ...data,
                    profileName: data.name || data.screen_name,
                    profileImage: data.profile_image_url_https?.replace('_normal', '') // Get high-res version
                } 
            };
        }

        console.error(`[TWITTER_TEST_FAIL] status=${status}`, data);
        const errorMsg = data?.errors?.[0]?.message || 'Verification failed';
        return { success: false, message: `Twitter connection failed: ${errorMsg}`, data };

    } catch (err) {
        console.error(`[TWITTER_TEST_EXCEPTION]`, err);
        return { success: false, message: `Twitter verification exception: ${err.message}` };
    }
}

/**
 * LinkedIn API v2
 * Required keys: accessToken
 */
async function testLinkedIn(credentials) {
    const token = (credentials.accessToken || credentials.access_token || credentials.token || '').trim();
    const orgUrnOrId = (credentials.organizationUrn || credentials.organization_urn || '').trim();

    if (!token) return { success: false, message: 'Missing accessToken in credentials' };

    const headers = { 
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Accept': 'application/json'
    };

    // 1. Get user profile (Try Legacy /v2/me first, then fallback to OIDC /v2/userinfo)
    let profileRes = await fetchWithTimeout('https://api.linkedin.com/v2/me', { headers });
    
    if (!profileRes.ok && profileRes.status === 401) {
        // Fallback to OpenID Connect userinfo (Modern 2024+ standard)
        profileRes = await fetchWithTimeout('https://api.linkedin.com/v2/userinfo', { headers });
    }
    
    if (!profileRes.ok) {
        let errorMsg = 'Failed to verify LinkedIn profile';
        if (profileRes.status === 401) errorMsg = 'Invalid or expired access token';
        if (profileRes.status === 403) errorMsg = 'Token lacks profile permission (openid/profile or r_liteprofile)';
        return { success: false, message: errorMsg, data: profileRes.data };
    }

    const dMe = profileRes.data;
    const firstName = dMe.localizedFirstName || dMe.given_name || '';
    const lastName = dMe.localizedLastName || dMe.family_name || '';
    const name = `${firstName} ${lastName}`.trim() || dMe.name || 'LinkedIn User';
    const profileImage = dMe.picture || dMe.profile_picture || null;

    // 2. If organizationUrn is provided, verify access
    if (orgUrnOrId) {
        const author = String(orgUrnOrId).startsWith('urn:li:') 
            ? orgUrnOrId 
            : `urn:li:organization:${orgUrnOrId}`;
        
        const { ok: okOrg, status: sOrg, data: dOrg } = await fetchWithTimeout(
            `https://api.linkedin.com/v2/organizationAcls?q=organization&organization=${encodeURIComponent(author)}&role=ADMINISTRATOR&state=APPROVED`,
            { headers }
        );

        if (okOrg && dOrg?.elements?.length > 0) {
            return { 
                success: true, 
                message: `Connected as ${name} (Admin for ${author})`, 
                data: { 
                    me: dMe, 
                    org: dOrg,
                    profileName: name,
                    profileImage: profileImage
                } 
            };
        } else {
            let detail = `Administrator access not found for ${author}.`;
            if (sOrg === 403) detail = `Token lacks permission for organization data (w_organization_social or Community Management API).`;
            if (sOrg === 401) detail = `Token became invalid while checking organization.`;
            return { 
                success: false, 
                message: `Token is valid for ${name}, but ${detail}`, 
                data: { me: dMe, org: dOrg, status: sOrg } 
            };
        }
    }

    return { 
        success: true, 
        message: `Connected as ${name}`, 
        data: {
            ...dMe,
            profileName: name,
            profileImage: profileImage
        } 
    };
}

/**
 * WhatsApp Business Cloud API
 * Required keys: accessToken, phoneNumberId (or phone_number_id)
 */
async function testWhatsApp(credentials) {
    const token = credentials.accessToken || credentials.access_token;
    const phoneId = credentials.phoneNumberId || credentials.phone_number_id;
    if (!token) return { success: false, message: 'Missing accessToken in credentials' };
    if (!phoneId) return { success: false, message: 'Missing phoneNumberId in credentials' };

    const { ok, status, data } = await fetchWithTimeout(
        `https://graph.facebook.com/v18.0/${phoneId}?fields=display_phone_number,verified_name`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (ok && data?.id) {
        return { 
            success: true, 
            message: `Connected: ${data.verified_name} (${data.display_phone_number})`, 
            data: {
                ...data,
                profileName: data.verified_name,
                profileImage: null // WhatsApp Cloud API doesn't easily expose profile pic per ID without extra scope
            } 
        };
    }
    if (status === 401) return { success: false, message: 'Invalid or expired access token', data };
    return { success: false, message: data?.error?.message || 'Connection failed', data };
}

/**
 * YouTube Data API v3
 * Required keys: apiKey (or api-key, api_key)
 */
async function testYouTube(credentials) {
    const key = credentials.apiKey || credentials['api-key'] || credentials.api_key;
    if (!key) return { success: false, message: 'Missing apiKey in credentials' };

    const { ok, data } = await fetchWithTimeout(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key=${key}`
    );
    if (ok && data?.items?.[0]) {
        const item = data.items[0];
        return { 
            success: true, 
            message: `Connected to YouTube channel: ${item.snippet?.title}`, 
            data: {
                ...item,
                profileName: item.snippet?.title,
                profileImage: item.snippet?.thumbnails?.default?.url
            } 
        };
    }
    return { success: false, message: data?.error?.message || 'Invalid API key', data };
}

/**
 * Google Places API (New/Old)
 * Required keys: apiKey
 */
async function testGooglePlaces(credentials) {
    const key = (credentials.apiKey || credentials['api-key'] || credentials.api_key || '').trim();
    if (!key) return { success: false, message: 'Missing apiKey' };

    // Test with a simple Find Place request (lightweight)
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Google&inputtype=textquery&fields=name&key=${key}`;
    const { ok, data } = await fetchWithTimeout(url);

    if (ok && data?.status === 'OK') {
        const placeName = data.candidates?.[0]?.name || 'Google';
        return { 
            success: true, 
            message: `Places API Valid - Found: ${placeName}`, 
            data: { 
                profileName: "Google Places API",
                ...data 
            } 
        };
    }

    if (data?.status === 'REQUEST_DENIED') {
        return { success: false, message: `Access Denied: ${data.error_message}`, data };
    }

    return { success: false, message: data?.status || 'Connection failed', data };
}

/**
 * Google / Gmail API
 * Required keys: access_token (or accessToken)
 */
async function testGoogle(credentials) {
    const token = credentials.access_token || credentials.accessToken || credentials.token;
    if (!token) return { success: false, message: 'Missing access_token in credentials' };

    const { ok, data } = await fetchWithTimeout(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (ok && data?.email) {
        return { 
            success: true, 
            message: `Connected as ${data.email}`, 
            data: {
                ...data,
                profileName: data.name || data.email,
                profileImage: data.picture
            } 
        };
    }
    return { success: false, message: data?.error?.message || 'Connection failed', data };
}

/**
 * Google Gemini API
 * Required keys: apiKey (or api-key, api_key)
 */
async function testGemini(credentials) {
    let key = credentials.apiKey || credentials['api-key'] || credentials.api_key;
    if (!key) return { success: false, message: 'Missing apiKey in credentials' };

    key = key.replace(/['"]/g, '').trim();
    if (key.includes('=')) {
        key = key.split('=').pop().trim();
    }
    
    // Decrypt if it's the legacy iv:hex payload structure
    if (key.includes(':')) {
        try {
            key = symmetricDecrypt(key);
        } catch (e) {
            console.error("[GEMINI_DECRYPT_FAIL]", e);
        }
    }

    try {
        const selectedModel = (credentials.model || 'gemini-2.0-flash').trim();
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: selectedModel });
        await model.generateContent("hi");
        return { 
            success: true, 
            message: `Gemini API key is valid (${selectedModel})`, 
            data: { 
                profileName: "Google Gemini AI",
                message: `Successfully connected to ${selectedModel}` 
            } 
        };
    } catch (err) {
        try {
            const fs = require('fs');
            fs.appendFileSync('gemini_debug.txt', JSON.stringify({ error: err.message, stack: err.stack, keyPreview: key.substring(0, 10), time: new Date().toISOString() }) + '\n');
        } catch(e) {}
        console.error("[TEST_GEMINI_ERROR]", err);
        return { success: false, message: err.message || 'Invalid Gemini API key', data: err };
    }
}

/**
 * Generic / Custom — just verifies credentials are non-empty
 */
async function testGeneric(credentials) {
    const keys = Object.keys(credentials).filter(k => k !== 'profileName' && k !== 'profileImage' && k !== 'userInfo');
    if (keys.length === 0) {
        return { success: false, message: 'No credential fields found' };
    }
    const profileName = credentials.profileName || credentials.name || "Custom Account";
    // Try a basic ping to a URL if one is provided
    const url = credentials.url || credentials.endpoint || credentials.webhookUrl;
    if (url) {
        try {
            const { ok, status } = await fetchWithTimeout(url, { method: 'GET' }, 5000);
            return {
                success: ok || status < 400,
                message: ok ? `Endpoint reachable (${status})` : `Endpoint returned ${status}`,
                data: { profileName }
            };
        } catch {
            return { success: false, message: 'Could not reach the provided endpoint', data: { profileName } };
        }
    }
    return { success: true, message: 'Credentials present', data: { profileName } };
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform Registry — map platform name → tester function
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_TESTERS = {
    FACEBOOK:   testFacebook,
    INSTAGRAM:  testInstagram,
    TWITTER:    testTwitter,
    X:          testTwitter,
    LINKEDIN:   testLinkedIn,
    WHATSAPP:   testWhatsApp,
    YOUTUBE:    testYouTube,
    GOOGLE:     testGoogle,
    GMAIL:      testGoogle,
    GEMINI:     testGemini,
    GOOGLE_PLACES: testGooglePlaces,
    RESEND:     testResend,
};

/**
 * Resend Email API
 * Required keys: apiKey
 */
async function testResend(credentials) {
    const key = (credentials.apiKey || credentials['api-key'] || credentials.api_key || '').trim();
    if (!key) return { success: false, message: 'Missing apiKey' };

    const { ok, status, data } = await fetchWithTimeout(
        'https://api.resend.com/api-keys',
        {
            headers: {
                'Authorization': `Bearer ${key}`,
                'Accept': 'application/json'
            }
        }
    );

    if (ok) {
        return { 
            success: true, 
            message: 'Resend API key is valid', 
            data: { 
                profileName: 'Resend Cloud',
                ...data 
            } 
        };
    }

    if (status === 401) return { success: false, message: 'Invalid or expired Resend API key', data };
    return { success: false, message: data?.message || 'Resend connection failed', data };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * testConnection(platform, credentials)
 * 
 * @param {string} platform - Platform name (e.g. 'FACEBOOK', 'TWITTER')
 * @param {object} credentials - Decrypted credentials object
 * @returns {Promise<{ success: boolean, message: string, data?: any }>}
 */
export async function testConnection(platform, credentials) {
    const key = (platform || '').toUpperCase().trim();
    const tester = PLATFORM_TESTERS[key] || testGeneric;

    try {
        return await tester(credentials);
    } catch (err) {
        // Typically a network error / CORS / timeout
        console.error(`[TEST_CONNECTION_EXCEPTION] ${platform}:`, err);
        const message = err.name === 'AbortError'
            ? 'Connection timed out'
            : `Error: ${err.message}`;
        return { success: false, message, data: { exception: err.name, details: err.message } };
    }
}

/**
 * getSupportedPlatforms()
 * Returns the list of platforms with built-in testers.
 */
export function getSupportedPlatforms() {
    return Object.keys(PLATFORM_TESTERS);
}

/**
 * registerPlatformTester(platformName, testerFn)
 * Extend the registry at runtime with a custom tester.
 * 
 * @param {string} platformName - e.g. 'TIKTOK'
 * @param {Function} testerFn - async (credentials) => { success, message, data? }
 */
export function registerPlatformTester(platformName, testerFn) {
    PLATFORM_TESTERS[platformName.toUpperCase()] = testerFn;
}
