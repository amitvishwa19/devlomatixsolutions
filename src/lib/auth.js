'use server'
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";



const secretKey = process.env.APP_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("12h")
        .sign(key);
}

export async function decrypt(input) {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null
    }
}


export async function setSession(data) {
    const expires = new Date(Date.now() + 1000 * 43200);
    const session = await encrypt({ data, expires });
    const cookieStore = await cookies()
    cookieStore.set("session", session, { expires, httpOnly: true });
}

export async function setUrlSession(data) {
    console.log(data)
    //cookies().set("lastUrl", data);
}



export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value;

    //console.log(session)
    if (!session) return null;
    return await decrypt(session);
}

export async function getEncryptedSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value;
    if (!session) return null;
    return session;
}

export async function decryptSession(session) {
    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request) {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 1000 * 43200);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}

export async function userLogout() {
    await cookies().delete('session')
}