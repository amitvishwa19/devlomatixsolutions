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

export const ContactAcknowledgementTemplate = ({ name }) => (
    <Html>
        <Head />
        <Preview>We've received your inquiry - Devlomatix Solutions</Preview>
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
                    <Heading style={h1}>Thank You for Reaching Out!</Heading>
                    <Text style={introText}>
                        Hi {name},<br /><br />
                        We've successfully received your project inquiry. Our team is currently
                        reviewing your details and we'll get back to you within the next 24 hours.
                    </Text>

                    <Section style={nextSteps}>
                        <Heading style={h2}>What Happens Next?</Heading>
                        <Section style={stepRow}>
                            <Text style={stepNumber}>1</Text>
                            <Text style={stepText}>Our experts review your requirements.</Text>
                        </Section>
                        <Section style={stepRow}>
                            <Text style={stepNumber}>2</Text>
                            <Text style={stepText}>We prepare a customized response or proposal.</Text>
                        </Section>
                        <Section style={stepRow}>
                            <Text style={stepNumber}>3</Text>
                            <Text style={stepText}>We'll schedule a brief call to discuss the way forward.</Text>
                        </Section>
                    </Section>

                    <Hr style={divider} />

                    <Section style={actionSection}>
                        <Text style={footerText}>
                            In the meantime, feel free to check out our latest work or learn more about our services.
                        </Text>
                        <Section style={buttonContainer}>
                            <Link href="https://devlomatix.com" style={button}>View Our Portfolio</Link>
                        </Section>
                    </Section>
                </Section>

                <Section style={footer}>
                    <Text style={copyright}>
                        Devlomatix Solutions<br />
                        Growth Driven Technology & Automation<br />
                        © {new Date().getFullYear()} All rights reserved.
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
    fontSize: '26px',
    fontWeight: '800',
    lineHeight: '1.2',
    margin: '0 0 20px',
    textAlign: 'center',
};

const h2 = {
    color: '#0f172a',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 16px',
};

const introText = {
    color: '#475569',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '0 0 32px',
};

const nextSteps = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
};

const stepRow = {
    display: 'flex',
    marginBottom: '12px',
};

const stepNumber = {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '24px',
    margin: '0 12px 0 0',
    display: 'inline-block',
};

const stepText = {
    color: '#475569',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0',
    display: 'inline-block',
};

const divider = {
    margin: '32px 0',
    borderColor: '#e2e8f0',
};

const actionSection = {
    textAlign: 'center',
};

const footerText = {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 24px',
};

const buttonContainer = {
    textAlign: 'center',
};

const button = {
    backgroundColor: '#6366f1',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'inline-block',
    padding: '12px 32px',
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

export default ContactAcknowledgementTemplate;
