import React from 'react';

const TermsPage = () => {
    const lastUpdated = "March 24, 2024";

    return (
        <main className="flex-grow bg-background">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden border-b border-border/50 bg-card/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
                <div className="container relative mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Please read these terms carefully before using AcsTechHub services. By using our platform, you agree to these terms.
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
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">1. Agreement to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and AcsTechHub ("we," "us" or "our"), concerning your access to and use of our website and services.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">2. Intellectual Property Rights</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Unless otherwise indicated, the Site and Services are our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">3. User Representations</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                By using the Site, you represent and warrant that:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                                <li>You are not a minor in the jurisdiction in which you reside.</li>
                                <li>You will not access the Site through automated or non-human means.</li>
                                <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">4. Prohibited Activities</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">5. Term and Termination</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms of Service shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE TO ANY PERSON FOR ANY REASON.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">6. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">7. Governing Law</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of applicable jurisdiction, without regard to its conflict of law principles.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display font-bold text-foreground mb-4 font-display">8. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <strong>legal@acstechhub.com</strong>
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
};

export default TermsPage;
