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
    Row,
    Column
} from '@react-email/components';
import * as React from 'react';

const defaultLogo = "https://2ysdv7kqqjhyq5jp.public.blob.vercel-storage.com/devlomatix_dark-OtVEiM5UjPmliioK6BVcksn6h8CM9O.png";

export const QuotationEmailTemplate = ({
    quotationNumber = "QT-2026-0001",
    quotationTitle = "Commercial Proposal",
    clientName = "Valued Client",
    clientCompany = "",
    companyName = "Devlomatix Solutions",
    companyLogo = "",
    companyEmail = "sales@devlomatix.com",
    companyPhone = "+91 98765 43210",
    companyWebsite = "https://devlomatix.com",
    currencySymbol = "₹",
    totalAmount = 0,
    items = [],
    issueDate = "",
    validUntil = "",
    customMessage = "",
    publicUrl = "",
    hasAttachment = true,
    attachmentName = ""
}) => {
    const formattedTotal = Number(totalAmount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const displayItems = Array.isArray(items) ? items.slice(0, 5) : [];
    const remainingCount = Array.isArray(items) && items.length > 5 ? items.length - 5 : 0;
    const finalLogo = companyLogo || defaultLogo;

    return (
        <Html>
            <Head />
            <Preview>{`Commercial Proposal: ${quotationTitle} (${quotationNumber}) - ${companyName}`}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header Banner */}
                    <Section style={headerBanner}>
                        <Img
                            src={finalLogo}
                            width="160"
                            height="auto"
                            alt={companyName}
                            style={logo}
                        />
                        <Text style={bannerSubtext}>Official Commercial Proposal</Text>
                    </Section>

                    {/* Content Wrapper */}
                    <Section style={contentWrapper}>
                        {/* Proposal Title & Number */}
                        <Section style={titleBadgeContainer}>
                            <Text style={quotationBadge}>{quotationNumber}</Text>
                        </Section>
                        <Heading style={heading}>{quotationTitle}</Heading>

                        {/* Greeting */}
                        <Text style={greeting}>
                            Dear {clientName}{clientCompany ? `, ${clientCompany}` : ''},
                        </Text>

                        {/* Custom / Default Message */}
                        <Text style={paragraph}>
                            {customMessage || `Thank you for your business. We are pleased to present our official quotation for your review. Below is an executive summary of the proposed deliverables and commercial terms.`}
                        </Text>

                        {/* Total Highlight Card */}
                        <Section style={totalCard}>
                            <Text style={totalLabel}>TOTAL PROPOSAL VALUE</Text>
                            <Heading style={totalValue}>
                                {currencySymbol} {formattedTotal}
                            </Heading>
                            <Text style={validityNotice}>
                                Valid until: <strong>{validUntil || '30 days from issue'}</strong>
                            </Text>
                        </Section>

                        {/* Key Proposal Details Grid */}
                        <Section style={infoCard}>
                            <Row style={infoRow}>
                                <Column style={infoCol}>
                                    <Text style={colLabel}>PREPARED FOR</Text>
                                    <Text style={colValue}>
                                        <strong>{clientName}</strong>
                                        {clientCompany && <><br />{clientCompany}</>}
                                    </Text>
                                </Column>
                                <Column style={infoCol}>
                                    <Text style={colLabel}>PREPARED BY</Text>
                                    <Text style={colValue}>
                                        <strong>{companyName}</strong>
                                        <br />{companyEmail}
                                    </Text>
                                </Column>
                            </Row>
                            <Hr style={innerDivider} />
                            <Row style={infoRow}>
                                <Column style={infoCol}>
                                    <Text style={colLabel}>ISSUE DATE</Text>
                                    <Text style={colValue}>{issueDate || 'Today'}</Text>
                                </Column>
                                <Column style={infoCol}>
                                    <Text style={colLabel}>STATUS</Text>
                                    <Text style={colValue}>
                                        <span style={statusBadge}>Active Quotation</span>
                                    </Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Scope Summary Line Items */}
                        {displayItems.length > 0 && (
                            <Section style={itemsSection}>
                                <Heading style={sectionTitle}>Scope of Deliverables</Heading>
                                <div style={itemsTable}>
                                    {displayItems.map((item, idx) => (
                                        <Row key={idx} style={idx % 2 === 0 ? itemRowEven : itemRowOdd}>
                                            <Column style={itemNameCol}>
                                                <Text style={itemName}>{item.name || `Item ${idx + 1}`}</Text>
                                                {item.description && (
                                                    <Text style={itemDesc}>{item.description}</Text>
                                                )}
                                            </Column>
                                            <Column style={itemQtyCol}>
                                                <Text style={itemQty}>Qty: {item.quantity || 1}</Text>
                                            </Column>
                                            <Column style={itemPriceCol}>
                                                <Text style={itemPrice}>
                                                    {currencySymbol} {Number(item.total || (Number(item.quantity || 1) * Number(item.unitPrice || 0))).toLocaleString('en-IN')}
                                                </Text>
                                            </Column>
                                        </Row>
                                    ))}
                                    {remainingCount > 0 && (
                                        <Text style={moreItemsText}>
                                            + {remainingCount} additional deliverable item(s) detailed in attached PDF
                                        </Text>
                                    )}
                                </div>
                            </Section>
                        )}

                        {/* Attached PDF Notice */}
                        {hasAttachment && (
                            <Section style={attachmentCard}>
                                <Row>
                                    <Column style={attachmentIconCol}>
                                        <div style={attachmentIconBox}>📎</div>
                                    </Column>
                                    <Column style={attachmentTextCol}>
                                        <Text style={attachmentTitle}>Official PDF Document Attached</Text>
                                        <Text style={attachmentSub}>
                                            The signed commercial quotation <strong>{attachmentName || `${quotationNumber}.pdf`}</strong> is attached to this email for your records and accounting.
                                        </Text>
                                    </Column>
                                </Row>
                            </Section>
                        )}

                        {/* Online E-Sign / Review CTA */}
                        {publicUrl && (
                            <Section style={ctaSection}>
                                <Text style={ctaHelpText}>
                                    You can also review the complete interactive document, line-by-line itemization, and approve with a digital e-signature online:
                                </Text>
                                <Section style={buttonContainer}>
                                    <Link href={publicUrl} style={primaryButton}>
                                        Review & E-Sign Online →
                                    </Link>
                                </Section>
                            </Section>
                        )}

                        <Hr style={divider} />

                        {/* Next Steps Guide */}
                        <Section style={nextStepsSection}>
                            <Text style={nextStepsTitle}>Next Steps</Text>
                            <Text style={stepItem}>
                                <strong>1. Review Terms:</strong> Check line items, project deliverables, and payment schedule in the attached PDF.
                            </Text>
                            <Text style={stepItem}>
                                <strong>2. Sign or Confirm:</strong> Click the link above to sign online or reply directly to this email with your PO / approval.
                            </Text>
                            <Text style={stepItem}>
                                <strong>3. Onboarding:</strong> Upon confirmation, our project manager will schedule your kickoff session.
                            </Text>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerCompany}>
                            <strong>{companyName}</strong>
                            <br />
                            Email: <Link href={`mailto:${companyEmail}`} style={footerLink}>{companyEmail}</Link> | Phone: {companyPhone}
                            <br />
                            Web: <Link href={companyWebsite} style={footerLink}>{companyWebsite}</Link>
                        </Text>
                        <Text style={footerCopyright}>
                            © {new Date().getFullYear()} {companyName}. All rights reserved.
                            <br />
                            Confidential commercial document intended exclusively for the named recipient.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default QuotationEmailTemplate;

