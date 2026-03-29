import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Helper: decrypt credentials from DB
function decryptCredentials(storedCredentials) {
    if (!storedCredentials) return {};

    // New format: { enc: "iv:hexciphertext" }
    if (storedCredentials?.enc && typeof storedCredentials.enc === 'string') {
        const key = process.env.ENCRYPTION_KEY;
        if (!key) return storedCredentials; // no key, return as-is
        try {
            const crypto = require('crypto');
            const parts = storedCredentials.enc.split(':');
            const ivBuffer = Buffer.from(parts[0], 'hex');
            const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), ivBuffer);
            let decrypted = decipher.update(encText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
        } catch (e) {
            console.error("[PUBLISH_DECRYPT_ERROR]", e.message);
            return storedCredentials;
        }
    }

    // Plain JSON object (no encryption)
    if (typeof storedCredentials === 'object') return storedCredentials;

    return {};
}

// POST /api/workspace/[workspaceId]/social/posts/[postId]/publish
export async function POST(req, { params }) {
    try {
        const { workspaceId, postId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { accountId } = await req.json();
        if (!accountId) {
            return NextResponse.json({ message: "accountId is required" }, { status: 400 });
        }

        const userId = session.user.userId;

        // Get the post
        const post = await db.post.findUnique({
            where: { id: postId, workspaceId, userId }
        });
        if (!post) return NextResponse.json({ message: "Post not found" }, { status: 404 });

        // Get the credential
        const credential = await db.credentials.findUnique({
            where: { id: accountId }
        });
        if (!credential) return NextResponse.json({ message: "Credential not found" }, { status: 404 });
        if (credential.status !== 'connected') {
            return NextResponse.json({ message: `Account is not connected (status: ${credential.status})` }, { status: 400 });
        }

        // Decrypt credentials
        const creds = decryptCredentials(credential.credentials);

        // Build publish payload per platform
        const platform = credential.platform?.toUpperCase();
        const content = post.content?.replace(/<[^>]*>/g, '').trim(); // strip HTML
        const result = await publishToPlatform(platform, creds, { content, mediaUrls: post.mediaUrls, post });

        if (!result.success) {
            return NextResponse.json({ message: result.message }, { status: 400 });
        }

        // Store external IDs for analytics
        const existingIds = (post.externalIds && typeof post.externalIds === 'object') ? post.externalIds : {};
        const updatedIds = { ...existingIds, [platform]: result.platformPostId };

        // Update post status and IDs
        await db.post.update({
            where: { id: postId },
            data: { 
                status: 'PUBLISHED',
                publishedAt: new Date(),
                externalIds: updatedIds
            }
        });

        return NextResponse.json({ success: true, message: result.message, platformPostId: result.platformPostId });
    } catch (error) {
        console.error("[POST_PUBLISH_ERROR]", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// ─── Platform Publishers ─────────────────────────────────────────────────────

async function publishToPlatform(platform, creds, { content, mediaUrls, post }) {
    switch (platform) {
        case 'FACEBOOK': return publishFacebook(creds, content, mediaUrls);
        case 'INSTAGRAM': return publishInstagram(creds, content, mediaUrls);
        case 'TWITTER':
        case 'X':        return publishTwitter(creds, content, mediaUrls);
        case 'LINKEDIN': return publishLinkedIn(creds, content, mediaUrls);
        default:
            return { success: false, message: `Publishing to ${platform} is not yet supported` };
    }
}

async function fetchJSON(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
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

async function publishFacebook(creds, content, mediaUrls) {
    const token = creds.accessToken || creds.access_token;
    const pageId = creds.pageId || creds.page_id;

    if (!token) return { success: false, message: 'Missing accessToken in Facebook credentials' };

    // If no pageId, try posting to the user's feed
    const endpoint = pageId
        ? `https://graph.facebook.com/${pageId}/feed`
        : `https://graph.facebook.com/me/feed`;

    const body = { message: content, access_token: token };
    if (mediaUrls?.[0]) body.link = mediaUrls[0];

    const { ok, data } = await fetchJSON(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (ok && data?.id) return { success: true, message: `Posted to Facebook (ID: ${data.id})`, platformPostId: data.id };
    return { success: false, message: data?.error?.message || 'Facebook publish failed' };
}

async function publishInstagram(creds, content, mediaUrls) {
    // Be flexible with key names (matching cred-manager.js)
    const token = creds.accessToken || creds.access_token || creds.token || 
                  creds['access-token'] || creds.AccessToken;
    const igUserId = creds.igUserId || creds.ig_user_id || creds.IGUserId ||
                     creds['ig-user-id'] || creds.userId;

    if (!token) return { success: false, message: 'Instagram Access Token missing. Please add "accessToken".' };
    if (!igUserId) return { success: false, message: 'Instagram Business ID missing. Please add "igUserId" to your credentials.' };

    const imageUrl = mediaUrls?.[0];
    if (!imageUrl) return { success: false, message: 'Instagram requires at least one image' };

    // Step 1: Create media container
    console.log(`[INSTAGRAM_DEBUG] Creating media container for User ID: ${igUserId}`);
    if (imageUrl?.includes('localhost')) {
        console.warn("[INSTAGRAM_WARN] Image URL appears to be localhost. Instagram's servers cannot access local files.");
        return { success: false, message: "Instagram requires a PUBLICLY accessible image URL (localhost will not work)." };
    }

    const { ok: ok1, status: s1, data: d1 } = await fetchJSON(
        `https://graph.facebook.com/v18.0/${igUserId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(content)}&access_token=${encodeURIComponent(token)}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }
    );

    if (!ok1 || !d1?.id) {
        console.error("[INSTAGRAM_API_ERROR_STEP1]", s1, JSON.stringify(d1));
        return { success: false, message: d1?.error?.message || 'Instagram media creation failed' };
    }

    // Step 2: Publish
    console.log(`[INSTAGRAM_DEBUG] Publishing media container: ${d1.id}`);
    const { ok: ok2, status: s2, data: d2 } = await fetchJSON(
        `https://graph.facebook.com/v18.0/${igUserId}/media_publish?creation_id=${d1.id}&access_token=${encodeURIComponent(token)}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }
    );

    if (ok2 && d2?.id) {
        console.log("[INSTAGRAM_SUCCESS] Post ID:", d2.id);
        return { success: true, message: `Posted to Instagram (ID: ${d2.id})`, platformPostId: d2.id };
    }
    console.error("[INSTAGRAM_API_ERROR_STEP2]", s2, JSON.stringify(d2));
    return { success: false, message: d2?.error?.message || 'Instagram publish failed' };
}

async function publishTwitter(creds, content) {
    const bearerToken = creds.bearerToken || creds.bearer_token;
    const apiKey = creds.apiKey || creds['api-key'];
    const apiSecret = creds.apiSecret || creds['api-secret'];
    const accessToken = creds.accessToken || creds.access_token;
    const accessSecret = creds.accessSecret || creds['access-secret'];

    // Twitter v2 requires OAuth 1.0a for posting — Bearer token alone is read-only
    if (!accessToken || !accessSecret || !apiKey || !apiSecret) {
        return { success: false, message: 'Twitter requires apiKey, apiSecret, accessToken, and accessSecret for posting' };
    }

    // Minimal OAuth 1.0a signing (for basic tweet post)
    const crypto = require('crypto');
    const url = 'https://api.twitter.com/2/tweets';
    const method = 'POST';

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

    const { ok, data } = await fetchJSON(url, {
        method,
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content.slice(0, 280) }),
    });

    if (ok && data?.data?.id) return { success: true, message: `Tweeted (ID: ${data.data.id})`, platformPostId: data.data.id };
    return { success: false, message: data?.detail || data?.title || 'Twitter publish failed' };
}

async function publishLinkedIn(creds, content, mediaUrls) {
    const token = creds.accessToken || creds.access_token;
    const orgUrnOrId = creds.organizationUrn || creds.organization_urn;
    const personUrn = creds.personUrn || creds.person_urn || creds.authorUrn;

    if (!token) return { success: false, message: 'Missing accessToken in LinkedIn credentials' };

    // Determine the author URN (Page or Person)
    let author = personUrn;
    if (orgUrnOrId) {
        author = String(orgUrnOrId).startsWith('urn:li:') 
            ? orgUrnOrId 
            : `urn:li:organization:${orgUrnOrId}`;
    }

    if (!author) {
        const { ok, data } = await fetchJSON('https://api.linkedin.com/v2/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!ok) return { success: false, message: 'Failed to get LinkedIn profile' };
        author = `urn:li:person:${data.id}`;
    }

    const body = {
        author: author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: content },
                shareMediaCategory: 'NONE',
            }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    };

    const { ok, data } = await fetchJSON('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (ok && data?.id) return { success: true, message: `Posted to LinkedIn (ID: ${data.id})`, platformPostId: data.id };
    return { success: false, message: data?.message || 'LinkedIn publish failed' };
}
