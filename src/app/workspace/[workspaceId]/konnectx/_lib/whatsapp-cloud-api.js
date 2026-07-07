/**
 * src/lib/whatsapp-cloud-api.js
 * 
 * Core Library for Meta WhatsApp Cloud API
 * 
 * This module provides a clean wrapper around the Meta Graph API.
 * All functions return a standardized { success, data, error } object.
 */

const DEFAULT_VERSION = process.env.FACEBOOK_API_VERSION || process.env.NEXT_PUBLIC_META_API_VERSION || 'v25.0';
const BASE_URL = 'https://graph.facebook.com';

/**
 * Standardizes API responses
 */
const response = (success, data = null, error = null) => ({ success, data, error });

/**
 * Common fetch handler for Meta Graph API
 */
async function metaPost(credentials, endpoint, payload) {
    const { accessToken, phoneNumberId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${phoneNumberId}/${endpoint}`;

    try {
        const payloadWithCleanTo = { ...payload };
        if (payloadWithCleanTo.to && typeof payloadWithCleanTo.to === 'string') {
            payloadWithCleanTo.to = payloadWithCleanTo.to.replace(/\+/g, '');
        }

        const fullPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            ...payloadWithCleanTo
        };

        console.log("[WA_CLOUD_API_REQUEST]", {
            url,
            payload: JSON.stringify(fullPayload, null, 2)
        });

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fullPayload)
        });

        const data = await res.json();
        if (!res.ok) {
            const errorMsg = data.error?.message || data.error?.error_user_msg || 'Meta API Error';
            console.error('[WA_CLOUD_API_ERROR]', data.error);
            return response(false, null, errorMsg);
        }

        return response(true, data);
    } catch (err) {
        console.error('[WA_CLOUD_FETCH_ERROR]', err);
        return response(false, null, err.message);
    }
}

/**
 * 1. Connection & Identity
 * Verifies if the token and Phone ID are valid.
 */
async function testCloudConnection(credentials) {
    const { accessToken, phoneNumberId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${phoneNumberId}?fields=display_phone_number,verified_name`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();

        if (data?.id) {
            return response(true, {
                id: data.id,
                profileName: data.verified_name,
                displayNumber: data.display_phone_number
            });
        }
        return response(false, null, data.error?.message || 'Invalid response from Meta');
    } catch (err) {
        return response(false, null, err.message);
    }
}

/**
 * 2. Message Dispatch (Text)
 */
async function sendTextMessage(credentials, to, body) {
    return metaPost(credentials, 'messages', {
        to: to,
        type: "text",
        text: { body: body }
    });
}

/**
 * 3. Message Dispatch (Template)
 */
async function sendTemplateMessage(credentials, to, templateName, languageCode = 'en_US', components = []) {
    return metaPost(credentials, 'messages', {
        to: to,
        type: "template",
        template: {
            name: templateName,
            language: { code: languageCode },
            components: components
        }
    });
}

/**
 * 4. Template Management
 * Fetches the list of message templates from the Business Account (WABA).
 */
async function fetchTemplates(credentials) {
    const { accessToken, wabaId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;

    if (!wabaId) return response(false, null, 'Missing wabaId (WhatsApp Business Account ID)');

    const url = `${BASE_URL}/${version}/${wabaId}/message_templates`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();

        if (!res.ok) return response(false, null, data.error?.message || 'Failed to fetch templates');

        return response(true, data.data); // Meta returns { data: [...] }
    } catch (err) {
        return response(false, null, err.message);
    }
}

/**
 * 5. Webhook Validation (Handshake)
 */