// Styling tokens consistent with Devlomatix design system
const main = {
    backgroundColor: '#f1f5f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '24px 0',
};

const container = {
    margin: '0 auto',
    width: '600px',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
};

const headerBanner = {
    backgroundColor: '#0f172a',
    padding: '36px 30px 28px',
    textAlign: 'center',
};

const logo = {
    margin: '0 auto 12px',
    display: 'block',
};

const bannerSubtext = {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    margin: '0',
};

const contentWrapper = {
    padding: '36px 36px 24px',
};

const titleBadgeContainer = {
    textAlign: 'center',
    marginBottom: '10px',
};

const quotationBadge = {
    display: 'inline-block',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'monospace',
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1px solid #bfdbfe',
    margin: '0',
};

const heading = {
    color: '#0f172a',
    fontSize: '22px',
    fontWeight: '800',
    textAlign: 'center',
    margin: '0 0 24px',
    lineHeight: '1.3',
};

const greeting = {
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 12px',
};

const paragraph = {
    color: '#475569',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 24px',
};

const totalCard = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '24px',
};

const totalLabel = {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    margin: '0 0 6px',
};

const totalValue = {
    color: '#0f172a',
    fontSize: '28px',
    fontWeight: '800',
    fontFamily: 'monospace',
    margin: '0 0 4px',
};

