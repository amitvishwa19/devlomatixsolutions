import {
    Body,
    Container,
    Head,
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

const baseUrl = process.env.NEXT_PUBLIC_URL || "";

export const JobApplyConfirmationEmail = ({
    name = "Candidate",
    jobTitle = "Position",
    location = "Remote",
    companyName = "Devlomatix",
}) => (
    <Html>
        <Head />
        <Preview>Application Received: {jobTitle} at {companyName}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Img
                        src="{{appLogo}}"
                        width="170"
                        height="40"
                        alt="{{appName}}"
                        style={logo}
                    />
                </Section>
                
                <Section style={content}>
                    <Text style={greeting}>Hello {name},</Text>
                    <Text style={paragraph}>
                        Thank you for your interest in joining <strong>{companyName}</strong>! We've successfully received your application for the <strong>{jobTitle}</strong> position.
                    </Text>
                    
                    <Section style={infoCard}>
                        <Text style={infoTitle}>APPLICATION DETAILS</Text>
                        <Hr style={infoHr} />
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Role:</Column>
                            <Column style={infoValue}>{jobTitle}</Column>
                        </Row>
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Location:</Column>
                            <Column style={infoValue}>{location}</Column>
                        </Row>
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Status:</Column>
                            <Column style={infoValueSpace}>
                                <span style={statusBadge}>Applied</span>
                            </Column>
                        </Row>
                    </Section>

                    <Text style={paragraph}>
                        Our hiring team is currently reviewing applications. If your profile aligns with our requirements, we'll reach out to schedule an interview.
                    </Text>
                    
                    <Text style={paragraph}>
                        In the meantime, feel free to explore more about our culture and open roles on our <Link href={`${baseUrl}/career`} style={link}>Careers Page</Link>.
                    </Text>
                </Section>

                <Hr style={hr} />
                
                <Section style={footerSection}>
                    <Text style={footer}>
                        Best regards,<br />
                        <strong>The Hiring Team</strong><br />
                        {companyName}
                    </Text>
                    <Text style={subFooter}>
                        © {new Date().getFullYear()} {companyName}. All rights reserved.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default JobApplyConfirmationEmail;

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "40px auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
};

const header = {
    padding: "32px",
    textAlign: "center",
    backgroundColor: "#000000",
};

const logo = {
    margin: "0 auto",
};

const content = {
    padding: "40px 48px",
};

const greeting = {
    fontSize: "20px",
    fontWeight: "700",
    lineHeight: "28px",
    color: "#1a1a1a",
    marginBottom: "16px",
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#4a4a4a",
    marginBottom: "24px",
};

const infoCard = {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
};

const infoTitle = {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.05em",
    color: "#6b7280",
    margin: "0 0 12px 0",
};

const infoHr = {
    borderColor: "#e5e7eb",
    margin: "0 0 16px 0",
};

const infoRow = {
    marginBottom: "8px",
};

const infoLabel = {
    fontSize: "14px",
    color: "#6b7280",
    width: "80px",
};

const infoValue = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
};

const infoValueSpace = {
    paddingTop: "4px",
};

const statusBadge = {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#ecfdf5",
    color: "#059669",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
};

const link = {
    color: "#2563eb",
    textDecoration: "underline",
};

const hr = {
    borderColor: "#e5e7eb",
    margin: "0 48px",
};

const footerSection = {
    padding: "32px 48px",
};

const footer = {
    fontSize: "14px",
    lineHeight: "24px",
    color: "#6b7280",
};

const subFooter = {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "16px",
};
