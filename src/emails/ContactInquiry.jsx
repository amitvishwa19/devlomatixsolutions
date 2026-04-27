import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

const logoUrl = "https://2ysdv7kqqjhyq5jp.public.blob.vercel-storage.com/devlomatix_dark-OtVEiM5UjPmliioK6BVcksn6h8CM9O.png";

export const ContactInquiryTemplate = ({
    name,
    email,
    company,
    mobile,
    message,
}) => (
    <Html>
        <Head />
        <Preview>New Inquiry: {name} is interested in a project</Preview>
        <Body style={main}>
            <Container style={container}>
                {/* Brand Header */}
                <Section style={logoSection}>
                    <Img
                        src={logoUrl}
                        width="180"
                        height="auto"
                        alt="Devlomatix Logo"
                        style={logo}
                    />
                </Section>

                {/* Content Body */}
                <Section style={contentWrapper}>
                    <Heading style={h1}>New Project Inquiry</Heading>
                    <Text style={introText}>
                        Hello Team, you have received a high-priority inquiry from the website. 
                        Here are the details provided by the prospect:
                    </Text>

                    {/* Prospect Info Grid */}
                    <Section style={infoCard}>
                        <Section style={infoRow}>
                            <Section style={infoColumn}>
                                <Text style={label}>FULL NAME</Text>
                                <Text style={value}>{name}</Text>
                            </Section>
                            <Section style={infoColumn}>
                                <Text style={label}>COMPANY</Text>
                                <Text style={value}>{company || "Not specified"}</Text>
                            </Section>
                        </Section>

                        <Hr style={divider} />

                        <Section style={infoRow}>
                            <Section style={infoColumn}>
                                <Text style={label}>EMAIL ADDRESS</Text>
                                <Link href={`mailto:${email}`} style={link}>{email}</Link>
                            </Section>
                            <Section style={infoColumn}>
                                <Text style={label}>MOBILE NUMBER</Text>
                                <Link href={`tel:${mobile}`} style={link}>{mobile}</Link>
                            </Section>
                        </Section>
                    </Section>

                    {/* Message Section */}
                    <Section style={messageSection}>
                        <Text style={label}>PROJECT DETAILS & MESSAGE</Text>
                        <Section style={messageBox}>
                            <Text style={messageText}>{message}</Text>
                        </Section>
                    </Section>

                    {/* Action Footer */}
                    <Section style={actionSection}>
                        <Text style={footerText}>
                            To respond to this inquiry, you can simply reply to this email or 
                            contact them directly via phone.
                        </Text>
                    </Section>
                </Section>

                <Section style={footer}>
                    <Text style={copyright}>
                        © {new Date().getFullYear()} Devlomatix Solutions. All rights reserved.<br />
                        Cyber Hub, DLF Phase 2, Gurugram, Haryana 122002
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

const main = {
    backgroundColor: '#f4f7f9',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    margin: '40px auto',
    width: '600px',
    maxWidth: '100%',
};

const logoSection = {
    padding: '30px 0',
    textAlign: 'center',
    backgroundColor: '#0f172a',
    borderRadius: '12px 12px 0 0',
};

const logo = {
    margin: '0 auto',
};

const contentWrapper = {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '0 0 12px 12px',
    border: '1px solid #e2e8f0',
    borderTop: 'none',
};

const h1 = {
    color: '#0f172a',
    fontSize: '28px',
    fontWeight: '800',
    lineHeight: '1.2',
    margin: '0 0 16px',
    textAlign: 'center',
    letterSpacing: '-0.02em',
};

const introText = {
    color: '#64748b',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'center',
    margin: '0 0 32px',
};

const infoCard = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #f1f5f9',
    marginBottom: '32px',
};

const infoRow = {
    display: 'flex',
    marginBottom: '0',
};

const infoColumn = {
    width: '50%',
};

const label = {
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    margin: '0 0 4px',
};

const value = {
    color: '#0f172a',
    fontSize: '15px',
    fontWeight: '600',
    margin: '0',
};

const link = {
    color: '#6366f1',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
};

const divider = {
    margin: '20px 0',
    borderColor: '#e2e8f0',
};

const messageSection = {
    marginBottom: '32px',
};

const messageBox = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
};

const messageText = {
    color: '#334155',
    fontSize: '15px',
    lineHeight: '26px',
    margin: '0',
    whiteSpace: 'pre-wrap',
};

const actionSection = {
    textAlign: 'center',
};

const footerText = {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
};

const footer = {
    padding: '30px 0',
    textAlign: 'center',
};

const copyright = {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '20px',
    margin: '0',
};

export default ContactInquiryTemplate;
