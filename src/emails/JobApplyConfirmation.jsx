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
    Link,
    Row,
    Column
} from "@react-email/components";
import * as React from "react";

const defaultLogo = "https://2ysdv7kqqjhyq5jp.public.blob.vercel-storage.com/devlomatix_dark-OtVEiM5UjPmliioK6BVcksn6h8CM9O.png";
const baseUrl = process.env.NEXT_PUBLIC_URL || "https://devlomatix.com";

export const JobApplyConfirmationEmail = ({
    name = "Candidate",
    jobTitle = "Software Engineer",
    department = "Engineering",
    location = "Remote",
    type = "Full-time",
    applicationId = "",
    appliedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    companyName = "Devlomatix",
    logoUrl = ""
}) => (
    <Html>
        <Head />
        <Preview>Application Received: {jobTitle} at {companyName}</Preview>
        <Body style={main}>
            <Container style={container}>
                {/* Brand Header */}
                <Section style={headerSection}>
                    {logoUrl ? (
                        <Img
                            src={logoUrl}
                            width="180"
                            height="auto"
                            alt={companyName}
                            style={logo}
                        />
                    ) : (
                        <Text style={brandTitleText}>{companyName}</Text>
                    )}
                </Section>

                {/* Main Content */}
                <Section style={contentWrapper}>
                    <Heading style={heading}>Application Received! 🎉</Heading>
                    <Text style={greeting}>Hello {name},</Text>
                    <Text style={paragraph}>
                        Thank you for taking the time to apply for the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong>. We are thrilled to learn more about your skills and background.
                    </Text>

                    {/* Application Details Card */}
                    <Section style={infoCard}>
                        <Text style={infoTitle}>APPLICATION SUMMARY</Text>
                        <Hr style={infoHr} />
                        
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Position:</Column>
                            <Column style={infoValue}>{jobTitle}</Column>
                        </Row>

                        {department && (
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Department:</Column>
                                <Column style={infoValue}>{department}</Column>
                            </Row>
                        )}

                        <Row style={infoRow}>
                            <Column style={infoLabel}>Location:</Column>
                            <Column style={infoValue}>{location} ({type})</Column>
                        </Row>

                        <Row style={infoRow}>
                            <Column style={infoLabel}>Date Applied:</Column>
                            <Column style={infoValue}>{appliedDate}</Column>
                        </Row>

                        {applicationId && (
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Ref ID:</Column>
                                <Column style={infoValueMuted}>{applicationId}</Column>
                            </Row>
                        )}

                        <Row style={infoRow}>
                            <Column style={infoLabel}>Current Status:</Column>
                            <Column style={infoValue}>
                                <span style={statusBadge}>Under Review</span>
                            </Column>
                        </Row>
                    </Section>

                    {/* What Happens Next Roadmap */}
                    <Section style={roadmapSection}>
                        <Heading style={subHeading}>What to Expect Next</Heading>
                        <div style={stepContainer}>
                            <Row style={stepRow}>
                                <Column style={stepNumberCol}>
                                    <div style={stepCircle}>1</div>
                                </Column>
                                <Column style={stepContentCol}>
                                    <Text style={stepHeading}>Profile & Experience Review</Text>
                                    <Text style={stepText}>Our talent acquisition team will review your resume and portfolio against the role requirements.</Text>
                                </Column>
                            </Row>
                            <Row style={stepRow}>
                                <Column style={stepNumberCol}>
                                    <div style={stepCircle}>2</div>
                                </Column>
                                <Column style={stepContentCol}>
                                    <Text style={stepHeading}>Initial Conversation</Text>
                                    <Text style={stepText}>If there is a strong match, we will invite you to a 30-minute introductory video call.</Text>
                                </Column>
                            </Row>
                            <Row style={stepRow}>
                                <Column style={stepNumberCol}>
                                    <div style={stepCircle}>3</div>
                                </Column>
                                <Column style={stepContentCol}>
                                    <Text style={stepHeading}>Technical / Team Rounds & Offer</Text>
                                    <Text style={stepText}>In-depth evaluation with key team leaders followed by final onboarding discussions.</Text>
                                </Column>
                            </Row>
                        </div>
                    </Section>

                    {/* CTA Button */}
                    <Section style={buttonSection}>
                        <Link href={`${baseUrl}/career`} style={button}>
                            Explore Other Openings
                        </Link>
                    </Section>

                    <Text style={paragraphMuted}>
                        Have questions about your application? You can simply reply to this email or reach out to us at <Link href="mailto:careers@devlomatix.com" style={link}>careers@devlomatix.com</Link>.
                    </Text>
                </Section>

                <Hr style={hr} />

                {/* Footer Section */}
                <Section style={footerSection}>
                    <Text style={footer}>
                        Best regards,<br />
                        <strong>The Talent Acquisition Team</strong><br />
                        {companyName} Solutions
                    </Text>
                    <Text style={subFooter}>
                        © {new Date().getFullYear()} {companyName} Solutions. All rights reserved.<br />
                        Growth Driven Technology & Automation
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default JobApplyConfirmationEmail;

const main = {
    backgroundColor: "#f4f7fa",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "32px auto",
    maxWidth: "600px",
    width: "100%",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
};

const headerSection = {
    padding: "36px 20px",
    textAlign: "center",
    backgroundColor: "#0f172a",
};

const logo = {
    margin: "0 auto",
};

const brandTitleText = {
    fontSize: "22px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 auto",
    letterSpacing: "-0.02em",
    textAlign: "center",
};

const contentWrapper = {
    padding: "36px 40px",
};

const heading = {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 16px 0",
    letterSpacing: "-0.02em",
};

const greeting = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px",
};