const validityNotice = {
    color: '#64748b',
    fontSize: '12px',
    margin: '0',
};

const infoCard = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '24px',
};

const infoRow = {
    width: '100%',
};

const infoCol = {
    width: '50%',
    verticalAlign: 'top',
};

const colLabel = {
    color: '#94a3b8',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.8px',
    margin: '0 0 4px',
};

const colValue = {
    color: '#1e293b',
    fontSize: '13px',
    lineHeight: '18px',
    margin: '0',
};

const innerDivider = {
    borderColor: '#f1f5f9',
    margin: '12px 0',
};

const statusBadge = {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
};

const itemsSection = {
    marginBottom: '24px',
};

const sectionTitle = {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const itemsTable = {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
};

const itemRowEven = {
    backgroundColor: '#ffffff',
    padding: '10px 14px',
    borderBottom: '1px solid #f1f5f9',
};

const itemRowOdd = {
    backgroundColor: '#f8fafc',
    padding: '10px 14px',
    borderBottom: '1px solid #f1f5f9',
};

const itemNameCol = {
    width: '60%',
    padding: '8px 12px',
};

const itemQtyCol = {
    width: '18%',
    padding: '8px 4px',
    textAlign: 'center',
};

const itemPriceCol = {
    width: '22%',
    padding: '8px 12px',
    textAlign: 'right',
};

const itemName = {
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: '600',
    margin: '0',
};

const itemDesc = {
    color: '#64748b',
    fontSize: '11px',
    lineHeight: '15px',
    margin: '2px 0 0',
};

const itemQty = {
    color: '#64748b',
    fontSize: '12px',
    margin: '0',
};

const itemPrice = {
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'monospace',
    margin: '0',
};

const moreItemsText = {
    color: '#64748b',
    fontSize: '11px',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '8px',
    margin: '0',
    backgroundColor: '#f8fafc',
};

const attachmentCard = {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '24px',
};

const attachmentIconCol = {
    width: '36px',
    verticalAlign: 'middle',
};

const attachmentIconBox = {
    fontSize: '22px',
    textAlign: 'center',
};

const attachmentTextCol = {
    verticalAlign: 'middle',
    paddingLeft: '8px',
};

const attachmentTitle = {
    color: '#166534',
    fontSize: '13px',
    fontWeight: '700',
    margin: '0 0 2px',
};

const attachmentSub = {
    color: '#15803d',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '0',
};

const ctaSection = {
    textAlign: 'center',
    marginBottom: '24px',
};

const ctaHelpText = {
    color: '#64748b',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 16px',
};

const buttonContainer = {
    textAlign: 'center',
};

const primaryButton = {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    padding: '12px 28px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
};

const divider = {
    borderColor: '#e2e8f0',
    margin: '28px 0',
};

const nextStepsSection = {
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '16px 20px',
};

const nextStepsTitle = {
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: '700',
    margin: '0 0 8px',
};

const stepItem = {
    color: '#475569',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0 0 6px',
};

const footer = {
    padding: '24px 36px 36px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
};

const footerCompany = {
    color: '#64748b',
    fontSize: '12px',
    lineHeight: '20px',
    margin: '0 0 12px',
};

const footerLink = {
    color: '#2563eb',
    textDecoration: 'none',
};

const footerCopyright = {
    color: '#94a3b8',
    fontSize: '11px',
    lineHeight: '16px',
    margin: '0',
};
