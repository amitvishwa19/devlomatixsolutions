'use client'
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, ThumbsUp, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams } from "next/navigation";
import Link from "next/link";

const blogPosts = {
    "improve-patient-experience": {
        id: 1,
        title: "10 Ways to Improve Patient Experience in Your Hospital",
        excerpt: "Discover proven strategies to enhance patient satisfaction and streamline hospital operations for better outcomes.",
        category: "Patient Care",
        date: "Jan 15, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=600&fit=crop",
        author: {
            name: "Dr. Priya Sharma",
            role: "Healthcare Consultant",
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
        },
        tags: ["Patient Experience", "Hospital Management", "Healthcare Quality"],
        content: `
      <p class="lead">Patient experience has become a critical metric for healthcare organizations worldwide. In today's competitive healthcare landscape, hospitals that prioritize patient satisfaction not only see better outcomes but also improved financial performance.</p>

      <h2>1. Streamline the Admission Process</h2>
      <p>The first impression matters. A complicated admission process can set a negative tone for the entire patient journey. Implement digital pre-registration, self-service kiosks, and mobile check-in options to reduce wait times and paperwork.</p>
      <p>Studies show that hospitals with streamlined admission processes see up to 40% improvement in patient satisfaction scores during the initial encounter.</p>

      <h2>2. Improve Communication</h2>
      <p>Clear, consistent communication between healthcare providers and patients is fundamental. This includes:</p>
      <ul>
        <li>Regular updates on treatment progress</li>
        <li>Clear explanation of diagnoses and treatment options</li>
        <li>Accessible channels for questions and concerns</li>
        <li>Multi-language support for diverse patient populations</li>
      </ul>

      <h2>3. Reduce Wait Times</h2>
      <p>Long wait times are one of the most common patient complaints. Implement appointment scheduling systems, real-time queue management, and capacity planning tools to minimize delays.</p>
      <blockquote>
        "Every minute a patient waits feels like five. Reducing perceived wait time through better communication and environment design can significantly improve satisfaction."
      </blockquote>

      <h2>4. Enhance the Physical Environment</h2>
      <p>The hospital environment significantly impacts patient comfort and perception of care quality. Consider:</p>
      <ul>
        <li>Comfortable waiting areas with adequate seating</li>
        <li>Clear wayfinding signage</li>
        <li>Natural lighting and calming colors</li>
        <li>Clean, well-maintained facilities</li>
      </ul>

      <h2>5. Empower Your Staff</h2>
      <p>Your staff are the face of your hospital. Invest in customer service training, empower employees to resolve issues, and create a culture of patient-centered care.</p>

      <h2>6. Leverage Technology</h2>
      <p>Modern hospital management systems like CareWell HMS can transform patient experience through:</p>
      <ul>
        <li>Patient portals for appointment booking and medical records access</li>
        <li>Automated appointment reminders</li>
        <li>Digital payment options</li>
        <li>Telemedicine capabilities</li>
      </ul>

      <h2>7. Personalize Care</h2>
      <p>Use patient data to personalize interactions and anticipate needs. Remember patient preferences, acknowledge special occasions, and tailor communication styles to individual patients.</p>

      <h2>8. Gather and Act on Feedback</h2>
      <p>Implement systematic feedback collection through surveys, comment cards, and follow-up calls. More importantly, analyze this feedback and take visible action to address concerns.</p>

      <h2>9. Ensure Continuity of Care</h2>
      <p>Patients value consistency. Assign primary care teams, ensure proper handoffs between shifts, and maintain comprehensive medical records that follow the patient throughout their journey.</p>

      <h2>10. Focus on Discharge and Follow-up</h2>
      <p>The patient experience doesn't end at discharge. Provide clear discharge instructions, schedule follow-up appointments before the patient leaves, and implement post-discharge check-in calls.</p>

      <h2>Conclusion</h2>
      <p>Improving patient experience requires a holistic approach that touches every aspect of hospital operations. By implementing these strategies and leveraging modern hospital management technology, healthcare organizations can create meaningful improvements in patient satisfaction while also achieving better clinical and financial outcomes.</p>
    `,
    },
    "future-hospital-management-2026": {
        id: 2,
        title: "The Future of Hospital Management Systems in 2026",
        excerpt: "Explore upcoming trends in healthcare technology and how modern HMS solutions are shaping the future of medical care.",
        category: "Healthcare Tech",
        date: "Jan 12, 2026",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop",
        author: {
            name: "Rahul Mehta",
            role: "Technology Director",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        },
        tags: ["Healthcare Technology", "Digital Transformation", "AI in Healthcare"],
        content: `
      <p class="lead">The healthcare industry is undergoing a digital revolution, with hospital management systems at the forefront of this transformation. As we move through 2026, several key trends are reshaping how hospitals operate and deliver care.</p>

      <h2>AI-Powered Decision Support</h2>
      <p>Artificial intelligence is no longer a futuristic concept in healthcare—it's a present reality. Modern HMS platforms are integrating AI to provide clinical decision support, predictive analytics, and automated administrative tasks.</p>
      <p>From predicting patient readmission risks to optimizing staff scheduling, AI is helping hospitals operate more efficiently while improving patient outcomes.</p>

      <h2>Interoperability and Data Exchange</h2>
      <p>The days of siloed healthcare data are numbered. With initiatives like ABDM (Ayushman Bharat Digital Mission) in India, hospitals are increasingly required to share data seamlessly across the healthcare ecosystem.</p>
      <blockquote>
        "Interoperability isn't just about technology—it's about creating a connected healthcare ecosystem that puts patients at the center."
      </blockquote>

      <h2>Cloud-First Architecture</h2>
      <p>Cloud-based HMS solutions are becoming the norm, offering benefits like:</p>
      <ul>
        <li>Scalability to handle growing patient volumes</li>
        <li>Reduced IT infrastructure costs</li>
        <li>Automatic updates and security patches</li>
        <li>Accessibility from anywhere, on any device</li>
      </ul>

      <h2>Mobile-First Experiences</h2>
      <p>Both patients and healthcare providers expect mobile access to hospital systems. From mobile apps for patient engagement to tablets for bedside charting, mobile technology is becoming integral to hospital operations.</p>

      <h2>Enhanced Security and Compliance</h2>
      <p>With increasing cyber threats targeting healthcare organizations, security has become a top priority. Modern HMS platforms are implementing advanced security measures including encryption, multi-factor authentication, and continuous monitoring.</p>

      <h2>Conclusion</h2>
      <p>The future of hospital management is digital, connected, and intelligent. Hospitals that embrace these trends will be better positioned to deliver high-quality care while managing costs and meeting regulatory requirements.</p>
    `,
    },
    "nabh-accreditation-guide": {
        id: 3,
        title: "NABH Accreditation: Complete Guide for Hospitals",
        excerpt: "Everything you need to know about NABH accreditation process, requirements, and how HMS can help achieve compliance.",
        category: "Hospital Management",
        date: "Jan 10, 2026",
        readTime: "10 min read",
        image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=600&fit=crop",
        author: {
            name: "Dr. Amit Patel",
            role: "Quality Assurance Head",
            avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
        },
        tags: ["NABH", "Accreditation", "Quality Standards", "Compliance"],
        content: `
      <p class="lead">NABH (National Accreditation Board for Hospitals & Healthcare Providers) accreditation has become a mark of quality and trust in Indian healthcare. This comprehensive guide covers everything hospitals need to know about achieving and maintaining NABH accreditation.</p>

      <h2>What is NABH Accreditation?</h2>
      <p>NABH is a constituent board of the Quality Council of India, set up to establish and operate accreditation programs for healthcare organizations. NABH accreditation signifies that a hospital meets national quality standards and is committed to continuous improvement.</p>

      <h2>Benefits of NABH Accreditation</h2>
      <ul>
        <li>Enhanced patient trust and confidence</li>
        <li>Eligibility for government healthcare schemes</li>
        <li>Improved operational efficiency</li>
        <li>Better staff morale and retention</li>
        <li>Competitive advantage in the market</li>
      </ul>

      <h2>NABH Standards Overview</h2>
      <p>NABH standards are organized into 10 chapters covering all aspects of hospital operations:</p>
      <ul>
        <li>Access, Assessment and Continuity of Care (AAC)</li>
        <li>Care of Patients (COP)</li>
        <li>Management of Medication (MOM)</li>
        <li>Patient Rights and Education (PRE)</li>
        <li>Hospital Infection Control (HIC)</li>
        <li>Continuous Quality Improvement (CQI)</li>
        <li>Responsibilities of Management (ROM)</li>
        <li>Facility Management and Safety (FMS)</li>
        <li>Human Resource Management (HRM)</li>
        <li>Information Management System (IMS)</li>
      </ul>

      <h2>How HMS Helps with NABH Compliance</h2>
      <p>A robust Hospital Management System like CareWell HMS can significantly ease the NABH accreditation journey by:</p>
      <ul>
        <li>Maintaining comprehensive patient records</li>
        <li>Tracking quality indicators automatically</li>
        <li>Generating required reports and documentation</li>
        <li>Ensuring medication management compliance</li>
        <li>Supporting audit trails and traceability</li>
      </ul>

      <h2>Conclusion</h2>
      <p>NABH accreditation is a journey of continuous improvement. With the right preparation, commitment, and technology support, hospitals of all sizes can achieve and maintain this prestigious certification.</p>
    `,
    },
};

