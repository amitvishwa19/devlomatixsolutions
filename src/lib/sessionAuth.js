import { db } from "@/lib/db";
import { Resend } from "resend";
import React from "react";
import LoginAlertNotification from "@/emails/LoginAlertNotification";

/**
 * Parse human-readable device/browser name from User-Agent string
 */
export function parseDeviceFromUserAgent(ua = "", fallback = "Web Browser") {
  if (!ua) return fallback;
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
  
  let os = "Unknown OS";
  if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = "Safari";
  else if (/firefox\//i.test(ua)) browser = "Firefox";

  return `${browser} on ${os}${isMobile ? " (Mobile)" : ""}`;
}

/**
 * Extract client IP address from Next.js request headers
 */
export function getClientIp(req) {
  if (!req) return "127.0.0.1";
  const xForwardedFor = req.headers?.get?.("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    if (ips[0]?.trim()) return ips[0].trim();
  }
  const xRealIp = req.headers?.get?.("x-real-ip");
  if (xRealIp?.trim()) return xRealIp.trim();
  const cfConnectingIp = req.headers?.get?.("cf-connecting-ip");
  if (cfConnectingIp?.trim()) return cfConnectingIp.trim();
  return "127.0.0.1";
}

/**
 * Record a user login session in the User table:
 * 1. Saves device JSON (platform, device, ip, sessionId, loggedAt)
 * 2. Enforces mutual exclusivity (overwrites previous platform session)
 * 3. Sends security alert email from INFO_MAIL via Resend
 *
 * @param {{ userId: string, email: string, userName?: string, platform: 'web'|'mobile', deviceModel?: string, req?: any }} param0
 */
export async function recordUserLoginSession({
  userId,
  email,
  userName = "",
  platform = "web",
  deviceModel = null,
  req = null,
}) {
  try {
    const clientIp = getClientIp(req);
    const userAgent = req?.headers?.get?.("user-agent") || "";
    const sessionId =
      typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const formattedDevice =
      platform === "mobile"
        ? deviceModel || parseDeviceFromUserAgent(userAgent, "Mobile Device")
        : parseDeviceFromUserAgent(userAgent, "Web Browser");

    const activeSession = {
      platform,
      device: formattedDevice,
      ip: clientIp,
      userAgent: userAgent.slice(0, 255),
      sessionId,
      loggedAt: new Date().toISOString(),
    };

    // 1. Update User activeSession in Database
    await db.user.update({
      where: { id: userId },
      data: {
        activeSession,
        lastActive: new Date(),
      },
    });

    console.log(`[AUTH_SESSION] Recorded ${platform} login for ${email} (session: ${sessionId}, IP: ${clientIp})`);

    // 2. Real-Time Single-Device Invalidation Broadcast via Socket Server (Both Directions)
    try {
      const { emitKonnectxEvent } = await import("@/lib/socket-bridge");
      await emitKonnectxEvent("global", "auth:session_superseded", {
        platform, // The new platform logging in ('web' or 'mobile')
        device: formattedDevice,
        ip: clientIp,
        sessionId,
        loggedAt: activeSession.loggedAt,
        message: platform === "web"
          ? `You signed in from Web Browser (${formattedDevice}). Your mobile session has ended.`
          : `You signed in from Mobile App (${formattedDevice}). Your web session has ended.`
      }, { targetUserId: userId });
      console.log(`[AUTH_SESSION] Emitted auth:session_superseded to user ${userId} (new login on ${platform})`);
    } catch (socketErr) {
      console.warn("[AUTH_SESSION_SOCKET_WARN] Could not broadcast session superseded event:", socketErr?.message);
    }

    // 3. Fallback Background FCM Data Push (when user signs in from Web and has registered mobile push token)
    if (platform === "web") {
      try {
        const userWithToken = await db.user.findUnique({
          where: { id: userId },
          select: { deviceToken: true, expoPushToken: true }
        });
        const targetPushToken = userWithToken?.deviceToken || userWithToken?.expoPushToken;
        if (targetPushToken) {
          const { sendAndroidNotification } = await import("@/utils/fcm-notification");
          await sendAndroidNotification({
            token: targetPushToken,
            title: "Devlomatix Security Alert",
            body: `New login detected from Web Browser (${formattedDevice}). Mobile session closed.`,
            data: {
              type: "SESSION_SUPERSEDED",
              platform: "web",
              device: formattedDevice,
              ip: clientIp,
              loggedAt: activeSession.loggedAt
            }
          });
          console.log(`[AUTH_SESSION] Sent FCM session superseded notification to token: ${targetPushToken.substring(0, 15)}...`);
        }
      } catch (fcmErr) {
        console.warn("[AUTH_SESSION_FCM_WARN] Could not send FCM alert:", fcmErr?.message);
      }
    }

    // 4. Dispatch Login Alert Email via Resend in the background
    if (email && process.env.RESEND_API_KEY) {
      const rawInfo = (process.env.INFO_MAIL || process.env.RESEND_FROM_EMAIL || "info@devlomatix.com")
        .replace(/['"]/g, "")
        .trim();

      const fromAddress = rawInfo.includes("<")
        ? rawInfo
        : `Devlomatix Security <${rawInfo}>`;

      const loginTimeFormatted =
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        }) + " IST";

      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailPayload = {
        from: fromAddress,
        to: email,
        subject: `Security Alert: New Login to Devlomatix (${platform === "mobile" ? "Mobile App" : "Web Browser"})`,
        react: React.createElement(LoginAlertNotification, {
          userName: userName || email.split("@")[0],
          userEmail: email,
          platform,
          device: formattedDevice,
          ip: clientIp,
          loginTime: loginTimeFormatted,
          appLogo: process.env.APP_LOGO_URL || undefined,
        }),
        text: `New login detected on your Devlomatix account from ${platform === "mobile" ? "Mobile App" : "Web Browser"} (${formattedDevice}, IP: ${clientIp}). Previous sessions on other devices were signed out.`,
      };

      resend.emails
        .send(emailPayload)
        .then(async (result) => {
          if (result.error) {
            console.warn("[AUTH_MAIL_ERROR] Resend error sending login alert:", result.error);

            // If custom domain is not yet verified in DNS, try sending via sandbox if destination is account owner
            if (result.error.message?.includes("not verified") || result.error.statusCode === 403) {
              console.warn(
                "[AUTH_MAIL_NOTICE] Domain is partially unverified in Resend. Please ensure CNAME records (rsend -> rsend-apne1.forge.rmta.net and send -> send.forge.rmta.net) are added in DNS."
              );

              // Try fallback with onboarding@resend.dev for test addresses
              if (email.includes("devlomatixsolutions@gmail.com")) {
                const fallbackRes = await resend.emails.send({
                  ...emailPayload,
                  from: "Devlomatix Security <onboarding@resend.dev>",
                });
                if (!fallbackRes.error) {
                  console.log(`[AUTH_MAIL_SENT] Login alert sent via sandbox fallback to ${email} (id: ${fallbackRes.data?.id})`);
                }
              }
            }
          } else {
            console.log(`[AUTH_MAIL_SENT] Login alert sent to ${email} (id: ${result.data?.id})`);
          }
        })
        .catch((err) => {
          console.warn("[AUTH_MAIL_WARN] Could not send login email:", err?.message);
        });
    }

    return { success: true, activeSession, sessionId };
  } catch (error) {
    console.error("[AUTH_SESSION_RECORD_ERROR]", error);
    return { success: false, error: error.message };
  }
}
