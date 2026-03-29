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
        `https://graph.facebook.com/me?access_token=${token}&fields=id,name`
    );
    if (ok && data?.id) {
        return { success: true, message: `Connected as ${data.name} (${data.id})`, data };
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
        const testUrlValue = `https://graph.facebook.com/v18.0/${igUserId}?fields=id,username,name&access_token=${encodeURIComponent(token)}`;
        console.log(`[INSTAGRAM_TEST_DEBUG] URL: ${testUrlValue.replace(token, 'REDACTED')}`);
        
        const { ok, status, data } = await fetchWithTimeout(testUrlValue);
        if (ok && data?.id) {
            return { success: true, message: `Connected as ${data.name} (@${data.username})`, data };
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
    const token = credentials.bearerToken || credentials.bearer_token || credentials.token;
    if (!token) return { success: false, message: 'Missing bearerToken in credentials' };

    const { ok, status, data } = await fetchWithTimeout(
        'https://api.twitter.com/2/users/me',
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (ok && data?.data?.id) {
        return { success: true, message: `Connected as @${data.data.username}`, data };
    }
    if (status === 401) return { success: false, message: 'Invalid or expired bearer token', data };
    return { success: false, message: data?.detail || 'Connection failed', data };
}

/**
 * LinkedIn API v2
 * Required keys: accessToken
 */
async function testLinkedIn(credentials) {
    const token = credentials.accessToken || credentials.access_token || credentials.token;
    if (!token) return { success: false, message: 'Missing accessToken in credentials' };

    const { ok, status, data } = await fetchWithTimeout(
        'https://api.linkedin.com/v2/me',
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (ok && data?.id) {
        const name = `${data.localizedFirstName || ''} ${data.localizedLastName || ''}`.trim();
        return { success: true, message: `Connected as ${name}`, data };
    }
    if (status === 401) return { success: false, message: 'Invalid or expired access token', data };
    return { success: false, message: 'Connection failed', data };
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
        return { success: true, message: `Connected: ${data.verified_name} (${data.display_phone_number})`, data };
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
        `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=${key}`
    );
    if (ok) {
        return { success: true, message: 'API key is valid', data };
    }
    return { success: false, message: data?.error?.message || 'Invalid API key', data };
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
        return { success: true, message: `Connected as ${data.email}`, data };
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
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        await model.generateContent("hi");
        return { success: true, message: 'Gemini API key is valid', data: { message: "Successfully connected to Gemini 2.5 Flash" } };
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
    const keys = Object.keys(credentials).filter(k => k !== 'profileName');
    if (keys.length === 0) {
        return { success: false, message: 'No credential fields found' };
    }
    // Try a basic ping to a URL if one is provided
    const url = credentials.url || credentials.endpoint || credentials.webhookUrl;
    if (url) {
        try {
            const { ok, status } = await fetchWithTimeout(url, { method: 'GET' }, 5000);
            return {
                success: ok || status < 400,
                message: ok ? `Endpoint reachable (${status})` : `Endpoint returned ${status}`
            };
        } catch {
            return { success: false, message: 'Could not reach the provided endpoint' };
        }
    }
    return { success: true, message: 'Credentials present but no connectivity test available for this platform' };
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
};

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
