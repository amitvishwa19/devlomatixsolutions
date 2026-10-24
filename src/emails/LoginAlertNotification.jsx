import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const defaultLogo = "https://2ysdv7kqqjhyq5jp.public.blob.vercel-storage.com/devlomatix_dark-OtVEiM5UjPmliioK6BVcksn6h8CM9O.png";

export default function LoginAlertNotification({
  userName = "Devlomatix User",
  userEmail = "",
  platform = "mobile", // "mobile" | "web"
  device = "Mobile App",
  ip = "Unknown IP",
  loginTime = new Date().toUTCString(),
  appLogo = defaultLogo,
}) {
  const isMobile = platform?.toLowerCase() === "mobile";
  const platformLabel = isMobile ? "Mobile Device (Expo App)" : "Web Browser";
  const platformEmoji = isMobile ? "📱" : "💻";
  const finalLogo = appLogo || defaultLogo;

  return (
    <Html>
      <Head />
      <Preview>Security Alert: New login to your Devlomatix account ({platformLabel})</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Banner */}
          <Section style={headerBanner}>
            <Img
              src={finalLogo}
              width="160"
              height="auto"
              alt="Devlomatix"
              style={logo}
            />
            <Text style={bannerSubtext}>Official Security Notification</Text>
          </Section>

          {/* Main Body */}
          <Section style={contentSection}>
            <Heading style={h1}>Security Alert: New Login Detected</Heading>
            <Text style={greetingText}>Hello {userName},</Text>
            <Text style={mainText}>
              Your Devlomatix account (<strong>{userEmail}</strong>) was just signed in on a new device.
            </Text>

            {/* Info Card */}
            <Section style={cardSection}>
              <div style={infoRow}>
                <span style={labelStyle}>Platform:</span>
                <span style={valueStyle}>
                  {platformEmoji} {platformLabel}
                </span>
              </div>
              <div style={infoRow}>
                <span style={labelStyle}>Device / OS:</span>
                <span style={valueStyle}>{device}</span>
              </div>
              <div style={infoRow}>
                <span style={labelStyle}>IP Address:</span>
                <span style={valueStyle}>{ip}</span>
              </div>
              <div style={infoRow}>
                <span style={labelStyle}>Timestamp:</span>
                <span style={valueStyle}>{loginTime}</span>
              </div>
            </Section>

            {/* Single Device Policy Notice */}
            <Section style={noticeSection}>
              <Text style={noticeText}>
                <strong>Security Notice:</strong> Devlomatix enforces single-device session protection. Any previous active session on another device (such as {isMobile ? "Web" : "Mobile"}) has been automatically signed out.
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={cautionText}>
              If this was you, you can safely ignore this email. If you did not authorize this login, please change your password immediately or contact your administrator.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              This is an automated security notification sent to {userEmail}.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Devlomatix Solutions. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const main = {
  backgroundColor: "#090d16",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#0f172a",
  margin: "0 auto",
  maxWidth: "560px",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  overflow: "hidden",
};

const headerBanner = {
  backgroundColor: "#0f172a",
  padding: "36px 30px 24px",
  textAlign: "center",
  borderBottom: "1px solid #1e293b",
};

const logo = {
  margin: "0 auto 12px",
  display: "block",
};

const bannerSubtext = {
  color: "#94a3b8",
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontWeight: "600",
  margin: "0",
};

const h1 = {
  color: "#f8fafc",
  fontSize: "20px",
  fontWeight: "800",
  margin: "0 0 16px",
  letterSpacing: "-0.02em",
};

const contentSection = {
  padding: "28px 30px",
};

const greetingText = {
  color: "#f8fafc",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 10px",
};

const mainText = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
};

const cardSection = {
  backgroundColor: "#1e293b",
  borderRadius: "12px",
  border: "1px solid #334155",
  padding: "16px 20px",
  margin: "0 0 20px",
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "6px 0",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
};

const labelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "600",
};

const valueStyle = {
  color: "#f8fafc",
  fontSize: "13px",
  fontWeight: "700",
};

const noticeSection = {
  backgroundColor: "rgba(2, 132, 199, 0.1)",
  borderRadius: "10px",
  border: "1px solid rgba(56, 189, 248, 0.3)",
  padding: "12px 16px",
  margin: "0 0 20px",
};

const noticeText = {
  color: "#38bdf8",
  fontSize: "12.5px",
  lineHeight: "19px",
  margin: "0",
};

const hr = {
  borderColor: "#1e293b",
  margin: "20px 0",
};

const cautionText = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};

const footerSection = {
  backgroundColor: "#090d16",
  padding: "18px 30px",
  textAlign: "center",
  borderTop: "1px solid #1e293b",
};

const footerText = {
  color: "#475569",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "2px 0",
};