const paragraph = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#475569",
    marginBottom: "24px",
};

const paragraphMuted = {
    fontSize: "13px",
    lineHeight: "20px",
    color: "#64748b",
    marginBottom: "16px",
};

const infoCard = {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "28px",
    border: "1px solid #e2e8f0",
};

const infoTitle = {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    color: "#64748b",
    margin: "0 0 10px 0",
};

const infoHr = {
    borderColor: "#e2e8f0",
    margin: "0 0 14px 0",
};

const infoRow = {
    marginBottom: "10px",
};

const infoLabel = {
    fontSize: "13px",
    color: "#64748b",
    width: "110px",
    fontWeight: "500",
};

const infoValue = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
};

const infoValueMuted = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    fontFamily: "monospace",
};

const statusBadge = {
    display: "inline-block",
    padding: "4px 10px",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
};

const roadmapSection = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "4px 0 20px",
    marginBottom: "20px",
};

const subHeading = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 16px 0",
};

const stepContainer = {
    paddingLeft: "4px",
};

const stepRow = {
    marginBottom: "14px",
};

const stepNumberCol = {
    width: "36px",
    verticalAlign: "top",
};

const stepCircle = {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: "26px",
};

const stepContentCol = {
    verticalAlign: "top",
    paddingLeft: "8px",
};

const stepHeading = {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
};

const stepText = {
    fontSize: "12px",
    lineHeight: "18px",
    color: "#64748b",
    margin: 0,
};

const buttonSection = {
    textAlign: "center",
    margin: "28px 0",
};

const button = {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: "700",
    textDecoration: "none",
    display: "inline-block",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
};

const link = {
    color: "#0284c7",
    textDecoration: "underline",
};

const hr = {
    borderColor: "#f1f5f9",
    margin: "0 40px",
};

const footerSection = {
    padding: "24px 40px 32px",
    backgroundColor: "#fafafa",
};

const footer = {
    fontSize: "13px",
    lineHeight: "20px",
    color: "#475569",
    margin: "0 0 12px 0",
};

const subFooter = {
    fontSize: "11px",
    lineHeight: "18px",
    color: "#94a3b8",
    margin: 0,
};
