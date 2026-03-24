import React from 'react';

const PrivacyPage = () => {
    const lastUpdated = "March 24, 2024";

    return (
        <main className="flex-grow bg-background">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden border-b border-border/50 bg-card/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
                <div className="container relative mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Your privacy is important to us. This policy outlines how we collect, use, and protect your information at AcsTechHub.
                    </p>
                    <div className="mt-8 inline-flex items-center px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                        Last Updated: {lastUpdated}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
                        
                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">1. Introduction</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Welcome to AcsTechHub. We are committed to protecting your personal data and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at support@acstechhub.com.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">2. Information We Collect</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We collect personal information that you voluntarily provide to us when you register on our platform, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Personal Identifiers:</strong> Name, email address, and contact details.</li>
                                <li><strong>Account Credentials:</strong> Passwords and similar security information used for authentication.</li>
                                <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
                                <li><strong>Device Information:</strong> IP address, browser type, and operating system.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">3. How We Use Your Information</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We use personal information collected via our website for a variety of business purposes described below:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>To facilitate account creation and logon process.</li>
                                <li>To send administrative information to you.</li>
                                <li>To fulfill and manage your requests.</li>
                                <li>To post testimonials with your consent.</li>
                                <li>To deliver targeted advertising to you.</li>
                                <li>To protect our Services and for safety and security.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">4. Sharing Your Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal information to third parties.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">5. Data Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">6. Your Privacy Rights</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                In some regions (like the European Economic Area), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">7. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have questions or comments about this policy, you may email us at <strong>support@acstechhub.com</strong> or by post to our registered office address.
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
};

export default PrivacyPage;