import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CTA } from "@/components/landing/CTA";
import { ThemeProvider } from "@/hooks/use-theme";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const postsData: Record<string, { title: string; excerpt: string; category: string; date: string; readTime: string; content: string[] }> = {
  "whatsapp-marketing-strategies-2025": {
    title: "10 WhatsApp Marketing Strategies That Actually Work in 2025",
    excerpt: "Discover proven strategies to boost engagement, drive sales, and build lasting customer relationships through WhatsApp Business API.",
    category: "Marketing",
    date: "Apr 5, 2026",
    readTime: "8 min read",
    content: [
      "WhatsApp has evolved from a simple messaging app to a powerful marketing channel with over 2 billion active users worldwide. For businesses looking to tap into this massive audience, the WhatsApp Business API offers unparalleled opportunities for customer engagement.",
      "1. Personalized Welcome Messages — First impressions matter. Set up automated welcome messages that greet new contacts by name and introduce your brand. Use KonnectX's chatbot builder to create dynamic welcome flows that segment users based on their interests from the very first interaction.",
      "2. Interactive Product Catalogs — Showcase your products directly within WhatsApp using the native catalog feature. Customers can browse, ask questions, and place orders without leaving the chat. This reduces friction and increases conversion rates by up to 45%.",
      "3. Abandoned Cart Recovery — Integrate your e-commerce platform with WhatsApp to automatically send gentle reminders to customers who left items in their cart. Include product images, pricing, and a direct link to complete the purchase.",
      "4. Broadcast Lists for Segmented Campaigns — Unlike group messages, broadcast lists let you send personalized messages to multiple contacts simultaneously. Segment your audience by purchase history, location, or interests for maximum relevance.",
      "5. Click-to-WhatsApp Ads — Run Facebook and Instagram ads with a 'Send Message' CTA that opens a WhatsApp conversation. This bridges the gap between social media discovery and direct customer engagement.",
      "6. Customer Feedback Loops — After a purchase or service interaction, automatically send satisfaction surveys via WhatsApp. The conversational format yields 3x higher response rates compared to email surveys.",
      "7. Exclusive VIP Groups — Create exclusive WhatsApp groups for your most loyal customers. Share early access to sales, behind-the-scenes content, and special offers to build community and drive repeat purchases.",
      "8. Rich Media Storytelling — Use images, videos, voice notes, and documents to tell your brand story. A short behind-the-scenes video or a customer testimonial clip can be more persuasive than any text message.",
      "9. Automated Order Updates — Keep customers informed with real-time order confirmations, shipping updates, and delivery notifications. Proactive communication reduces support inquiries by up to 60%.",
      "10. WhatsApp Status Marketing — Post daily stories on your WhatsApp Business Status to stay top-of-mind. Share promotions, new arrivals, tips, and user-generated content to drive engagement without sending direct messages.",
    ],
  },
  "no-code-whatsapp-chatbot": {
    title: "How to Build a No-Code WhatsApp Chatbot in Under 30 Minutes",
    excerpt: "Step-by-step guide to creating powerful automated conversations using KonnectX's drag-and-drop chatbot builder.",
    category: "Tutorial",
    date: "Mar 28, 2026",
    readTime: "6 min read",
    content: [
      "Building a WhatsApp chatbot no longer requires a team of developers. With KonnectX's visual chatbot builder, you can create sophisticated automated conversations in minutes, not months.",
      "Getting Started — Log into your KonnectX dashboard and navigate to the Chatbot Builder section. You'll see a clean canvas where you can design your conversation flows using simple drag-and-drop blocks.",
      "Step 1: Define Your Chatbot's Purpose — Before building, decide what your chatbot should accomplish. Common use cases include customer support FAQs, product recommendations, appointment booking, and lead qualification.",
      "Step 2: Create Your Welcome Flow — Drag a 'Message' block onto the canvas and type your greeting. Add 'Button' blocks to give users clear options like 'Browse Products', 'Get Support', or 'Book a Demo'.",
      "Step 3: Build Conversation Branches — Connect each button to its own conversation flow. For example, 'Browse Products' could lead to a product catalog display, while 'Get Support' routes to FAQ responses or a live agent handoff.",
      "Step 4: Add Smart Conditions — Use conditional logic blocks to personalize responses based on user data. Returning customers might see different options than first-time visitors.",
      "Step 5: Integrate with Your Tools — Connect your chatbot to your CRM, e-commerce platform, or calendar app using KonnectX's built-in integrations. This enables real-time data lookups and automated actions.",
      "Step 6: Test and Refine — Use the built-in simulator to test every conversation path. Check for dead ends, unclear messages, and missing edge cases before going live.",
      "Pro Tips — Keep messages concise (under 160 characters when possible). Use emojis sparingly but effectively. Always provide an option to reach a human agent. Review chatbot analytics weekly to identify drop-off points and optimize accordingly.",
    ],
  },
  "whatsapp-business-api-vs-app": {
    title: "WhatsApp Business API vs WhatsApp Business App: Which One Do You Need?",
    excerpt: "A comprehensive comparison to help you decide the right WhatsApp solution for your business size and goals.",
    category: "Guide",
    date: "Mar 15, 2026",
    readTime: "5 min read",
    content: [
      "Choosing between the WhatsApp Business App and the WhatsApp Business API is one of the most important decisions for your business communication strategy. Each serves different needs and scales.",
      "WhatsApp Business App — The free app is designed for small businesses with a single user managing customer conversations. It offers basic features like a business profile, quick replies, labels, and a simple product catalog.",
      "WhatsApp Business API — The API is built for medium to large businesses that need multi-user access, automation, CRM integration, and high-volume messaging. It requires a Business Solution Provider (BSP) like KonnectX to access and manage.",
      "Key Differences in Messaging — The Business App limits you to manual, one-to-one conversations. The API enables automated messages, chatbots, broadcast campaigns to unlimited contacts, and template messages for proactive outreach.",
      "Team Collaboration — The Business App supports only one device (plus up to 4 linked devices). The API allows unlimited team members to manage conversations simultaneously through a shared inbox with role-based access control.",
      "Automation Capabilities — With the app, you get basic quick replies and away messages. The API unlocks full chatbot automation, workflow triggers, conditional logic, and integration with your existing business tools.",
      "Analytics and Reporting — The Business App provides minimal insights. The API offers comprehensive analytics including message delivery rates, response times, customer satisfaction scores, and campaign performance metrics.",
      "Cost Comparison — The Business App is free but limited. The API has per-conversation pricing from Meta, plus the BSP platform cost. However, the ROI from automation and scale typically outweighs the investment within the first month.",
      "Our Recommendation — If you're handling fewer than 50 conversations per day with a single team member, start with the Business App. Once you need automation, multiple agents, or want to scale your messaging, upgrade to the API through KonnectX.",
    ],
  },
  "ecommerce-whatsapp-catalog-cart-recovery": {
    title: "Boosting E-Commerce Sales with WhatsApp Catalog & Cart Recovery",
    excerpt: "Learn how to integrate your product catalog and recover abandoned carts automatically through WhatsApp messaging.",
    category: "E-Commerce",
    date: "Mar 8, 2026",
    readTime: "7 min read",
    content: [
      "E-commerce businesses lose an average of 70% of potential sales to cart abandonment. WhatsApp's native catalog feature combined with automated cart recovery can dramatically reduce this loss and boost revenue.",
      "Setting Up Your WhatsApp Catalog — Sync your product catalog from Shopify, WooCommerce, or any e-commerce platform directly to WhatsApp through KonnectX. Products appear with images, descriptions, and prices that customers can browse within the chat.",
      "The Cart Recovery Flow — When a customer abandons their cart, KonnectX triggers an automated WhatsApp message sequence. The first message is sent after 1 hour with a friendly reminder. A second message follows at 24 hours with a small incentive.",
      "Crafting Effective Recovery Messages — The best recovery messages are personal and helpful, not pushy. Include the customer's name, the specific items left behind, product images, and a one-tap link to complete checkout.",
      "Timing is Everything — Our data shows the optimal recovery sequence: first message at 1 hour (35% recovery rate), second at 24 hours with 5% discount (additional 15% recovery), and final message at 72 hours with free shipping (additional 8% recovery).",
      "Product Recommendations — Use purchase history and browsing data to suggest complementary products within WhatsApp conversations. 'Customers who bought X also loved Y' messages generate 25% higher average order values.",
      "Order Confirmation & Tracking — Keep the engagement going post-purchase with automated order confirmations, shipping updates, and delivery notifications. This builds trust and opens the door for repeat purchases.",
      "Measuring Success — Track key metrics including cart recovery rate, revenue recovered, average order value from WhatsApp, and customer lifetime value for WhatsApp-engaged customers versus non-engaged ones.",
    ],
  },
  "gdpr-whatsapp-compliance": {
    title: "GDPR & WhatsApp: How to Stay Compliant While Scaling Campaigns",
    excerpt: "Essential compliance tips for businesses running WhatsApp campaigns in regulated markets.",
    category: "Compliance",
    date: "Feb 25, 2026",
    readTime: "4 min read",
    content: [
      "Running WhatsApp marketing campaigns in Europe and other regulated markets requires careful attention to data protection laws. Here's how to stay compliant while still scaling your messaging effectively.",
      "Consent is King — Under GDPR, you must obtain explicit opt-in consent before sending marketing messages. This means a clear, affirmative action from the user — pre-ticked boxes don't count. Use double opt-in flows where users confirm their subscription via WhatsApp itself.",
      "What Constitutes Valid Consent — Your opt-in must clearly state: who is messaging them, what types of messages they'll receive, how frequently they'll hear from you, and how they can opt out at any time.",
      "Data Storage and Processing — All customer data processed through WhatsApp must comply with GDPR requirements. Ensure your BSP (like KonnectX) stores data in EU-compliant data centers and has appropriate data processing agreements in place.",
      "Right to Erasure — Customers can request deletion of their data at any time. Implement automated workflows that can purge customer data from your WhatsApp CRM and related systems within the required timeframe.",
      "Template Message Approval — Meta reviews all template messages before they can be used. Ensure your templates don't contain misleading content, comply with WhatsApp's commerce policy, and include clear opt-out instructions.",
      "Record Keeping — Maintain detailed records of when and how each contact opted in, what they consented to, and any preference changes. KonnectX's compliance dashboard helps automate this audit trail.",
      "Practical Tips — Always include an easy opt-out mechanism in every message. Regularly clean your contact lists. Conduct periodic compliance audits. Train your team on data protection best practices.",
    ],
  },
  "whatsapp-broadcast-vs-group-messaging": {
    title: "The Ultimate Guide to WhatsApp Broadcast vs Group Messaging",
    excerpt: "Understand the key differences, use cases, and best practices for reaching your audience at scale.",
    category: "Marketing",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    content: [
      "When it comes to reaching multiple customers on WhatsApp, businesses often confuse broadcast lists with group messaging. Understanding the differences is crucial for effective communication strategy.",
      "What Are Broadcast Lists? — A broadcast list lets you send a message to multiple contacts at once. Each recipient receives the message as a private, individual chat. They don't see other recipients, and their replies come only to you.",
      "What Are WhatsApp Groups? — Groups create a shared space where all members can see each other's messages and interact. Groups are great for community building but less ideal for marketing due to privacy concerns and noise.",
      "Privacy and Professionalism — Broadcasts maintain privacy since recipients don't see each other. This is essential for business communications where sharing customer contact information would be inappropriate or illegal.",
      "Engagement Patterns — Broadcast messages have higher open rates (90%+) because they appear as personal messages. Group messages often get muted by users overwhelmed by notification volume.",
      "Personalization Capabilities — With the WhatsApp Business API and KonnectX, broadcast messages can be personalized with customer names, purchase history, and dynamic content. Group messages are the same for everyone.",
      "Scale Limitations — The Business App limits broadcasts to 256 contacts per list. The API through KonnectX enables unlimited broadcast reach with proper template messages and contact segmentation.",
      "Best Practices for Broadcasts — Segment your audience for relevance. Send at optimal times (typically 10 AM–12 PM and 6 PM–8 PM local time). Keep messages concise and actionable. Include rich media when appropriate. Always provide opt-out options.",
      "When to Use Groups — Community building, beta testing feedback, VIP customer clubs, internal team communication, and educational cohorts. Keep groups small (under 50 members) for meaningful interaction.",
      "The Winning Strategy — Use broadcasts for marketing campaigns and transactional updates. Use groups for community building and customer engagement programs. Combine both for a comprehensive WhatsApp communication strategy.",
    ],
  },
};

