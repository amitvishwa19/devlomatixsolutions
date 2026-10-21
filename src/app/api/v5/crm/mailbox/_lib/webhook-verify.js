import crypto from 'crypto';

/**
 * Verify Resend / Svix Webhook Signature
 * 
 * Resend uses Svix for webhook delivery.
 * Headers:
 * - svix-id: unique message identifier
 * - svix-timestamp: unix timestamp (seconds)
 * - svix-signature: comma-separated list of signatures (e.g., "v1,g0hM9NnvMmScqaTxDzyEc6hxsmZWDmDaDtYPP3Mr83Q=")
 *
 * The signature is an HMAC-SHA256 of `${id}.${timestamp}.${rawBody}` using the base64-decoded secret.
 */
export function verifyResendWebhookSignature({
    rawBody,
    headers,
    secret = process.env.RESEND_WEBHOOK_SECRET || process.env.RESENT_SIGNIN_SECRET
}) {
    // If no secret configured in development, allow bypass with warning
    if (!secret) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[RESEND_WEBHOOK] Warning: RESEND_WEBHOOK_SECRET is not set. Bypassing signature verification in development.');
            return { isValid: true, reason: 'DEV_BYPASS' };
        }
        return { isValid: false, reason: 'MISSING_SECRET' };
    }

    const svixId = headers.get('svix-id');
    const svixTimestamp = headers.get('svix-timestamp');
    const svixSignature = headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
        return { isValid: false, reason: 'MISSING_HEADERS' };
    }

    // Verify timestamp freshness (prevent replay attacks, allow 5 min tolerance)
    const now = Math.floor(Date.now() / 1000);
    const timestampSec = parseInt(svixTimestamp, 10);
    if (isNaN(timestampSec) || Math.abs(now - timestampSec) > 300) {
        return { isValid: false, reason: 'EXPIRED_OR_FUTURE_TIMESTAMP' };
    }

    try {
        // Strip prefix "whsec_" if present
        const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
        const secretKeyBytes = Buffer.from(cleanSecret, 'base64');

        const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
        const computedHmac = crypto
            .createHmac('sha256', secretKeyBytes)
            .update(toSign)
            .digest('base64');

        // svix-signature can contain multiple signatures separated by space: "v1,sig1 v1,sig2"
        const passedSignatures = svixSignature.split(' ');
        for (const item of passedSignatures) {
            const [version, signature] = item.split(',');
            if (version === 'v1' && signature) {
                // Timing safe compare
                const bufA = Buffer.from(computedHmac);
                const bufB = Buffer.from(signature);
                if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
                    return { isValid: true, reason: 'VERIFIED' };
                }
            }
        }

        return { isValid: false, reason: 'SIGNATURE_MISMATCH' };
    } catch (err) {
        console.error('[RESEND_WEBHOOK_VERIFY_ERROR]', err);
        return { isValid: false, reason: err.message };
    }
}
