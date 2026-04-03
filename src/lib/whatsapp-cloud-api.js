/**
 * src/lib/whatsapp-cloud-api.js
 * 
 * Core Library for Meta WhatsApp Cloud API
 * 
 * This module provides a clean wrapper around the Meta Graph API.
 * All functions return a standardized { success, data, error } object.
 */

import axios from 'axios';

const DEFAULT_VERSION = 'v18.0';
const BASE_URL = 'https://graph.facebook.com';

/**
 * Standardizes API responses
 */
const response = (success, data = null, error = null) => ({ success, data, error });

/**
 * 1. Connection & Identity
 * Verifies if the token and Phone ID are valid.
 */
export async function testCloudConnection(credentials) {
    const { accessToken, phoneNumberId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;

    try {
        const url = `${BASE_URL}/${version}/${phoneNumberId}?fields=display_phone_number,verified_name`;
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (res.data?.id) {
            return response(true, {
                id: res.data.id,
                profileName: res.data.verified_name,
                displayNumber: res.data.display_phone_number
            });
        }
        return response(false, null, 'Invalid response from Meta');
    } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        return response(false, null, msg);
    }
}

/**
 * 2. Message Dispatch (Text)
 */
export async function sendTextMessage(credentials, to, body) {
    const { accessToken, phoneNumberId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;

    try {
        const url = `${BASE_URL}/${version}/${phoneNumberId}/messages`;
        const res = await axios.post(url, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "text",
            text: { body: body }
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return response(true, res.data);
    } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        return response(false, null, msg);
    }
}

/**
 * 3. Message Dispatch (Template)
 */
export async function sendTemplateMessage(credentials, to, templateName, languageCode = 'en_US', components = []) {
    const { accessToken, phoneNumberId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;

    try {
        const url = `${BASE_URL}/${version}/${phoneNumberId}/messages`;
        const res = await axios.post(url, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
                components: components
            }
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return response(true, res.data);
    } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        return response(false, null, msg);
    }
}

/**
 * 4. Template Management
 * Fetches the list of message templates from the Business Account (WABA).
 */
export async function fetchTemplates(credentials) {
    const { accessToken, wabaId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;

    if (!wabaId) return response(false, null, 'Missing wabaId (WhatsApp Business Account ID)');

    try {
        const url = `${BASE_URL}/${version}/${wabaId}/message_templates`;
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return response(true, res.data.data); // Meta returns { data: [...] }
    } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        return response(false, null, msg);
    }
}

/**
 * 5. Webhook Validation (Handshake)
 */
export function verifyWebhook(query, hubVerifyToken) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === hubVerifyToken) {
        return { success: true, challenge };
    }
    return { success: false, error: 'Verification failed: Token mismatch' };
}

/**
 * 6. Webhook Parsing (Normalization)
 * Converts Meta's complex nested payload into a clean flat object.
 */
export function parseIncomingMessage(body) {
    try {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const metadata = value?.metadata;
        const contact = value?.contacts?.[0];
        const message = value?.messages?.[0];

        if (!message) return null;

        return {
            platform: 'WHATSAPP_CLOUD',
            businessId: entry.id,
            displayPhone: metadata.display_phone_number,
            phoneNumberId: metadata.phone_number_id,
            sender: {
                name: contact?.profile?.name || 'Unknown',
                phone: message.from
            },
            message: {
                id: message.id,
                type: message.type,
                timestamp: message.timestamp,
                text: message.text?.body,
                // Handle other types as needed (image, button, etc)
                raw: message
            }
        };
    } catch (err) {
        console.error('[WA_CLOUD_PARSE_ERROR]', err);
        return null;
    }
}
