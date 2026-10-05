import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/auth";
import { safelyDecryptCredentials } from "@/lib/whatsapp-credentials";
import { symmetricEncrypt, symmetricDecrypt } from "@/lib/encryption";

/** Store columns that must never be persisted or returned in plaintext. */
export const SECRET_FIELDS = ["accessToken", "apiKey", "apiSecret", "webhookSecret"];

/**
 * Shape produced by `symmetricEncrypt`: a 16-byte IV and the cipher payload,
 * both hex, separated by a colon.
 *
 * Matching the exact format matters — a plain `includes(":")` test misreads
 * legitimate secrets such as `https://…` or `key:secret` as already
 * encrypted and would persist them in plaintext.
 */
const ENCRYPTED_PATTERN = /^[0-9a-f]{32}:[0-9a-f]+$/i;

export function isEncrypted(value) {
    return typeof value === "string" && ENCRYPTED_PATTERN.test(value);
}

/** Encrypts a secret on write; idempotent for values already encrypted. */
export function encryptSecret(value) {
    if (!value) return value;
    if (isEncrypted(value)) return value;
    return symmetricEncrypt(value);
}

/** Decrypts a secret, tolerating legacy plaintext rows. */
export function decryptSecret(value) {
    if (!value || typeof value !== "string") return value;
    if (!isEncrypted(value)) return value;
    try {
        return symmetricDecrypt(value);
    } catch {
        return null;
    }
}

/** Strips secrets from a store row and exposes presence as booleans. */
export function toPublicStore(store) {
    if (!store) return store;

    const out = { ...store };
    for (const field of SECRET_FIELDS) {
        out[`has${field[0].toUpperCase()}${field.slice(1)}`] = !!store[field];
        delete out[field];
    }
    return out;
}

/**
 * Resolves the acting user id.
 *
 * Prefers the Bearer token (the Expo client always attaches one) and falls
 * back to the `userId` query parameter so the older web/mobile callers keep
 * working. A missing value is an authentication failure, never an implicit
 * "act as everybody".
 */
export async function requireUserId(request) {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
        throw new NextResponse(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401 }
        );
    }
    return userId;
}

/** Same resolution as `requireUserId`, but returns null instead of throwing. */
export async function getUserIdFromRequest(request) {
    const authHeader = request.headers.get("authorization");

    if (authHeader) {
        // A token was presented, so it decides the identity. An expired or
        // tampered token must fail closed — falling back to `?userId=` here
        // would let any caller act as an arbitrary tenant.
        const payload = await decrypt(authHeader).catch(() => null);
        return payload?.userId || payload?.id || null;
    }

    return new URL(request.url).searchParams.get("userId");
}

/** Credential hints the client may send to pick a non-default account. */
function readCredentialHint(request) {
    const { searchParams } = new URL(request.url);
    const fromQuery =
        searchParams.get("credentialId") ||
        searchParams.get("credential_id") ||
        null;
    const fromHeader =
        request.headers.get("x-credential-id") ||
        request.headers.get("credentialid") ||
        null;
    return fromQuery || fromHeader || null;
}

/** Everything about the caller's WhatsApp Cloud account, resolved to nulls. */
function emptyAccount() {
    return {
        credential: null,
        credentialId: null,
        profile: null,
        accessToken: null,
        phoneNumberId: null,
        wabaId: null,
        businessId: null,
        version: process.env.FACEBOOK_API_VERSION || "v25.0"
    };
}

/**
 * Resolves the caller's WhatsApp Cloud account with decrypted secrets.
 *
 * Scoped by the *verified* `userId`, never by a client-supplied identifier.
 * This matters because `requireUserId` trusts the Bearer token while other
 * konnectx routes key off the `userId` query param — reusing
 * `resolveActiveCredential` here would let a token-authenticated caller with
 * no `userId` param fall through to another tenant's default account.
 *
 * An explicit credentialId that belongs to somebody else resolves to null
 * (fail-closed) rather than silently using the caller's default.
 *
 * It is deliberately not `resolveWhatsAppCredentials`, whose final fallbacks
 * can return any tenant's credential in the database.
 */
export async function getWhatsAppAccount(request, userId) {
    if (!userId) return emptyAccount();

    const credentialId = readCredentialHint(request);

    const credential = await db.credentials.findFirst({
        where: {
            userId,
            platform: "WHATSAPP_CLOUD",
            ...(credentialId ? { id: credentialId } : {})
        },
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
    });

    if (!credential) return emptyAccount();

    const secrets = safelyDecryptCredentials(credential.credentials) || {};
    const wabaId = secrets.wabaId || secrets.waba_id || null;

    return {
        credential,
        credentialId: credential.id,
        profile: credential.profile || null,
        accessToken: secrets.accessToken || null,
        phoneNumberId: secrets.phoneNumberId || secrets.phone_number_id || null,
        wabaId,
        businessId: secrets.businessId || secrets.business_id || wabaId,
        version: secrets.version || process.env.FACEBOOK_API_VERSION || "v25.0"
    };
}

/** True when the account has everything the Meta Graph calls require. */
export function canSend(account) {
    return !!(account?.accessToken && account?.phoneNumberId);
}

/** Envelope for read endpoints — matches the existing konnectx API shape. */
export function ok(data) {
    return NextResponse.json({ data });
}

/** Envelope for mutations. */
export function created(data, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

/** Envelope for paginated reads. */
export function paged(data, { page, limit, total }) {
    return NextResponse.json({
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
}

/** Error envelope. */
export function fail(message, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

/** Strips formatting from a phone number without guessing a country code. */
export function digitsOnly(phone) {
    return String(phone || "").replace(/\D/g, "");
}

/** BigInt is not JSON-serialisable; Prisma `count` can return it. */
export function serializeBigInts(value) {
    if (typeof value === "bigint") return value.toString();
    if (Array.isArray(value)) return value.map(serializeBigInts);
    if (value && typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) out[k] = serializeBigInts(v);
        return out;
    }
    return value;
}

/**
 * Confirms a record belongs to the caller before mutating it.
 * Guards against the bare-`id` update pattern used elsewhere in this repo.
 */
export async function assertOwned(model, id, userId, label = "record") {
    const row = await db[model].findFirst({ where: { id }, select: { id: true, userId: true } });
    if (!row) {
        throw new NextResponse(JSON.stringify({ error: `${label} not found` }), { status: 404 });
    }
    if (row.userId && userId && row.userId !== userId) {
        throw new NextResponse(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }
    return row;
}