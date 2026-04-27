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

export const NewJobApplicationNotificationEmail = ({
    name = "Candidate",
    email = "email@example.com",
    phone = "Not provided",
    jobTitle = "Position",
    resumeUrl = "#",
    portfolioUrl = "",
    appliedAt = new Date().toLocaleString(),
}) => (
    <Html>
        <Head />
        <Preview>New Application: {name} for {jobTitle}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={headerText}>NEW JOB APPLICATION</Text>
                </Section>
                
                <Section style={content}>
                    <Text style={greeting}>Hi Hiring Team,</Text>
                    <Text style={paragraph}>
                        A new candidate has applied for the <strong>{jobTitle}</strong> position.
                    </Text>
                    
                    <Section style={infoCard}>
                        <Text style={infoTitle}>CANDIDATE DETAILS</Text>
                        <Hr style={infoHr} />
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Name:</Column>
                            <Column style={infoValue}>{name}</Column>
                        </Row>
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Email:</Column>
                            <Column style={infoValue}>
                                <Link href={`mailto:${email}`} style={link}>{email}</Link>
                            </Column>
                        </Row>
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Phone:</Column>
                            <Column style={infoValue}>{phone}</Column>
                        </Row>
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Applied At:</Column>
                            <Column style={infoValue}>{appliedAt}</Column>
                        </Row>
                    </Section>

                    <Section style={actionSection}>
                        <Text style={infoTitle}>APPLICATION LINKS</Text>
                        <Hr style={infoHr} />
                        <Row style={infoRow}>
                            <Column style={infoLabel}>Resume:</Column>
                            <Column style={infoValue}>
                                <Link href={resumeUrl} style={button}>View Resume</Link>
                            </Column>
                        </Row>
                        {portfolioUrl && (
                            <Row style={infoRow}>
                                <Column style={infoLabel}>Portfolio:</Column>
                                <Column style={infoValue}>
                                    <Link href={portfolioUrl} style={link}>{portfolioUrl}</Link>
                                </Column>
                            </Row>
                        )}
                    </Section>

                    <Text style={paragraph}>
                        Please review the candidate profile in the ATS dashboard to move forward with the next steps.
                    </Text>
                </Section>

                <Hr style={hr} />
                
                <Section style={footerSection}>
                    <Text style={footer}>
                        This is an automated notification from your ATS System.<br />
                        <strong>Devlomatix Hiring Portal</strong>
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default NewJobApplicationNotificationEmail;

const main = {
    backgroundColor: "#f4f4f5",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "40px auto",
    padding: "0",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    maxWidth: "600px",
};

const header = {
    padding: "24px",
    textAlign: "center",
    backgroundColor: "#111827",
};

const headerText = {
    margin: "0",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "0.1em",
};

const content = {
    padding: "40px",
};

const greeting = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "16px",
};

const paragraph = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#374151",
    marginBottom: "24px",
};

const infoCard = {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
};

const actionSection = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
};

const infoTitle = {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.05em",
    color: "#6b7280",
    margin: "0 0 12px 0",
    textTransform: "uppercase",
};

const infoHr = {
    borderColor: "#e5e7eb",
    margin: "0 0 16px 0",
};

const infoRow = {
    marginBottom: "12px",
};

const infoLabel = {
    fontSize: "13px",
    color: "#6b7280",
    width: "100px",
};

const infoValue = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#111827",
};

const link = {
    color: "#2563eb",
    textDecoration: "none",
};

const button = {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
    textDecoration: "none",
    display: "inline-block",
};

const hr = {
    borderColor: "#f3f4f6",
    margin: "0",
};

const footerSection = {
    padding: "24px 40px",
    backgroundColor: "#f9fafb",
};

const footer = {
    fontSize: "12px",
    lineHeight: "20px",
    color: "#9ca3af",
    textAlign: "center",
};
