import { db } from '@/lib/db';

const PARAM_ALIASES = {
    credentialId: ['credentialId', 'credential_id'],
    wabaId: ['wabaId', 'waba_id'],
    phoneNumberId: ['phoneNumberId', 'phone_number_id'],
};

const HEADER_ALIASES = {
    credentialId: ['x-credential-id', 'credentialid'],
    wabaId: ['x-waba-id', 'wabaid'],
    phoneNumberId: ['x-phone-number-id', 'phonenumberid'],
};

function readParam(searchParams, names) {
    for (const name of names) {
        const value = searchParams.get(name);
        if (value) return value;
    }
    return null;
}

function readHeader(request, names) {
    const headers = request?.headers;
    if (!headers) return null;
    for (const name of names) {
        const value = typeof headers.get === 'function' ? headers.get(name) : headers[name];
        if (value) return value;
    }
    return null;
}

export function readCredentialRequest(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const requested = {};
    for (const [key, paramNames] of Object.entries(PARAM_ALIASES)) {
        requested[key] = readParam(searchParams, paramNames) || readHeader(request, HEADER_ALIASES[key]);
    }

    return { userId, requested };
}

export async function decryptCredentialPayload(stored) {
    let payload = stored;

    if (typeof payload === 'string' && payload.includes(':')) {
        try {
            const { symmetricDecrypt } = await import('@/lib/encryption');
            payload = JSON.parse(symmetricDecrypt(payload));
        } catch (e) {}
    } else if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload);
        } catch (e) {}
    }

    if (payload?.enc) {
        try {
            const { symmetricDecrypt } = await import('@/lib/encryption');
            payload = JSON.parse(symmetricDecrypt(payload.enc));
        } catch (e) {}
    }

    return payload || null;
}

/**
 * Resolves the WhatsApp Cloud account a request should be scoped to.
 * Explicit credentialId wins (so account switching does not depend on the
 * isDefault flag having been committed yet); falls back to the default account.
 */
export async function resolveActiveCredential(request) {
    const { userId, requested } = readCredentialRequest(request);

    const ownership = { ...(userId && { userId }), platform: 'WHATSAPP_CLOUD' };

    let credential = null;
    if (requested.credentialId) {
        credential = await db.credentials.findFirst({
            where: { id: requested.credentialId, ...ownership },
        });
    }

    if (!credential && requested.wabaId) {
        const candidates = await db.credentials.findMany({
            where: ownership,
            select: { id: true, credentials: true },
        });
        const match = candidates.find((c) => {
            const payload = c.credentials;
            if (!payload || typeof payload !== 'object') return false;
            return String(payload.wabaId || payload.waba_id || '') === String(requested.wabaId);
        });
        if (match) {
            credential = await db.credentials.findFirst({ where: { id: match.id, ...ownership } });
        }
    }

    if (!credential) {
        credential = await db.credentials.findFirst({
            where: { ...ownership, isDefault: true },
        });
    }

    if (!credential) {
        return { credential: null, credentialId: null, phoneNumberId: null, wabaId: requested.wabaId || null };
    }

    const payload = await decryptCredentialPayload(credential.credentials);

    return {
        credential,
        credentialId: credential.id,
        phoneNumberId: String(
            requested.phoneNumberId || payload?.phoneNumberId || payload?.phone_number_id || ''
        ),
        wabaId: requested.wabaId || payload?.wabaId || payload?.waba_id || null,
    };
}