const relatedPosts = [
    {
        id: 1,
        slug: "reducing-billing-errors",
        title: "Reducing Billing Errors with Automated Systems",
        category: "Tips & Guides",
        date: "Jan 8, 2026",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
    },
    {
        id: 5,
        slug: "abdm-integration-guide",
        title: "ABDM Integration: What Hospitals Need to Know",
        category: "Industry News",
        date: "Jan 5, 2026",
        image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=250&fit=crop",
    },
    {
        id: 6,
        slug: "pharmacy-management-best-practices",
        title: "Pharmacy Management: Best Practices for 2026",
        category: "Tips & Guides",
        date: "Jan 3, 2026",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=250&fit=crop",
    },
];

const BlogDetail = () => {
    const { articleId } = useParams();
    const post = blogPosts[articleId];

    console.log(articleId)

    if (!post) {
        return (
            <div className="min-h-screen bg-background w-full">

                <main className="pt-20 md:pt-24">
                    <div className="container mx-auto py-20 text-center">
                        <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
                        <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
                        <Link href="/blog">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Blog
                            </Button>
                        </Link>
                    </div>
                </main>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background w-full">

            <main className="">
                {/* Hero Section */}
                <section className="relative">
                    <div className="aspect-[21/9] md:aspect-[3/1] overflow-hidden">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </div>

                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative -mt-32 md:-mt-48 max-w-4xl mx-auto"
                        >
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Blog
                            </Link>

                            <Badge variant="secondary" className="mb-4">{post.category}</Badge>

                            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 mb-8">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                        <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-foreground">{post.author.name}</p>
                                        <p className="text-sm text-muted-foreground">{post.author.role}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {post.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {post.readTime}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pb-8 border-b border-border">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ThumbsUp className="w-4 h-4" />
                                    Like
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Bookmark className="w-4 h-4" />
                                    Save
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Article Content */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <motion.article
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="prose prose-lg dark:prose-invert max-w-none
                                prose-headings:font-display prose-headings:font-bold
                                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                                prose-p:text-muted-foreground prose-p:leading-relaxed
                                prose-ul:text-muted-foreground
                                prose-li:marker:text-primary
                                prose-blockquote:border-l-primary prose-blockquote:bg-secondary/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-foreground
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                [&_.lead]:text-xl [&_.lead]:text-foreground [&_.lead]:font-medium [&_.lead]:leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-border">
                                <Tag className="w-4 h-4 text-muted-foreground" />
                                {post.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-sm">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            {/* Author Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mt-12 p-6 bg-card rounded-2xl border border-border"
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                        <AvatarFallback><User className="w-6 h-6" /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-display font-bold text-foreground mb-1">
                                            {post.author.name}
                                        </h3>
                                        <p className="text-sm text-primary mb-3">{post.author.role}</p>
                                        <p className="text-muted-foreground text-sm">
                                            Expert in healthcare technology and hospital management systems with over 15 years of experience helping hospitals improve their operations and patient care.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Related Articles */}
                <section className="py-12 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                                Related Articles
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedPosts.map((relatedPost, index) => (
                                    <motion.article
                                        key={relatedPost.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all"
                                    >
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={relatedPost.image}
                                                alt={relatedPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant="outline" className="text-xs">{relatedPost.category}</Badge>
                                                <span className="text-xs text-muted-foreground">{relatedPost.date}</span>
                                            </div>
                                            <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                {relatedPost.title}
                                            </h3>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 border border-primary/20"
                        >
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                                Ready to Transform Your Hospital?
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                See how CareWell HMS can help you implement these best practices and improve patient care.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/contact">
                                    <Button className="hero-gradient text-primary-foreground">
                                        Schedule a Demo
                                    </Button>
                                </Link>
                                <Link href="/blog">
                                    <Button variant="outline">
                                        Read More Articles
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default BlogDetail;