const slugFromTitle = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const Route = createFileRoute("/blog/$slug")({
  component: BlogDetailPage,
  head: ({ params }) => {
    const post = postsData[params.slug];
    const title = post ? `${post.title} — KonnectX Blog` : "Post Not Found — KonnectX";
    const desc = post?.excerpt ?? "Blog post not found.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: () => (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="text-3xl font-bold">Post Not Found</h1>
          <p className="mt-2 text-muted-foreground">The article you're looking for doesn't exist.</p>
          <Button asChild className="mt-6" style={{ background: "var(--gradient-sun)" }}>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  ),
});

const categoryColors: Record<string, string> = {
  Marketing: "bg-primary/15 text-primary",
  Tutorial: "bg-chart-2/15 text-chart-2",
  Guide: "bg-chart-3/15 text-chart-3",
  "E-Commerce": "bg-chart-4/15 text-chart-4",
  Compliance: "bg-chart-5/15 text-chart-5",
};

function BlogDetailPage() {
  const { slug } = Route.useParams();
  const post = postsData[slug];

  if (!post) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <h1 className="text-3xl font-bold">Post Not Found</h1>
            <p className="mt-2 text-muted-foreground">The article you're looking for doesn't exist.</p>
            <Button asChild className="mt-6" style={{ background: "var(--gradient-sun)" }}>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  // Get related posts (same category, excluding current)
  const related = Object.entries(postsData)
    .filter(([s, p]) => p.category === post.category && s !== slug)
    .slice(0, 2);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navbar />

        <article className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {/* Back link */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Blog
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="mt-8 flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[post.category] ?? "bg-primary/15 text-primary"}`}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> {post.date}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {post.readTime}
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.75rem]">
                {post.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </motion.div>

            {/* Divider */}
            <div className="my-10 h-px bg-border" />

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="prose prose-lg max-w-none dark:prose-invert"
            >
              {post.content.map((paragraph, i) => {
                // Check if paragraph starts with a number or bold-like pattern
                const isHeading = /^\d+\.|^[A-Z][^.]{0,60}\s—/.test(paragraph);
                if (isHeading) {
                  const [heading, ...rest] = paragraph.split(" — ");
                  return (
                    <div key={i} className="mt-8 first:mt-0">
                      <h2 className="text-xl font-bold text-foreground">{heading}</h2>
                      {rest.length > 0 && (
                        <p className="mt-2 text-muted-foreground leading-relaxed">{rest.join(" — ")}</p>
                      )}
                    </div>
                  );
                }
                return (
                  <p key={i} className="mt-4 text-muted-foreground leading-relaxed first:mt-0">
                    {paragraph}
                  </p>
                );
              })}
            </motion.div>

            {/* Share */}
            <div className="mt-12 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
              <Share2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Share this article</span>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (typeof navigator !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="border-t border-border py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold">Related Articles</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {related.map(([relSlug, rel]) => (
                  <Link
                    key={relSlug}
                    to="/blog/$slug"
                    params={{ slug: relSlug }}
                    className="group glass-card rounded-2xl p-5 transition-all hover:ring-1 hover:ring-primary/30"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[rel.category] ?? "bg-primary/15 text-primary"}`}>
                      {rel.category}
                    </span>
                    <h3 className="mt-3 font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{rel.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <CTA />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