function verifyWebhook(query, hubVerifyToken) {
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
function parseIncomingMessage(body) {
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

/**
 * uploadMetaMedia
 * Uploads a public media asset to Meta and returns a media_id
 */
async function uploadMetaMedia(credentials, mediaUrl) {
    const { accessToken, phoneNumberId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${phoneNumberId}/media`;

    try {
        console.log("[uploadMetaMedia] Fetching media file from URL:", mediaUrl);
        const res = await fetch(mediaUrl);
        if (!res.ok) throw new Error(`Failed to fetch media file: ${res.statusText}`);
        
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const blob = new Blob([buffer], { type: contentType });
        const fileName = mediaUrl.split('/').pop()?.split('?')[0] || 'media_file';

        const formData = new FormData();
        formData.append('messaging_product', 'whatsapp');
        formData.append('file', blob, fileName);

        console.log("[uploadMetaMedia] Uploading media to Meta...");
        const uploadRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
            throw new Error(uploadData.error?.message || "Failed to upload media to Meta");
        }

        console.log("[uploadMetaMedia] Successfully uploaded. ID:", uploadData.id);
        return uploadData.id;
    } catch (error) {
        console.error("[uploadMetaMedia] Failed to upload media on-the-fly:", error.message || error);
        return null;
    }
}

/**
 * 7. Message Dispatch (Media)
 * Supports image, video, audio, document
 */
async function sendMediaMessage(credentials, to, type, mediaUrl, caption = "") {
    let mediaPayload = null;

    // Check if mediaUrl is a remote URL
    const isUrl = /^https?:\/\//i.test(String(mediaUrl));
    if (isUrl) {
        // Attempt to upload to Meta on-the-fly for guaranteed delivery
        const mediaId = await uploadMetaMedia(credentials, mediaUrl);
        if (mediaId) {
            mediaPayload = { id: mediaId };
        }
    }

    // Fallback: If not a URL, or upload failed, determine if it's a numeric ID or a link
    if (!mediaPayload) {
        const isId = /^\d+$/.test(String(mediaUrl)) || String(mediaUrl).startsWith('4:');
        mediaPayload = isId ? { id: String(mediaUrl) } : { link: String(mediaUrl) };
    }

    if (caption && (type === 'image' || type === 'video' || type === 'document')) {
        mediaPayload.caption = caption;
    }

    return metaPost(credentials, 'messages', {
        to: to,
        type: type,
        [type]: mediaPayload
    });
}

/**
 * 8. Message Dispatch (Location)
 */
async function sendLocationMessage(credentials, to, latitude, longitude, name, address) {
    return metaPost(credentials, 'messages', {
        to: to,
        type: "location",
        location: {
            latitude,
            longitude,
            name,
            address
        }
    });
}

/**
 * 9. Message Dispatch (Interactive)
 * Supports buttons, lists
 */
async function sendInteractiveMessage(credentials, to, interactive) {
    return metaPost(credentials, 'messages', {
        to: to,
        type: "interactive",
        interactive: interactive
    });
}

/**
 * 10. Fetch Media URL
 * Converts a Meta media_id into a downloadable URL.
 */
const getMediaUrl = async (credentials, mediaId) => {
    const { accessToken } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${mediaId}`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();

        if (data?.url) {
            return { success: true, data: data.url };
        }
        return { success: false, error: data.error?.message || 'Failed to fetch media URL' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * 11. WhatsApp Flows Management
 */

async function fetchFlowsMeta(credentials) {
    const { accessToken, wabaId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    if (!wabaId) return response(false, null, 'Missing wabaId');

    const url = `${BASE_URL}/${version}/${wabaId}/flows?fields=id,name,status,categories,validation_errors,last_updated`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (!res.ok) return response(false, null, data.error?.message || 'Failed to fetch flows');
        return response(true, data.data);
    } catch (err) {
        return response(false, null, err.message);
    }
}

async function createFlowMeta(credentials, name, categories = ["OTHER"]) {
    const { accessToken, wabaId } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    if (!wabaId) return response(false, null, 'Missing wabaId');

    const url = `${BASE_URL}/${version}/${wabaId}/flows`;
    const payload = { name, categories };

    console.log("[WA_FLOW_CREATE_REQUEST]", { url, payload });

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            console.error('[WA_FLOW_CREATE_ERROR]', data.error);
            return response(false, null, data.error?.message || 'Failed to create flow');
        }
        return response(true, data);
    } catch (err) {
        console.error('[WA_FLOW_CREATE_FETCH_ERROR]', err);
        return response(false, null, err.message);
    }
}

async function updateFlowAssetMeta(credentials, flowId, flowJson) {
    const { accessToken } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${flowId}/assets`;

    try {
        const formData = new FormData();
        const blob = new Blob([JSON.stringify(flowJson)], { type: 'application/json' });
        formData.append('name', 'flow.json');
        formData.append('asset_type', 'FLOW_JSON');
        formData.append('file', blob, 'flow.json');

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        const data = await res.json();
        if (!res.ok) return response(false, null, data.error?.message || 'Failed to upload flow asset');
        return response(true, data);
    } catch (err) {
        return response(false, null, err.message);
    }
}

async function publishFlowMeta(credentials, flowId) {
    const { accessToken } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${flowId}/publish`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (!res.ok) return response(false, null, data.error?.message || 'Failed to publish flow');
        return response(true, data);
    } catch (err) {
        return response(false, null, err.message);
    }
}

async function updateFlowMeta(credentials, flowId, updates) {
    const { accessToken } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${flowId}`;

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        const data = await res.json();
        if (!res.ok) return response(false, null, data.error?.message || 'Failed to update flow');
        return response(true, data);
    } catch (err) {
        return response(false, null, err.message);
    }
}

async function getFlowAssetMeta(credentials, flowId) {
    const { accessToken } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${flowId}/assets?asset_type=FLOW_JSON`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (!res.ok) return response(false, null, data.error?.message || 'Failed to fetch flow asset');
        return response(true, data);
    } catch (err) {
        return response(false, null, err.message);
    }
}

async function deleteFlowMeta(credentials, flowId) {
    const { accessToken } = credentials;
    const version = credentials.version || DEFAULT_VERSION;
    const url = `${BASE_URL}/${version}/${flowId}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (!res.ok) return response(false, null, data.error?.message || 'Failed to delete flow');
        return response(true, data);
    } catch (err) {
        return response(false, null, err.message);
    }
}

export {
    testCloudConnection,
    sendTextMessage,
    sendTemplateMessage,
    fetchTemplates,
    verifyWebhook,
    parseIncomingMessage,
    sendMediaMessage,
    sendLocationMessage,
    sendInteractiveMessage,
    getMediaUrl,
    fetchFlowsMeta,
    createFlowMeta,
    updateFlowMeta,
    updateFlowAssetMeta,
    publishFlowMeta,
    deleteFlowMeta,
    getFlowAssetMeta,
    uploadMetaMedia
};
