import { motion } from "framer-motion";
import Navbar from "@/carewell/components/landing/Navbar";
import Footer from "@/carewell/components/landing/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: January 23, 2026
            </p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  At CareWell by Devlomatix ("we", "our", or "us"), we are committed to protecting your privacy and ensuring the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Hospital Management System.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  2. Information We Collect
                </h2>
                <h3 className="text-xl font-semibold text-foreground mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Name, email address, phone number, and contact details</li>
                  <li>Organization and job title information</li>
                  <li>Billing and payment information</li>
                  <li>Account credentials and authentication data</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-2">Health Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Patient medical records and health history</li>
                  <li>Diagnostic and treatment information</li>
                  <li>Laboratory and imaging results</li>
                  <li>Prescription and medication data</li>
                </ul>
                <h3 className="text-xl font-semibold text-foreground mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Usage logs and access patterns</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  3. How We Use Your Information
                </h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>To provide and maintain our Hospital Management System services</li>
                  <li>To process transactions and manage billing</li>
                  <li>To communicate with you about service updates and support</li>
                  <li>To improve our services and develop new features</li>
                  <li>To ensure security and prevent fraud</li>
                  <li>To comply with legal and regulatory requirements</li>
                  <li>To provide customer support and respond to inquiries</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  4. Data Security
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement comprehensive security measures to protect your data:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li><strong>Access Controls:</strong> Role-based access control with multi-factor authentication</li>
                  <li><strong>Audit Logging:</strong> Complete audit trails of all data access and modifications</li>
                  <li><strong>Regular Backups:</strong> Automated daily backups with secure offsite storage</li>
                  <li><strong>Security Monitoring:</strong> 24/7 monitoring for security threats and anomalies</li>
                  <li><strong>Compliance:</strong> Regular security audits and compliance assessments</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  5. Data Sharing and Disclosure
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                  <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our service</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Safety:</strong> To protect the rights, safety, and security of our users and the public</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  6. Data Retention
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Health records are retained in accordance with applicable healthcare regulations and legal requirements. Upon termination of service, you may request export of your data, and we will securely delete your information within 90 days unless legally required to retain it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  7. Your Rights
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request export of your data in a machine-readable format</li>
                  <li><strong>Objection:</strong> Object to certain processing of your personal data</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  8. Cookies and Tracking
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Maintain your session and authentication status</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You can control cookies through your browser settings, but disabling certain cookies may affect service functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  9. Children's Privacy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our service is not intended for individuals under the age of 18 unless used by authorized healthcare providers managing pediatric patient records in accordance with applicable laws and with proper parental or guardian consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  10. International Data Transfers
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  11. Changes to This Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
                  12. Contact Us
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-foreground font-medium">Devlomatix - Data Protection Team</p>
                  <p className="text-muted-foreground">Email: privacy@carewell.devlomatix.in</p>
                  <p className="text-muted-foreground">Phone: (+91) 9712340450</p>
                  <p className="text-muted-foreground">Address: Vadodara, Gujarat, India</p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
