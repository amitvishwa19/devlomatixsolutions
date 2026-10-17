import {
  Globe,
  Smartphone,
  Cpu,
  Zap,
  Boxes,
  GraduationCap,
  Laptop,
  Server,
  Database,
  Code2,
  MessageSquare,
  ShieldCheck,
  Activity,
  Workflow,
  Bot,
  Building2,
  TrendingUp,
  AlertCircle,
  Wallet,
  Clock,
  HeartPulse,
  Send,
  Award,
  PlayCircle,
  ShoppingCart,
  Layout,
  FileCode,
  CheckCircle2,
  Calculator,
  Compass,
  Search,
  Wifi,
  Eye,
  RefreshCw,
  Key,
  Rocket,
  Shield,
  Lock,
  FileSpreadsheet,
  Users,
  Target,
  Layers,
  Gauge,
  DollarSign
} from 'lucide-react';

// 39-Slide Comprehensive Plain-English Masterclass Deck
// Designed for fresh sales executives, consultants, and clients.
export const slides = [
  // 1. COVER / ROADMAP
  {
    id: 1,
    type: "cover",
    title: "Devlomatix Solutions",
    subtitle: "Technology & Business Solutions Masterclass",
    tagline: "Websites, Mobile Apps, Cloud, AI & Automation Explained in Plain English",
    meta: {
      category: "Curriculum Overview",
      module: "Course Introduction",
      duration: "Overview"
    },
    modulesOverview: [
      { num: "01", name: "Tech Foundations", topic: "Internet, Servers, Databases, APIs, Cloud & Cybersecurity" },
      { num: "02", name: "Web Development", topic: "The 4 Types of Websites, Speed, SEO, Frontend vs Backend" },
      { num: "03", name: "Mobile Development", topic: "What is an App, 4 Superpowers, Expo/React Native Advantage" },
      { num: "04", name: "AI & Automations", topic: "WhatsApp Bots, 3s Lead Response, LLMs & Workflow Engines" },
      { num: "05", name: "Client Solutions", topic: "5-Min Discovery Call, Pricing Tiers & Objection Battlecards" },
      { num: "06", name: "Sales Mastery Check", topic: "8 Verbal Drills, Real Case Studies & Final Certification" }
    ]
  },

  // 2. MODULE 1 — THE INTERNET & WEB ARCHITECTURE
  {
    id: 2,
    type: "mod1-internet",
    title: "How the Internet Actually Works",
    subtitle: "How a Tap on a Smartphone Reaches Across the Globe in 60 Milliseconds",
    meta: {
      category: "Module 1 • Technology Foundations",
      module: "Internet Architecture",
      duration: "4 min"
    },
    inOneSentence: {
      headline: "The Plain-English Picture:",
      definition: "The internet is not magic in the sky — it is a massive physical network of underground and undersea fiber-optic cables connecting computers across cities and continents in milliseconds."
    },
    fourPillars: [
      {
        title: "1. The User's Device (Client)",
        analogy: "The Customer Ordering at the Table",
        desc: "Your customer's iPhone, Android phone, or laptop running a browser like Google Chrome or Safari. It requests information by clicking a link.",
        icon: Smartphone
      },
      {
        title: "2. The Domain Name (DNS Phonebook)",
        analogy: "Looking Up an Address by Name",
        desc: "Humans remember names like 'google.com', but computers only understand numbers (IP addresses like 142.250.190.46). The DNS system instantly translates names into numbers.",
        icon: Globe
      },
      {
        title: "3. Undersea Cables & Fiber Optic",
        analogy: "The Super-Fast Optical Highway",
        desc: "Glass cables spanning oceans carry light pulses at 70% the speed of light, transmitting text, pictures, and videos across continents in under 60 milliseconds.",
        icon: Wifi
      },
      {
        title: "4. The Hosting Server",
        analogy: "The Digital Library Waiting to Serve",
        desc: "The secure computer in a data center that holds the website code and photos, instantly packing them up and shooting them back to the user's screen.",
        icon: Server
      }
    ],
    salesTakeaway: "What to Tell the Client: 'When a customer visits your website from London or New York, our cloud network delivers your pages in under half a second because your data lives on high-speed global delivery lines.'"
  },

  // 3. MODULE 1 — HARDWARE, SOFTWARE & SERVERS
  {
    id: 3,
    type: "mod1-hardware",
    title: "Hardware, Software & Servers",
    subtitle: "The Physical Machinery vs. The Digital Brain (Why Servers Never Sleep)",
    meta: {
      category: "Module 1 • Technology Foundations",
      module: "Core Concepts",
      duration: "4 min"
    },
    concepts: [
      {
        title: "Hardware (The Physical Machine)",
        analogy: "The Metal Body & Screen",
        whatItIs: "Anything physical you can touch with your hands: iPhone screens, keyboard, RAM chips, hard drives, or barcode scanners.",
        whyClientCares: "Hardware wears out and is useless without intelligent software tailored around your exact daily business workflow.",
        icon: Laptop
      },
      {
        title: "Software (The Digital Brain)",
        analogy: "The Instructions & Intelligence",
        whatItIs: "The programs, logic, and apps (like WhatsApp, Excel, or DevX CRM) that tell the hardware what to do, how to calculate, and where to send information.",
        whyClientCares: "Good software transforms a standard $500 computer into a 24/7 revenue-generating machine that eliminates human error.",
        icon: Code2
      },
      {
        title: "Servers (The Computer That Never Sleeps)",
        analogy: "The 24/7 Commercial Vault",
        whatItIs: "A heavy-duty, ultra-reliable computer housed in a climate-controlled data center with backup generators, dual internet feeds, and 99.9% guaranteed uptime.",
        whyClientCares: "Your customer can browse your products and pay for orders at 3:30 AM while you and your staff are fast asleep at home.",
        icon: Server
      }
    ],
    salesScript: "What to Tell the Client: 'A normal laptop overheats, gets turned off at night, and loses files if the power trips. A server is an industrial-grade computer that stays awake 365 days a year so your business never misses a customer.'"
  },

  // 4. MODULE 1 — DATABASES: THE DIGITAL BANK VAULT
  {
    id: 4,
    type: "mod1-databases",
    title: "Databases: The Digital Bank Vault",
    subtitle: "Why Spreadsheets Fail at 5,000 Rows and How Databases Protect Business Assets",
    meta: {
      category: "Module 1 • Technology Foundations",
      module: "Data Architecture",
      duration: "4 min"
    },
    definition: "A Database is an organized, high-speed digital safe designed to store millions of customer records, orders, payments, and passwords securely with instant search and zero data loss.",
    excelVsDb: [
      {
        aspect: "Concurrent Users",
        excel: "Freezes or corrupts when 3+ people edit at once",
        database: "10,000+ staff and customers read & write simultaneously with zero conflicts"
      },
      {
        aspect: "Search Speed",
        excel: "Takes 10-30 seconds to scroll through 10,000 rows",
        database: "Finds 1 customer out of 5 million in 0.003 seconds"
      },
      {
        aspect: "Security & Permissions",
        excel: "Anyone with the file can copy all phone numbers",
        database: "Role permissions: Receptionist sees names; Owner sees revenue & profit margins"
      },
      {
        aspect: "Backups & Recovery",
        excel: "If the laptop hard disk crashes, data is gone forever",
        database: "Automated real-time cloud backups with 1-click restore to any second"
      }
    ],
    typesSummary: "Relational (SQL/PostgreSQL) organizes data into clean linked tables (Customer → Orders → Invoices). NoSQL (MongoDB) handles flexible documents like chat logs and catalog specs.",
    salesPitch: "What to Tell the Client: 'Running a growing business on Excel is like storing cash in an unlocked desk drawer. A database is an armored bank vault that ensures you never lose a customer lead, order history, or payment record.'"
  },

  // 5. MODULE 1 — APIS & WEBHOOKS
  {
    id: 5,
    type: "mod1-apis",
    title: "APIs & Webhooks: The Digital Waiters",
    subtitle: "How Different Systems Talk to Banks, Couriers & WhatsApp in Real Time",
    meta: {
      category: "Module 1 • Technology Foundations",
      module: "Integrations & APIs",
      duration: "5 min"
    },
    apiAnalogy: {
      headline: "The Restaurant Waiter Analogy:",
      text: "Imagine you are sitting in a restaurant. You cannot walk into the kitchen to cook food. You tell the waiter your order. The waiter walks into the kitchen, gets the cooked meal from the chef, and brings it back to your table. An API (Application Programming Interface) is that digital waiter."
    },
    realExamples: [
      {
        service: "Payment Gateway (Razorpay/Stripe)",
        howApiWorks: "Your website sends the bill amount to the bank via API. The bank processes the card/UPI and tells your website: 'Payment Approved'.",
        benefit: "Instant verified transactions without manual bank statement checking.",
        icon: Wallet
      },
      {
        service: "Courier Delivery (Shiprocket/FedEx)",
        howApiWorks: "When an order is placed, an API automatically books a pickup with the courier, prints the shipping label, and generates tracking codes.",
        benefit: "Zero manual address typing; eliminates dispatch errors.",
        icon: Rocket
      },
      {
        service: "WhatsApp Business API",
        howApiWorks: "When a customer submits a contact form, the API immediately sends an automated WhatsApp message to their phone with your catalog PDF.",
        benefit: "Reaches the customer in 3 seconds before they close their phone.",
        icon: MessageSquare
      }
    ],
    webhookNote: "Webhooks vs APIs: An API is when you ask for data ('Did the customer pay?'). A Webhook is an automatic instant alert ('Hey! The customer just paid right now, here is the confirmation!')."
  },

  // 6. MODULE 1 — CLOUD COMPUTING
  {
    id: 6,
    type: "mod1-cloud-infra",
    title: "Cloud Computing: Renting Modern Infrastructure",
    subtitle: "Why Physical Office Computers are Obsolete for Modern Businesses",
    meta: {
      category: "Module 1 • Technology Foundations",
      module: "Cloud Computing",
      duration: "4 min"
    },
    inSimpleTerms: "Cloud computing means renting ultra-secure computing power, storage, and networking from technology giants (Amazon AWS, Google Cloud, Microsoft Azure) over the internet instead of buying expensive physical hardware for your office.",
    benefits: [
      {
        title: "1. No Expensive Upfront Hardware",
        desc: "Instead of spending $10,000 on a heavy server box that depreciates and gathers dust, you pay a modest monthly usage fee for enterprise-grade performance.",
        icon: Wallet
      },
      {
        title: "2. Infinite Auto-Scaling",
        desc: "If 500 people visit your site normally, but 50,000 people flood in during a Diwali/Black Friday sale, the cloud automatically adds more power in seconds so the site never crashes.",
        icon: TrendingUp
      },
      {
        title: "3. 99.99% Reliability & Disaster Proof",
        desc: "If a lightning strike hits a data center in Frankfurt, your software instantly switches to another data center in Dublin without a single second of downtime.",
        icon: ShieldCheck
      },
      {
        title: "4. Access Anywhere on Earth",
        desc: "Your managers and sales reps can securely log in to DevX CRM or Curexa from a smartphone in London, a tablet in Dubai, or a laptop in Mumbai.",
        icon: Globe
      }
    ],
    salesPitch: "What to Tell the Client: 'In the old days, if an office suffered a flood, power outage, or burglary, all business records were lost. With our cloud infrastructure, your business is 100% immune to local office accidents.'"
  },

  // 7. MODULE 1 — CYBERSECURITY & DATA PRIVACY
  {
    id: 7,
    type: "mod1-security",
    title: "Cybersecurity, SSL & Data Privacy",
    subtitle: "How We Keep Client Records & Financial Data 100% Safe from Hackers",
    meta: {
      category: "Module 1 • Technology Foundations",
      module: "Security & Compliance",
      duration: "4 min"
    },
    pillars: [
      {
        title: "The Green SSL Padlock (HTTPS)",
        analogy: "The Armored Bank Envelope",
        desc: "Standard HTTP sends data like a postcard that anyone on public Wi-Fi can read. HTTPS encrypts every password and credit card number inside an unbreakable digital envelope (AES-256 encryption).",
        icon: Lock
      },
      {
        title: "Role-Based Access Control (RBAC)",
        analogy: "Keycards for Specific Doors",
        desc: "Not every employee should see the company bank balance. We assign strict access levels: junior staff see their own leads; account managers see invoices; only the CEO sees total profits.",
        icon: Key
      },
      {
        title: "Automated Daily Backups",
        analogy: "The Spare Car Key in a Safe Deposit Box",
        desc: "Every midnight, an encrypted clone of the entire database is copied to a separate secure location. Even if an employee accidentally deletes a table, it can be restored in minutes.",
        icon: RefreshCw
      },
      {
        title: "Data Privacy & Compliance (GDPR / DPDP)",
        analogy: "The Legal Guarantee of Trust",
        desc: "We ensure customer phone numbers and emails are never leaked, sold, or exposed to third parties, complying with modern global data protection regulations.",
        icon: Shield
      }
    ],
    salesScript: "What to Tell the Client: 'Security is not an add-on; it is built into the foundation. We protect your business reputation so you never have to worry about data leaks, hackers, or Google security warning banners.'"
  },

  // 8. MODULE 2 — WHAT IS A WEBSITE?
  {
    id: 8,
    type: "what-is-website",
    title: "What is a Website?",
    subtitle: "The Plain-English Definition Every Sales Person & Client Must Understand",
    meta: {
      category: "Module 2 • Web Fundamentals",
      module: "Core Definition",
      duration: "4 min"
    },
    inOneSentence: {
      headline: "In One Simple Sentence:",
      definition: "A website is a collection of connected digital pages hosted on the internet under a single web address (like yourcompany.com) that anyone can open on a phone, tablet, or computer to view your products, services, and company information 24 hours a day."
    },
    pitch15Sec: {
      label: "The 15-Second Pitch for Any Client:",
      script: "A physical office only lets local people visit between 9 AM and 6 PM on one specific street. A website is your digital showroom open 24 hours a day, 365 days a year. Anyone with a smartphone can discover your services, check your credibility, and contact you — even when your physical shop is closed at midnight."
    },
    physicalVsWeb: [
      { aspect: "Operating Hours", physical: "9 AM – 6 PM (Closed at night)", website: "24 Hours / 365 Days (Never sleeps)" },
      { aspect: "Geographic Reach", physical: "Only people walking down 1 street", website: "Entire city, country, or world" },
      { aspect: "Customer Capacity", physical: "5–10 people crowd your counter", website: "Thousands browse at the same time" },
      { aspect: "Running Cost", physical: "Expensive rent, power & salaries", website: "Tiny fraction of physical overhead" }
    ],
    threeParts: [
      {
        part: "1. The Domain Name",
        analogy: "Your Business Address & Signboard",
        desc: "The unique name people type into their phone browser (e.g. google.com or yourbusiness.com). It is your digital signboard on the internet.",
        icon: Globe
      },
      {
        part: "2. The Server / Hosting",
        analogy: "The Rented Land & Building",
        desc: "The secure, always-on computer where all your website photos, text, and code files physically live so people can load them anytime.",
        icon: Server
      },
      {
        part: "3. The Design & Content",
        analogy: "The Interior Showroom & Shelves",
        desc: "The visual pages, photos, text, prices, and buttons that visitors see and click on their screens.",
        icon: Laptop
      }
    ],
    whyCare: "Why Every Business Needs a Website: Without a website, your business doesn't exist on Google. A website is your hardest-working employee — it never sleeps, never takes sick days, and presents your business professionally to thousands of potential customers 24/7."
  },

  // 9. MODULE 2 — HOW MANY TYPES OF WEBSITES ARE THERE?
  {
    id: 9,
    type: "four-website-types",
    title: "How Many Types of Websites Are There?",
    subtitle: "The 4 Main Categories: Static, Dynamic, E-Commerce & Custom Web Apps",
    meta: {
      category: "Module 2 • Web Development",
      module: "Website Classification",
      duration: "5 min"
    },
    goldenRule: "Golden Rule: Every single website on Earth falls into one of these 4 categories. Once you understand these 4, you can advise any client with 100% confidence!",
    fourTypes: [
      {
        num: "01",
        type: "1. Static Website",
        analogy: "The Printed Digital Brochure",
        whatItIs: "Fixed pages where text and photos are coded once. Every single visitor sees the exact same information. No database needed. Blazing fast, ultra-secure, and virtually zero maintenance.",
        bestFor: "Visiting card sites, portfolios, doctors, lawyers, accountants, local service agencies.",
        accent: "border-blue-500/30 text-blue-400",
        icon: FileCode
      },
      {
        num: "02",
        type: "2. Dynamic Website",
        analogy: "The Living Digital Newspaper",
        whatItIs: "Content is stored in a database and updates automatically without touching code. Features search bars, user comments, blogs, and an easy Admin CMS where the owner can post articles in 2 minutes.",
        bestFor: "News media, blogs, real estate property listings, corporate portals, directories.",
        accent: "border-cyan-500/30 text-cyan-400",
        icon: Layout
      },
      {
        num: "03",
        type: "3. E-Commerce Website",
        analogy: "The 24/7 Online Shopping Store",
        whatItIs: "A full digital retail shop with product catalogs, shopping cart, discount coupons, online UPI/Card payment gateway (Razorpay/Stripe), automated invoice generation, and courier delivery tracking.",
        bestFor: "Clothing brands, electronics, grocery, jewelry, direct-to-consumer (D2C) brands.",
        accent: "border-emerald-500/30 text-emerald-400",
        icon: ShoppingCart
      },
      {
        num: "04",
        type: "4. Custom Web App / Portal",
        analogy: "The Tailor-Made Business Software",
        whatItIs: "Interactive software that runs inside a web browser with secure logins, role-based access, automated calculations, and custom workflows. Built to replace 10 messy Excel sheets and paperwork.",
        bestFor: "CRMs, clinic patient management, school portals, booking engines, B2B supplier portals.",
        accent: "border-purple-500/30 text-purple-400",
        icon: Boxes
      }
    ]
  },

  // 10. MODULE 2 — THE 4 TYPES MASTER COMPARISON TABLE
  {
    id: 10,
    type: "four-types-table",
    title: "The 4 Website Types at a Glance",
    subtitle: "The Master Comparison Matrix: Memorize This to Win Any Client Consultation",
    meta: {
      category: "Module 2 • Web Development",
      module: "Comparison Matrix",
      duration: "5 min"
    },
    takeaway: "How to Decide in 5 Seconds: If they only want credibility → Static. If they regularly post articles/news → Dynamic. If they sell products online → E-Commerce. If they manage staff, patients, or invoices → Custom Web App.",
    tableData: [
      {
        feature: "Everyday Analogy",
        staticSite: "Printed Paper Flyer / Card",
        dynamicSite: "Living Newspaper / Magazine",
        ecommSite: "Digital Shopping Mall",
        customApp: "Tailor-Made Business Software"
      },
      {
        feature: "Primary Goal",
        staticSite: "Show company info & phone number",
        dynamicSite: "Publish blogs, news & search feeds",
        ecommSite: "Sell products & collect money online",
        customApp: "Automate daily company operations"
      },
      {
        feature: "Database Needed?",
        staticSite: "❌ No (HTML / CSS files only)",
        dynamicSite: "✅ Yes (stores articles & blogs)",
        ecommSite: "✅ Yes (products, orders & carts)",
        customApp: "✅ Yes (multi-user relational DB)"
      },
      {
        feature: "Who Can Edit It?",
        staticSite: "Developer (modifies the code)",
        dynamicSite: "Owner via simple Admin CMS Panel",
        ecommSite: "Owner (adds products & prices)",
        customApp: "Staff & managers via role logins"
      },
      {
        feature: "Typical Speed & Cost",
        staticSite: "Blazing Fast (<0.5s) • Lowest Cost ($)",
        dynamicSite: "Fast • Moderate Cost ($$)",
        ecommSite: "Fast • Moderate-High Cost ($$$)",
        customApp: "High-Performance • Enterprise Cost ($$$$)"
      },
      {
        feature: "Real-World Example",
        staticSite: "Doctor's profile, lawyer visiting site",
        dynamicSite: "BBC, TechCrunch, NDTV, Real Estate",
        ecommSite: "Amazon, Flipkart, Nike online store",
        customApp: "DevX CRM, Curexa Clinic ERP, Banking"
      },
      {
        feature: "When to Recommend",
        staticSite: "'Client just needs an online visiting card.'",
        dynamicSite: "'Client wants to post regular blogs/news.'",
        ecommSite: "'Client wants customers to pay & buy online.'",
        customApp: "'Client wants to replace Excel & track staff.'"
      }
    ]
  },

  // 11. MODULE 2 — DEEP DIVE: STATIC WEBSITES
  {
    id: 11,
    type: "static-deep-dive",
    title: "Deep Dive: Static Websites",
    subtitle: "The Digital Visiting Card & Brochure (Speed, Simplicity & Rock-Bottom Cost)",
    meta: {
      category: "Module 2 • Web Development",
      module: "Static Deep Dive",
      duration: "4 min"
    },
    headline: "What Exactly is a Static Website?",
    definition: "A static website consists of pre-written HTML, CSS, and image files stored on a server. When a visitor requests the page, the server hands over the exact file without any complex calculations or database queries.",
    benefits: [
      {
        title: "Sub-Second Loading (<0.5s)",
        desc: "Because there is no database to query, pages load almost instantaneously on 4G/5G mobile phones, which Google rewards with higher SEO rankings.",
        icon: Zap
      },
      {
        title: "Virtually Unhackable",
        desc: "With no database or server-side scripts to exploit, there is zero risk of SQL injections or CMS plugin hacks that plague cheap WordPress sites.",
        icon: ShieldCheck
      },
      {
        title: "Near-Zero Hosting Cost",
        desc: "Can be hosted for as little as $0 to $5 per month on modern CDN networks (like Vercel, Cloudflare, or AWS S3) with zero maintenance.",
        icon: Wallet
      },
      {
        title: "Ideal Starting Point",
        desc: "Perfect for Chartered Accountants, corporate law firms, consulting agencies, and dental clinics who just need high credibility.",
        icon: CheckCircle2
      }
    ],
    clientPitch: "What to Tell the Client: 'If your business information changes only once or twice a year, don't pay for complicated database software. A custom static site delivers maximum speed, maximum security, and the lowest monthly running cost.'"
  },

  // 12. MODULE 2 — DEEP DIVE: DYNAMIC WEBSITES & CMS
  {
    id: 12,
    type: "dynamic-deep-dive",
    title: "Deep Dive: Dynamic Websites & CMS",
    subtitle: "The Living Digital Newspaper (Databases, Admin CMS & Self-Publishing)",
    meta: {
      category: "Module 2 • Web Development",
      module: "Dynamic Deep Dive",
      duration: "4 min"
    },
    headline: "What Makes a Website 'Dynamic'?",
    definition: "A dynamic website is powered by a live database. Instead of fixed text inside code, the page pulls text, images, and prices dynamically from a database when the user visits or searches.",
    keyCapabilities: [
      {
        title: "Admin Content Management (CMS)",
        desc: "The business owner or marketing team gets a simple login dashboard where they can write blogs, upload project photos, or post job openings in 2 minutes without knowing a single line of code.",
        icon: Layout
      },
      {
        title: "Search & Filtering Engines",
        desc: "Visitors can filter real estate properties by price and bedroom count, or search medical articles by category with instant live results.",
        icon: Search
      },
      {
        title: "User Interaction & Comments",
        desc: "Supports reader comments, inquiry forms, dynamic client reviews, and personalized content based on visitor location.",
        icon: MessageSquare
      },
      {
        title: "Automatic SEO Updates",
        desc: "Every time a new article or property is published, the website automatically creates Google sitemaps and social media preview tags.",
        icon: TrendingUp
      }
    ],
    clientPitch: "What to Tell the Client: 'If you want to publish weekly news, case studies, or listings yourself without paying a developer every time you change a sentence, a Dynamic Website with an Admin CMS is what you need.'"
  },

  // 13. MODULE 2 — DEEP DIVE: E-COMMERCE WEBSITES
  {
    id: 13,
    type: "ecomm-deep-dive",
    title: "Deep Dive: E-Commerce Websites",
    subtitle: "The 24/7 Digital Supermarket (Catalogs, Carts, Gateways & Logistics)",
    meta: {
      category: "Module 2 • Web Development",
      module: "E-Commerce Deep Dive",
      duration: "5 min"
    },
    definition: "An E-Commerce website is a specialized online retail system built specifically to sell physical or digital products, accept online payments, manage stock inventory, and coordinate delivery shipping 24/7.",
    anatomy: [
      {
        component: "1. The Product Catalog",
        desc: "High-resolution photo galleries, size/color variant pickers, customer ratings, customer reviews, and live stock availability badges.",
        icon: ShoppingCart
      },
      {
        component: "2. The Smart Shopping Cart",
        desc: "Remembers customer selections even if they close their phone browser. Triggers automated WhatsApp/Email reminders if they abandon cart.",
        icon: Zap
      },
      {
        component: "3. Payment Gateway Integration",
        desc: "Instant checkout via UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, Net Banking, EMI, and Cash on Delivery (COD) via Razorpay or Stripe.",
        icon: Wallet
      },
      {
        component: "4. Courier Shipping & Tracking",
        desc: "Automated API link with courier partners (Shiprocket, Bluedart, Delhivery) that prints dispatch labels and sends live tracking SMS/WhatsApp.",
        icon: Rocket
      }
    ],
    crystalAuraNote: "Devlomatix Advantage (CrystalAura): We give clients their own direct-to-consumer store with zero recurring platform commissions, unlike Shopify or Amazon that take cuts from every sale.",
    salesPitch: "What to Tell the Client: 'An e-commerce website is your digital cash register. It turns visitors from 100 different cities into paying customers while you sleep, automating orders, payments, and delivery slips.'"
  },

  // 14. MODULE 2 — DEEP DIVE: CUSTOM WEB APPLICATIONS
  {
    id: 14,
    type: "custom-portal-deep-dive",
    title: "Deep Dive: Custom Web Apps & Portals",
    subtitle: "The Operational Engine (Replacing Messy Excel Sheets & Paperwork)",
    meta: {
      category: "Module 2 • Web Development",
      module: "Custom Portals",
      duration: "5 min"
    },
    definition: "A Custom Web Application is interactive business software that runs inside a web browser. Unlike a marketing website designed for outside visitors, a web app is designed for staff, partners, and clients to run daily company operations.",
    features: [
      {
        title: "Secure Role-Based Logins",
        desc: "Different dashboards for different people: Field sales reps log daily calls; accountants generate tax invoices; the CEO monitors company profit graphs.",
        icon: Key
      },
      {
        title: "Replacing 10 Messy Spreadsheets",
        desc: "Eliminates duplicate data entry, conflicting file versions, lost phone numbers, and accidental row deletions that plague Excel-driven companies.",
        icon: FileSpreadsheet
      },
      {
        title: "Automated Calculations & Workflows",
        desc: "One-click quotation generation, automatic sales commission math, overdue invoice alerts, and automated client email updates.",
        icon: Calculator
      },
      {
        title: "Multi-Tenant Architecture",
        desc: "Can be licensed to multiple branches, franchise stores, or client organizations with complete data isolation and bank-grade security.",
        icon: Boxes
      }
    ],
    salesPitch: "What to Tell the Client: 'If your team spends 2 hours every day copying rows in Excel, checking WhatsApp messages for order updates, or chasing staff for status reports, a Custom Web Portal will save you 15+ hours of wasted payroll every week.'"
  },

  // 15. MODULE 2 — LANDING PAGES VS MULTI-PAGE WEBSITES
  {
    id: 15,
    type: "landing-vs-website",
    title: "Landing Pages vs. Multi-Page Websites",
    subtitle: "The 1-Page Lead Magnet vs. The Full Corporate Showroom",
    meta: {
      category: "Module 2 • Web Development",
      module: "Strategy & Conversion",
      duration: "4 min"
    },
    comparison: [
      {
        type: "1-Page High-Converting Landing Page",
        analogy: "The Laser-Focused Sales Pitch",
        purpose: "Built for advertising campaigns (Google Ads, Facebook/Instagram Ads). Has zero distractions, no navigation menus, and ONE single goal: capture phone number or book a call.",
        bestFor: "Real estate launches, webinar registrations, dental implants, single-service promotions.",
        conversionRate: "High conversion rate (5%–15% visitor-to-lead)",
        icon: Target
      },
      {
        type: "Multi-Page Corporate Website",
        analogy: "The Complete Corporate Headquarters",
        purpose: "Built for overall brand credibility, organic Google search SEO, and deep information (Home, About Us, 10 Service Pages, Case Studies, Careers, Contact).",
        bestFor: "Established companies, B2B enterprises, hospitals, manufacturers, schools.",
        conversionRate: "Broader conversion (1%–3%), but builds long-term authority",
        icon: Building2
      }
    ],
    goldenRule: "Sales Executive Rule: If the client is running paid ad campaigns for a specific offer, sell them a high-converting Landing Page. If they want organic Google discovery and brand trust, sell them a Multi-Page Corporate Website."
  },

  // 16. MODULE 2 — WHAT IS WEB DEVELOPMENT?
  {
    id: 16,
    type: "mod2-fullstack",
    title: "What is Web Development?",
    subtitle: "Frontend, Backend & Full-Stack Development (The Showroom & The Engine)",
    meta: {
      category: "Module 2 • Web Development",
      module: "Engineering Anatomy",
      duration: "4 min"
    },
    definition: "Web Development is the process of designing, coding, building, and maintaining websites and web software so they work fast, look great, and stay secure.",
    tiers: [
      {
        tier: "The Showroom (Frontend)",
        analogy: "What the customer sees & clicks",
        desc: "The colors, pictures, typography, buttons, and mobile-friendly layout. We ensure sub-second loading speed, intuitive menus, and zero visual clutter so visitors never bounce.",
        icon: Laptop
      },
      {
        tier: "The Engine Room (Backend)",
        analogy: "The machinery behind the walls",
        desc: "The hidden computer logic that checks passwords, calculates sales taxes, communicates with payment gateways, and sends automatic confirmation emails.",
        icon: Server
      },
      {
        tier: "Full-Stack Development (The Complete Car)",
        analogy: "Showroom and engine built together",
        desc: "Devlomatix builds both the showroom and the engine together. This guarantees that your buttons, databases, and payment systems fit together seamlessly without finger-pointing between multiple freelancers.",
        icon: Layers
      }
    ],
    pitchTip: "What to Say to the Client: 'If you hire one person to build the car body and another person to make the engine, they will blame each other when the car doesn't start. Devlomatix builds the complete car under one roof with a single point of responsibility.'"
  },

  // 17. MODULE 2 — WEB PERFORMANCE & SEO
  {
    id: 17,
    type: "web-performance-seo",
    title: "Web Performance, Speed & SEO",
    subtitle: "Why 1-Second Delays Cost 20% in Sales and How Google Ranks Websites",
    meta: {
      category: "Module 2 • Web Development",
      module: "Speed & Search Ranking",
      duration: "4 min"
    },
    stats: [
      { num: "53%", label: "of mobile visitors leave", desc: "if a website takes longer than 3 seconds to load on their phone." },
      { num: "-20%", label: "drop in sales conversion", desc: "for every 1-second delay in page loading speed (Amazon/Google study)." },
      { num: "#1", label: "factor in Google ranking", desc: "Google ranks fast, mobile-friendly websites ahead of slow, outdated sites." }
    ],
    pillars: [
      {
        title: "Mobile Responsiveness",
        desc: "Over 75% of internet traffic comes from smartphones. We build 'mobile-first' so text, images, and buttons automatically adapt to any screen size without pinch-zooming.",
        icon: Smartphone
      },
      {
        title: "Image & Code Optimization",
        desc: "We compress images into next-gen WebP formats and clean out messy unused code so your pages load in under 1 second even on 4G connections.",
        icon: Gauge
      },
      {
        title: "On-Page SEO Foundations",
        desc: "Proper title tags, meta descriptions, semantic headings (H1, H2), and Google schema markup so your business shows up when local buyers search on Google.",
        icon: Search
      }
    ],
    clientPitch: "What to Tell the Client: 'A pretty website that loads slowly is like a gorgeous store with a locked front door. Devlomatix builds lightning-fast websites that open instantly and get discovered on Google page 1.'"
  },

  // 18. MODULE 3 — WHAT IS A MOBILE APP?
  {
    id: 18,
    type: "what-is-app",
    title: "What is a Mobile App?",
    subtitle: "The Plain-English Definition & The 4 Superpowers That Websites Cannot Match",
    meta: {
      category: "Module 3 • Mobile Development",
      module: "Core Definition",
      duration: "4 min"
    },
    inOneSentence: {
      headline: "In One Simple Sentence:",
      definition: "A mobile application (app) is a software program downloaded and installed directly onto a smartphone from the Google Play Store or Apple App Store, living permanently on the phone's home screen as a one-tap icon."
    },
    pitch15Sec: {
      label: "The 15-Second Pitch for Any Client:",
      script: "A website is like walking down the street to visit a shop (typing an address in Chrome). A mobile app is like having your shop's VIP speed-dial icon installed directly on the customer's phone screen. With 1 tap of their thumb, they are inside."
    },
    keyDifferences: [
      {
        aspect: "1. Home Screen Real Estate",
        website: "User must open browser (Chrome/Safari) and type a long address.",
        mobileApp: "Lives permanently on the phone screen; opens in 1 second with a single thumb tap.",
        icon: Smartphone
      },
      {
        aspect: "2. Push Notifications",
        website: "Very limited; most users ignore or block website notifications.",
        mobileApp: "Sends free instant pop-up alerts on phone lock screens (90%+ open rates vs 15% email).",
        icon: Zap
      },
      {
        aspect: "3. Direct Hardware Access",
        website: "Restricted browser access to smartphone sensors.",
        mobileApp: "Full access to phone camera (barcode/photo scan), GPS (live tracking), and Fingerprint/FaceID.",
        icon: ShieldCheck
      },
      {
        aspect: "4. Works Offline",
        website: "Requires an active internet connection to load pages.",
        mobileApp: "Can store data locally and work smoothly in basements or flights with zero internet signal.",
        icon: Clock
      }
    ],
    goldenRule: "The Golden Sales Rule: A website is for discovering NEW customers on Google search. A mobile app is for RETAINING existing customers so they keep ordering every week."
  },

  // 19. MODULE 3 — WEBSITE VS. APP: WHEN DOES A CLIENT NEED AN APP?
  {
    id: 19,
    type: "when-need-app",
    title: "Website vs. Mobile App: The Decision Rule",
    subtitle: "How to Honestly Advise Clients on Whether They Truly Need an App",
    meta: {
      category: "Module 3 • Mobile Development",
      module: "Consultative Decision Rule",
      duration: "4 min"
    },
    thresholdRule: {
      headline: "The 3x Per Month Rule:",
      text: "If a customer interacts with your business only once or twice a year (like a wedding planner, divorce lawyer, or furniture store), they will NOT download an app — they will use a website. BUT if they interact 3+ times a month (ordering groceries, booking clinic appointments, checking order status, internal staff tracking), an app is 10x superior."
    },
    scenarios: [
      {
        client: "Client A: Premium CA Firm / Law Practice",
        recommendation: "Website Only (Static or Dynamic)",
        reason: "Clients visit once a year to file taxes or check contact info. An app download is unnecessary friction.",
        verdict: "Do NOT pitch an app; build a stunning website."
      },
      {
        client: "Client B: Multi-Doctor Polyclinic",
        recommendation: "Website + Patient Mobile App",
        reason: "Patients book appointments every month, view lab reports, and need WhatsApp prescription reminders.",
        verdict: "Pitch Curexa mobile app for patient retention."
      },
      {
        client: "Client C: Wholesale B2B Food Distributor",
        recommendation: "Staff & Retailer Mobile App",
        reason: "Restaurant owners place daily vegetable/meat re-orders every morning from their mobile phones.",
        verdict: "Pitch a custom ordering app to dominate the market."
      }
    ],
    salesIntegrity: "Sales Tip: Telling a client they don't need an expensive app builds instant trust. They will hire you for the website because they know you aren't trying to overcharge them!"
  },

  // 20. MODULE 3 — TYPES OF MOBILE APPS
  {
    id: 20,
    type: "types-of-apps",
    title: "How Many Types of Mobile Apps Are There?",
    subtitle: "Native Apps vs. Cross-Platform Apps (And Why Devlomatix Saves Clients 50%)",
    meta: {
      category: "Module 3 • Mobile Development",
      module: "App Frameworks",
      duration: "5 min"
    },
    appTypes: [
      {
        name: "1. Native Apps (Swift for iOS / Kotlin for Android)",
        approach: "Built twice with separate teams",
        problem: "Traditional agencies build one app for iPhone and an entirely separate app for Android. That means paying two development bills and waiting twice as long for updates.",
        verdict: "High Cost & Complexity (Outdated for most businesses)"
      },
      {
        name: "2. Cross-Platform Apps (React Native & Expo)",
        approach: "Devlomatix's Core Superpower",
        problem: "We write the app once on a unified modern engine. It launches smoothly on BOTH Apple iPhones and Android phones with genuine 60-frame-per-second native speed.",
        verdict: "Recommended Best ROI (Saves 50% on cost and launch time!)",
        highlight: true
      },
      {
        name: "3. Progressive Web Apps (PWA)",
        approach: "Website saved to phone screen",
        problem: "A website with an 'Add to Home Screen' shortcut. Good for tight budgets, but cannot be downloaded from the Google Play Store or Apple App Store.",
        verdict: "Budget Alternative for internal team tools"
      }
    ],
    pitchQuote: "What to Tell the Client: 'Why pay two separate development bills when Devlomatix builds on a unified engine, giving you both the Apple App Store and Google Play Store versions for one unified investment?'"
  },

  // 21. MODULE 3 — THE DEVLOMATIX MOBILE ADVANTAGE
  {
    id: 21,
    type: "mobile-advantage",
    title: "The Devlomatix Mobile Advantage",
    subtitle: "How Expo & React Native Deliver 60fps Native Performance at Half the Cost",
    meta: {
      category: "Module 3 • Mobile Development",
      module: "Our Engineering Edge",
      duration: "4 min"
    },
    pillars: [
      {
        title: "Single Unified Codebase",
        desc: "One team writes the application logic once in modern JavaScript/TypeScript. Every feature, bug fix, and design tweak applies to both iPhone and Android instantly.",
        icon: Code2
      },
      {
        title: "Genuine Native Speed (60 FPS)",
        desc: "Unlike clunky old hybrid webviews, React Native compiles into genuine native UI components. Scrolling is silky smooth and animations feel identical to Apple's own apps.",
        icon: Zap
      },
      {
        title: "Over-The-Air (OTA) Instant Updates",
        desc: "Small bug fixes and text updates can be delivered directly to user phones without waiting 48 hours for Apple or Google app store re-review.",
        icon: RefreshCw
      },
      {
        title: "50% Savings Passed to the Client",
        desc: "Clients get enterprise-quality iOS and Android apps for the price other agencies charge for a single platform.",
        icon: DollarSign
      }
    ],
    salesScript: "What to Say to the Client: 'Companies like Facebook, Instagram, Shopify, and Pinterest build on React Native. Devlomatix brings that exact same Fortune-500 mobile tech stack to your business at a price that fits your budget.'"
  },

  // 22. MODULE 3 — MOBILE TESTING & STORE PUBLISHING
  {
    id: 22,
    type: "app-publishing",
    title: "Mobile Testing & Store Publishing",
    subtitle: "From Design to Google Play Store & Apple App Store Approval",
    meta: {
      category: "Module 3 • Mobile Development",
      module: "Publishing & Launch",
      duration: "4 min"
    },
    steps: [
      {
        title: "1. Thumb-Friendly UI/UX",
        desc: "We design buttons, tabs, and menus so they sit naturally within reach of the user's thumb, making the app effortless to use with one hand.",
        icon: Smartphone
      },
      {
        title: "2. Testing on Real Physical Phones",
        desc: "We test the app across popular Samsung, Xiaomi, and Apple iPhones to guarantee it doesn't freeze, crash, or drain phone battery.",
        icon: CheckCircle2
      },
      {
        title: "3. App Store Approvals Handled",
        desc: "Apple and Google have hundreds of strict compliance and privacy rules. Devlomatix handles the entire submission, certificates, and approval process end-to-end.",
        icon: Award
      }
    ],
    salesValueProp: "What to Tell the Client: 'You don't need to learn Apple or Google developer guidelines. We take care of the entire account setup, testing, screenshots, and publishing so your customers can simply search your company name and hit Download.'"
  },

  // 23. MODULE 4 — WHAT IS AI IN BUSINESS?
  {
    id: 23,
    type: "what-is-ai",
    title: "What is Artificial Intelligence (AI)?",
    subtitle: "What AI Actually Does for a Business (Without the Sci-Fi Buzzwords)",
    meta: {
      category: "Module 4 • AI & Automation",
      module: "Core Definition",
      duration: "5 min"
    },
    headline: "The Plain-English Definition of AI:",
    quote: "'AI is not a talking robot. Think of it like a tireless digital assistant that can read, think, and write in seconds — working 24 hours a day without taking holidays, sick days, or making typos.'",
    aiTools: [
      {
        title: "1. 24/7 Smart Customer Replies",
        analogy: "Never lose a midnight customer",
        desc: "When a potential buyer messages your WhatsApp at 11:30 PM, the AI replies politely in 3 seconds, shares your catalog, and answers questions like a human staff member.",
        icon: MessageSquare
      },
      {
        title: "2. Instant Price Quotations",
        analogy: "From 2 hours to 5 seconds",
        desc: "Your sales rep types bullet points of what a client wants, and the AI instantly generates a formatted, itemized quotation ready to send to the client.",
        icon: Cpu
      },
      {
        title: "3. Private Company Helper",
        analogy: "Trained on your own business files",
        desc: "We train an AI on your company's own price lists, manuals, and FAQs. It answers customer questions with 100% accuracy and zero wrong information.",
        icon: Database
      },
      {
        title: "4. Spotting Hot Buyers",
        analogy: "Focusing on clients ready to pay",
        desc: "The AI reads incoming customer chats and alerts your sales team: 'This customer has a high budget and is ready to buy — call them right now!'",
        icon: TrendingUp
      }
    ]
  },

  // 24. MODULE 4 — AI CHATBOTS VS DUMB RULE-BASED BOTS
  {
    id: 24,
    type: "ai-chatbots-vs-rules",
    title: "AI Chatbots vs. Dumb Keyword Bots",
    subtitle: "Why Old Chatbots Frustrate Customers and How Modern AI Delivers Real Sales",
    meta: {
      category: "Module 4 • AI & Automation",
      module: "Chatbot Evolution",
      duration: "4 min"
    },
    comparison: [
      {
        type: "Old 'Dumb' Keyword Bot (2018 Era)",
        experience: "Rigid & Frustrating",
        howItWorks: "Only understands exact keywords like 'Press 1 for Sales, Press 2 for Billing'. If the customer types 'Hi, I need a dental checkup tomorrow morning', the bot says: 'Sorry, I did not understand that.'",
        customerReaction: "Customer gets annoyed and abandons the conversation.",
        icon: AlertCircle
      },
      {
        type: "Modern Devlomatix AI Chatbot (2026 Era)",
        experience: "Natural & Conversational",
        howItWorks: "Understands natural language, typos, voice notes, and mixed languages (Hinglish/Spanglish). Reads: 'Hi, I need a dental checkup tomorrow morning' → checks doctor's schedule → offers 10:30 AM slot in 2 seconds.",
        customerReaction: "Customer feels cared for and completes the booking immediately.",
        icon: Bot
      }
    ],
    businessValue: "Why Business Owners Love This: The AI handles 80% of repetitive questions (opening hours, price lists, locations) automatically, letting human staff focus 100% on high-ticket sales calls."
  },

  // 25. MODULE 4 — WHAT IS AUTOMATION & WORKFLOW ENGINES?
  {
    id: 25,
    type: "what-is-automation",
    title: "What is Automation & Workflow Engines?",
    subtitle: "Stopping the Boring Copy-Pasting that Wastes 15+ Hours Every Week",
    meta: {
      category: "Module 4 • AI & Automation",
      module: "Workflow Engines",
      duration: "5 min"
    },
    inOneSentence: {
      headline: "In One Simple Sentence:",
      definition: "Automation is setting up smart computer rules so that when Event A happens (like a customer submitting a form), the computer automatically executes Steps B, C, and D without any human having to copy-paste or click."
    },
    steps: [
      {
        step: "01",
        title: "Customer Fills Form",
        desc: "A customer visits your website or clicks your social media ad and leaves their phone number.",
        icon: Zap
      },
      {
        step: "02",
        title: "Instant WhatsApp Reply",
        desc: "Within 3 seconds, their phone buzzes with a personalized WhatsApp greeting and your PDF catalog.",
        icon: Send
      },
      {
        step: "03",
        title: "Automatic Meeting Booking",
        desc: "The customer picks a suitable time slot; a calendar invite and video call link are created automatically.",
        icon: Clock
      },
      {
        step: "04",
        title: "Zero Manual Typing",
        desc: "The customer's details and inquiry are saved directly into your customer list without anyone lifting a finger.",
        icon: CheckCircle2
      }
    ],
    pitchSnippet: "The Pitch to the Business Owner: 'Why pay employees to do repetitive copy-pasting all day? With our automated workflows, your leads get answered in 3 seconds before they buy from your competitors, and your staff can focus on closing deals.'"
  },

  // 26. MODULE 4 — INTELLIGENT AI AGENTS
  {
    id: 26,
    type: "ai-agents",
    title: "Intelligent AI Agents: The Autonomous Future",
    subtitle: "AI That Doesn't Just Chat — It Takes Action and Completes Tasks",
    meta: {
      category: "Module 4 • AI & Automation",
      module: "AI Agents",
      duration: "4 min"
    },
    definition: "An AI Agent is an autonomous program that can perceive a business goal, formulate a multi-step plan, use external software tools (browsers, databases, emails, WhatsApp), and execute the entire task independently.",
    agentExamples: [
      {
        role: "The Automated Sales Researcher Agent",
        task: "When a new lead signs up with a company email, the agent looks up the company on LinkedIn, checks their industry, estimates their company size, and writes a personalized dossier for the sales rep before the call.",
        icon: Search
      },
      {
        role: "The 24/7 Meeting Scheduling Agent",
        task: "Checks your Google/Outlook calendar, negotiates a mutually convenient time with the client via WhatsApp, creates the Zoom video link, and sends SMS reminder alerts 1 hour before.",
        icon: Clock
      },
      {
        role: "The Invoice & Chasing Agent",
        task: "Monitors unpaid invoices, sends friendly payment reminders on day 7, day 14, and day 21, and attaches instant UPI payment links to settle accounts.",
        icon: Wallet
      }
    ],
    salesPunchline: "What to Tell the Client: 'Traditional software just sits there waiting for you to click. Devlomatix AI Agents work actively in the background completing sales research, scheduling, and follow-ups automatically.'"
  },

  // 27. THE DEVLOMATIX PRODUCT SUITE
  {
    id: 27,
    type: "product-suite",
    title: "The Devlomatix Product Ecosystem",
    subtitle: "Pre-Built Enterprise Solutions That Let Us Deliver in Weeks Instead of Months",
    meta: {
      category: "Product Portfolio",
      module: "Our Ecosystem",
      duration: "5 min"
    },
    introTip: "When a client doesn't want to build from absolute scratch, we deploy our battle-tested modular foundations:",
    products: [
      {
        name: "DevX CRM",
        tag: "Sales & Client Management",
        pitch: "Complete lead tracking, visual deal stages, daily call records (DCR), and 1-click quotation generator with PDF export.",
        whoBuys: "Any business with 2+ sales reps losing track of customer follow-ups."
      },
      {
        name: "KonnectX",
        tag: "WhatsApp Marketing & Bots",
        pitch: "Enterprise WhatsApp platform for bulk broadcast messages, automated chatbot flows, and a shared team inbox.",
        whoBuys: "Retailers, coaching institutes, clinics, and service agencies wanting WhatsApp automation."
      },
      {
        name: "CrystalAura",
        tag: "Digital Commerce Engine",
        pitch: "Full online store platform with product catalogs, shopping cart, discount coupons, and payment gateway webhooks.",
        whoBuys: "Brands wanting their own online store without Shopify's recurring revenue cuts."
      },
      {
        name: "Curexa",
        tag: "Healthcare Clinic System",
        pitch: "Hospital and clinic management covering OPD queues, digital prescriptions, and WhatsApp patient reminders.",
        whoBuys: "Doctors, polyclinics, and diagnostic centers needing organized patient records."
      },
      {
        name: "FlowByte",
        tag: "Visual Automation Canvas",
        pitch: "Drag-and-drop workflow builder that connects any software, webhooks, and communication channels without coding.",
        whoBuys: "Enterprises needing custom logic without paying for expensive Zapier tiers."
      },
      {
        name: "HireFlow",
        tag: "Recruitment & ATS",
        pitch: "Job candidate pipeline with resume screening, candidate rating scorecards, and automated interview scheduling.",
        whoBuys: "Growing companies tired of sorting through hundreds of unorganized email resumes."
      }
    ]
  },

  // 28. THE BUSINESS MATH & REAL ROI
  {
    id: 28,
    type: "roi-math",
    title: "The Business Math: Why Software Pays for Itself",
    subtitle: "How to Show Clients That Good Software is an Investment, Not an Expense",
    meta: {
      category: "Sales Psychology",
      module: "Value & ROI",
      duration: "4 min"
    },
    introTip: "When a business owner says: 'Software is expensive', show them the money they are currently losing every single month without it:",
    calculations: [
      {
        title: "1. The Cost of Lost Inquiries",
        math: "100 website leads/month × 30% lost due to slow response = 30 lost customers.",
        insight: "If your average deal is $200, losing 30 customers means you are burning $6,000 every single month in missed revenue. Devlomatix's 3-second WhatsApp bot pays for itself in week one!"
      },
      {
        title: "2. The Cost of Manual Office Labor",
        math: "2 office employees spending 3 hours daily on manual data entry = 150 hours/month.",
        insight: "You are paying thousands of dollars every month for employees to copy-paste phone numbers between WhatsApp and Excel. Automating this frees your staff to focus 100% on sales."
      },
      {
        title: "3. The Cost of Human Follow-up Failure",
        math: "65% of sales leads buy from the vendor that follows up first and most consistently.",
        insight: "Sales reps forget to follow up when they get busy. DevX CRM automatically triggers follow-up reminders so no deal ever slips through the cracks."
      }
    ],
    closingQuote: "Golden Pitch: 'You are already paying for custom software every month — through lost leads and wasted payroll hours. The only difference is that with Devlomatix, you get permanent assets that multiply your profits.'"
  },

  // 29. MODULE 5 — THE 5-MINUTE DISCOVERY CALL
  {
    id: 29,
    type: "mod5-discovery",
    title: "Module 5 — The 5-Minute Discovery Call",
    subtitle: "How to Ask the Right Questions & Recommend the Perfect Solution",
    meta: {
      category: "Module 5 • Client Solutions",
      module: "Discovery Calls",
      duration: "5 min"
    },
    goldenRule: "The Golden Rule: Never start by talking about software features or code. Act like a good doctor — ask about where their business hurts first!",
    discoveryQuestions: [
      {
        q: "'Where is your team losing the most time or money in your daily business operations right now?'",
        why: "Finds their real pain point (manual data entry, missed inquiries, slow quote turnaround)."
      },
      {
        q: "'When a new customer reaches out to your business today, how quickly do they get a reply?'",
        why: "Reveals whether leads are sitting unattended for hours while competitors steal them."
      },
      {
        q: "'Are your staff or customers asking to manage things from their mobile phones while on the go?'",
        why: "Immediately tells you if they need a mobile app alongside a website."
      },
      {
        q: "'If we solve this for you in the next 30 days, what does success look like for your business?'",
        why: "Confirms their timeline, budget readiness, and who the real decision-maker is."
      }
    ],
    solutionCheatSheet: [
      { clientNeed: "They want brand credibility and phone calls", recommend: "Showcase Landing Page + Google SEO + Click-to-WhatsApp" },
      { clientNeed: "They want to sell products online across cities", recommend: "Online E-Commerce Store + UPI / Card Payment Gateway" },
      { clientNeed: "Their sales reps lose customer follow-ups", recommend: "DevX CRM + 1-Click Quotation Generator" },
      { clientNeed: "They spend hours answering repetitive inquiries", recommend: "KonnectX WhatsApp Bot + 24/7 Automated Replies" }
    ]
  },

  // 30. MODULE 5 — SOLUTION MAPPING BY INDUSTRY
  {
    id: 30,
    type: "mod5-industry",
    title: "Module 5 — Solution Mapping by Industry",
    subtitle: "What to Pitch to Doctors, Retailers, Wholesalers & Real Estate Brokers",
    meta: {
      category: "Module 5 • Client Solutions",
      module: "Industry Playbooks",
      duration: "4 min"
    },
    industries: [
      {
        industry: "1. Healthcare & Clinics",
        pain: "Crowded waiting rooms, lost paper prescriptions, staff overwhelmed by phone appointments.",
        pitch: "Pitch Curexa: Digital OPD queues, instant WhatsApp prescription delivery, and automated appointment reminders.",
        icon: HeartPulse
      },
      {
        industry: "2. Retail & D2C Brands",
        pain: "Foot traffic is slow in single shop; competitors are selling across India via Instagram.",
        pitch: "Pitch CrystalAura: Clean mobile-friendly online store with WhatsApp catalog sharing and UPI payments.",
        icon: Wallet
      },
      {
        industry: "3. B2B Wholesalers & Traders",
        pain: "Taking 24-48 hours to make price quotes in Excel; losing deals to faster competitors.",
        pitch: "Pitch DevX CRM: 1-click quotation generator that exports branded PDFs to client WhatsApp in 60 seconds.",
        icon: Building2
      },
      {
        industry: "4. Real Estate & Brokers",
        pain: "Hundreds of leads from property portals sitting cold in spreadsheets; agents forgetting follow-ups.",
        pitch: "Pitch DevX CRM + WhatsApp Bot: Instant greeting within 3 seconds + automated site-visit booking.",
        icon: Compass
      }
    ]
  },

  // 31. MODULE 5 — PRICING PACKAGES & PROPOSALS
  {
    id: 31,
    type: "mod5-packages",
    title: "Module 5 — Pricing Packages & Proposals",
    subtitle: "How to Recommend Packages That Match Client Budgets",
    meta: {
      category: "Module 5 • Client Solutions",
      module: "Packaging Tiers",
      duration: "4 min"
    },
    packages: [
      {
        name: "Starter Growth",
        target: "Startups, Clinics & Local Businesses",
        tag: "Speed & Credibility",
        features: [
          "High-converting modern responsive website",
          "Direct WhatsApp lead capture button",
          "SEO optimization for Google search ranking",
          "Contact form connected to email/SMS alerts",
          "Fast 2-week delivery"
        ],
        idealDeal: "Perfect entry point for first-time digital clients."
      },
      {
        name: "Business Scale",
        target: "Established SMEs & Growing Brands",
        tag: "Most Popular",
        popular: true,
        features: [
          "Custom Web Portal or Online E-Commerce Store",
          "Cross-Platform Mobile App (iOS & Android)",
          "WhatsApp bot automations with instant replies",
          "DevX CRM integration for sales pipeline",
          "Automated PDF quotation & invoicing"
        ],
        idealDeal: "High ROI tier that solves end-to-end operations."
      },
      {
        name: "Enterprise Custom",
        target: "Corporations, Multi-Location & High Volume",
        tag: "Complete Ecosystem",
        features: [
          "Complete fullstack software ecosystem",
          "Custom AI assistants & private document search",
          "Visual drag-and-drop workflow automations",
          "Dedicated staging, production & SLA support",
          "Full custom database & multi-role permissions"
        ],
        idealDeal: "Turnkey enterprise transformation for high-growth operations."
      }
    ]
  },

  // 32. MODULE 5 — HANDLING TOUGH CLIENT OBJECTIONS
  {
    id: 32,
    type: "mod5-proposals",
    title: "Module 5 — Handling Tough Client Objections",
    subtitle: "The Exact Word-for-Word Answers to Win Hesitant Clients",
    meta: {
      category: "Module 5 • Client Solutions",
      module: "Objection Battlecards",
      duration: "5 min"
    },
    objections: [
      {
        obj: "'A freelancer told me they will build it for very cheap.'",
        rebuttal: "A freelancer can build a basic design, but when you need security, mobile optimization, or quick bug fixes next month, freelancers often disappear. Devlomatix is a registered software agency with a full team, guaranteed delivery, and 100% source code ownership."
      },
      {
        obj: "'Why shouldn't I just use ready-made software like HubSpot or Shopify?'",
        rebuttal: "Ready-made tools charge heavy monthly fees per user and take cuts from every transaction. They also force your staff into their rigid rules. Devlomatix builds software tailored 100% around your exact business process with zero recurring per-user fees."
      },
      {
        obj: "'How soon can I see it working in real life?'",
        rebuttal: "Because we have battle-tested foundations (DevX CRM, KonnectX, CrystalAura), we show you a working clickable prototype in 10 to 14 days and launch your full system live in 2 to 4 weeks."
      }
    ],
    demoTip: {
      title: "The Winning 20-Minute Live Demo Tip:",
      text: "Don't lecture the client with slides. Open your phone, submit a dummy form on their test page, and let them see their WhatsApp buzz with an automated reply in 2 seconds live on the call. Clients love seeing it happen right in front of their eyes!"
    }
  },

  // 33. MODULE 6 — REAL CLIENT SUCCESS STORIES
  {
    id: 33,
    type: "mod6-case-studies",
    title: "Module 6 — Real Client Success Stories",
    subtitle: "3 Real-World Stories You Can Share with Clients on Calls",
    meta: {
      category: "Module 6 • Practical Assessment",
      module: "Case Studies",
      duration: "5 min"
    },
    cases: [
      {
        client: "Story 1: The Multi-Doctor Healthcare Clinic",
        problem: "Waiting rooms were chaotic, receptionists were overwhelmed by phone calls, and paper prescription files were constantly getting lost.",
        solution: "Installed Curexa clinic software with digital prescriptions and automatic WhatsApp appointment reminders.",
        result: "Waiting room time dropped by 60%; missed appointments fell from 28% to under 5%."
      },
      {
        client: "Story 2: The Clothing Shop Owner",
        problem: "Had only one physical retail shop. When foot traffic slowed, sales plummeted. Had zero online presence.",
        solution: "Launched an online store (CrystalAura) with product catalogs and instant WhatsApp order placement.",
        result: "Now receives orders from 15+ cities every day; sales jumped by 42% in the first 60 days."
      },
      {
        client: "Story 3: The Wholesale Industrial Trader",
        problem: "Sales reps took 24 to 48 hours to create price quotes in Excel. Leads got tired of waiting and bought from competitors.",
        solution: "Implemented DevX CRM with a 1-click quotation generator sent directly to client WhatsApp.",
        result: "Quote turnaround dropped from 48 hours to 3 minutes; sales closing rate doubled."
      }
    ]
  },

  // 34. MODULE 6 — SALES ROLE-PLAY DRILLS
  {
    id: 34,
    type: "mod6-roleplay",
    title: "Module 6 — Sales Role-Play Practice",
    subtitle: "Practice These 3 Client Conversations with Your Team to Build Confidence",
    meta: {
      category: "Module 6 • Practical Assessment",
      module: "Role-Play Drills",
      duration: "5 min"
    },
    roleplays: [
      {
        title: "Drill 1: The Traditional Business Owner",
        persona: "Skeptical 55-year-old shop owner: 'We have done business on paper and phone calls for 25 years. Why do we need software?'",
        yourGoal: "Explain that software doesn't replace their relationship style — it just stops them from losing phone numbers and forgetting follow-ups when they get busy."
      },
      {
        title: "Drill 2: The DIY Website Believer",
        persona: "Cost-sensitive startup founder: 'Can't my intern just set up a cheap template website over the weekend?'",
        yourGoal: "Explain the hidden cost of amateur templates: slow loading on phones, broken payment gateways, zero Google SEO, and security vulnerabilities."
      },
      {
        title: "Drill 3: The 30-Second Elevator Pitch",
        persona: "A busy CEO at a business meetup asks: 'So, what does Devlomatix actually do in simple words?'",
        yourGoal: "Deliver the 30-second pitch smoothly: 'We build custom websites, mobile apps, and automated WhatsApp systems that help businesses win more customers and run on autopilot.'"
      }
    ]
  },

  // 35. MODULE 6 — COMMON CLIENT TRAPS
  {
    id: 35,
    type: "mod6-client-traps",
    title: "Module 6 — The 4 Traps Clients Fall Into",
    subtitle: "How to Position Devlomatix by Warning Clients About Costly Industry Mistakes",
    meta: {
      category: "Module 6 • Practical Assessment",
      module: "Client Traps",
      duration: "4 min"
    },
    traps: [
      {
        trap: "Trap 1: The Cheap Template Trap",
        desc: "Buying a $30 WordPress theme that looks nice in a preview, but loads like glue on real phones, has conflicting plugins, and gets hacked within 3 months.",
        ourPitch: "Devlomatix builds clean custom code with zero plugin bloat, sub-second speed, and bank-grade security."
      },
      {
        trap: "Trap 2: The Disappearing Freelancer Trap",
        desc: "Hiring an unvetted freelancer who takes a 50% advance, delivers half a project, and then stops answering phone calls when bugs appear.",
        ourPitch: "Devlomatix is an established corporate software studio with registered contracts, dedicated engineers, and guaranteed delivery."
      },
      {
        trap: "Trap 3: The 5-Subscription SaaS Trap",
        desc: "Paying monthly fees for 5 separate tools (CRM, WhatsApp tool, Invoicing, Forms, Email) that don't talk to each other and require manual copy-pasting.",
        ourPitch: "Devlomatix unifies your entire business into one connected dashboard where leads, chats, and invoices sync automatically."
      },
      {
        trap: "Trap 4: Building an App Too Early",
        desc: "Spending tens of thousands on a complex mobile app before even testing if customers want the service on a simple landing page.",
        ourPitch: "We guide clients to start with a fast 2-week MVP to test the market before building heavy mobile infrastructure."
      }
    ]
  },

  // 36. THE SUMMARY CHEAT SHEET (THE 1-PAGE QUICK REFERENCE)
  {
    id: 36,
    type: "cheat-sheet",
    title: "The Ultimate Plain-English Cheat Sheet",
    subtitle: "Every Concept Defined in Exactly One Sentence for Quick Recall",
    meta: {
      category: "Quick Reference",
      module: "Summary Table",
      duration: "3 min"
    },
    definitions: [
      { term: "Website", meaning: "A collection of digital pages under your company name open 24/7 on the internet." },
      { term: "Static Website", meaning: "A digital brochure where content is fixed and stays identical for every visitor." },
      { term: "Dynamic Website", meaning: "A living site connected to a database that updates content, searches, and blogs in real-time." },
      { term: "E-Commerce Website", meaning: "An online store with a shopping cart, payment gateway, and delivery tracking." },
      { term: "Custom Web App", meaning: "Tailor-made software running in the browser with password login that replaces Excel." },
      { term: "Mobile App", meaning: "An application installed on a phone with its own screen icon, push alerts, and offline access." },
      { term: "Cross-Platform", meaning: "Building one app that launches on both Apple iPhone and Android, saving 50% on cost." },
      { term: "AI Assistant", meaning: "A smart digital helper that answers WhatsApp leads at midnight and creates quotes in 5 seconds." },
      { term: "Automation", meaning: "Setting rules so that when a lead arrives, WhatsApp, CRM, and emails update in 3 seconds automatically." }
    ]
  },

  // 37. CAN YOU ANSWER THESE 8 GOLDEN QUESTIONS? (VERBAL REHEARSAL)
  {
    id: 37,
    type: "golden-questions",
    title: "Can You Answer These 8 Questions Right Now?",
    subtitle: "The Verbal Sales Mastery Test: Practice Saying These Out Loud with 100% Confidence",
    meta: {
      category: "Module 6 • Verbal Mastery",
      module: "Self-Check Drill",
      duration: "5 min"
    },
    instructions: "Before speaking to a client or team member, make sure you can answer each of these 8 questions without hesitation:",
    questions: [
      {
        num: "01",
        q: "What is a Website?",
        clientAsks: "Client asks: 'Why should I pay for a website when I already have an Instagram page?'",
        whatYouSay: "A website is your permanent 24/7 digital office on Google that you own 100%. Social media algorithms hide your posts, but your website lets anyone find you on Google search, view your full credentials, and contact you directly without competing ads.",
        rule: "Core Rule: Website = Your permanent digital property on the internet."
      },
      {
        num: "02",
        q: "How many types of websites are there?",
        clientAsks: "Client asks: 'What type of website does my business actually need?'",
        whatYouSay: "There are 4 main types: 1. Static (fixed brochure), 2. Dynamic (database-driven with blogs/search), 3. E-Commerce (online shop with cart & UPI payment), and 4. Custom Web App (browser software with logins that replaces Excel).",
        rule: "Core Rule: Static (brochure), Dynamic (blog/portal), E-Comm (store), Custom (software)."
      },
      {
        num: "03",
        q: "What is the difference between Static and Dynamic?",
        clientAsks: "Client asks: 'Why is a Dynamic website more expensive than Static?'",
        whatYouSay: "A Static site is fixed like a printed flyer — you need a developer to change text. A Dynamic site has a live database and an easy Admin CMS, so you can log in and publish new blogs, property listings, or news yourself in 2 minutes.",
        rule: "Core Rule: Static = fixed code. Dynamic = database + self-editable Admin CMS."
      },
      {
        num: "04",
        q: "What is a Mobile App & how does it differ from a website?",
        clientAsks: "Client asks: 'My website already opens on phones. Why do I need a Mobile App?'",
        whatYouSay: "A website is for finding NEW customers on Google. A mobile app lives directly on the customer's phone screen, sends free push notifications to their lock screen with 90%+ open rates, and accesses the camera and GPS to keep existing customers ordering every week.",
        rule: "Core Rule: Website = Customer Discovery. Mobile App = Customer Loyalty & Retention."
      },
      {
        num: "05",
        q: "When does a client actually need a mobile app?",
        clientAsks: "Client asks: 'Should I spend money on a mobile app right now?'",
        whatYouSay: "If your customers only contact you once or twice a year, a fast website is sufficient. But if they place orders, book appointments, or check reports 3+ times a month, a mobile app gives them instant 1-tap thumb access and drives repeat loyalty.",
        rule: "Core Rule: The 3x/month frequency threshold defines app necessity."
      },
      {
        num: "06",
        q: "Why choose Devlomatix Cross-Platform Mobile Apps?",
        clientAsks: "Client asks: 'Another agency quoted me double for iOS and Android apps. Why?'",
        whatYouSay: "Traditional agencies build two separate apps from scratch in Swift and Kotlin, charging you two bills. Devlomatix builds on React Native & Expo — one unified codebase that launches on both Apple App Store and Google Play Store at 60fps native speed for half the cost.",
        rule: "Core Rule: 1 Codebase = iOS + Android = Saves 50% on cost and maintenance."
      },
      {
        num: "07",
        q: "What do AI and Automation actually do for a business?",
        clientAsks: "Client asks: 'Is AI just a gimmick or does it help my business make money?'",
        whatYouSay: "AI answers customer WhatsApp inquiries in 3 seconds at 11 PM and generates itemized price quotes in 5 seconds. Automation stops manual copy-pasting by instantly sending your PDF catalog and booking meetings before your competitors even open their email.",
        rule: "Core Rule: AI & Automation eliminate manual data entry and capture leads in 3 seconds."
      },
      {
        num: "08",
        q: "Why choose Devlomatix over a cheap freelancer or DIY builder?",
        clientAsks: "Client asks: 'Can't I just build this on Wix or hire someone on Fiverr?'",
        whatYouSay: "DIY tools charge ongoing subscription fees and lock you into rigid templates that fail on phones. Freelancers frequently disappear after advance payment. Devlomatix is a registered software company with dedicated engineers, 100% source code ownership, and guaranteed launch milestones.",
        rule: "Core Rule: Devlomatix provides enterprise accountability, speed & complete code ownership."
      }
    ]
  },

  // 38. MODULE 6 — INTERACTIVE KNOWLEDGE QUIZ
  {
    id: 38,
    type: "mod6-quiz",
    title: "Module 6 — Final Knowledge Evaluation",
    subtitle: "Test Yourself: Are You Ready for Live Client Consultations?",
    meta: {
      category: "Module 6 • Final Evaluation",
      module: "Knowledge Quiz",
      duration: "4 min"
    },
    quizzes: [
      {
        q: "1. A client asks: 'What is the main difference between a Static and Dynamic website?' What do you say?",
        options: [
          "A) Static is for playing music; Dynamic is for playing videos.",
          "B) A Static website has fixed content like a printed brochure; a Dynamic website connects to a database and updates content, search results, and blogs in real-time.",
          "C) A Static website only opens on laptops."
        ],
        correct: 1,
        explanation: "Correct! Static is fixed like a flyer; Dynamic is powered by a live database and editable via an Admin CMS."
      },
      {
        q: "2. Why should a business owner choose Devlomatix's cross-platform mobile apps over native apps?",
        options: [
          "A) Because cross-platform apps only work on older Android phones.",
          "B) Because one unified codebase launches on both Apple App Store and Google Play Store, delivering 60fps native speed at half the development cost.",
          "C) Because cross-platform apps don't require an internet connection."
        ],
        correct: 1,
        explanation: "Correct! Cross-platform eliminates paying two separate bills for iOS and Android."
      },
      {
        q: "3. What is the fundamental difference between a Website and a Mobile App?",
        options: [
          "A) A website requires a smartphone; a mobile app only runs on desktop computers.",
          "B) A website is for discovering new customers on Google search; a mobile app lives on their home screen with push alerts to retain existing customers.",
          "C) There is no difference between a website and a mobile app."
        ],
        correct: 1,
        explanation: "Correct! Website = Discovery on Google. Mobile App = Retention, Push alerts & 1-tap thumb access."
      },
      {
        q: "4. What is the single biggest reason business owners love WhatsApp automation?",
        options: [
          "A) It replaces all human staff permanently.",
          "B) It replies to incoming customer inquiries in 3 seconds with brochures and booking links before the lead buys from a competitor.",
          "C) It gives them an excuse to look at their phone all day."
        ],
        correct: 1,
        explanation: "Correct! Speed to lead is the #1 reason businesses win deals in the digital era."
      }
    ]
  },

  // 39. FINAL GRADUATION & CALL TO ACTION
  {
    id: 39,
    type: "closing",
    title: "Congratulations! You Are Ready.",
    subtitle: "You Now Have the Knowledge to Explain Technology & Win Client Trust",
    meta: {
      category: "Certification & Action",
      module: "Final Milestone",
      duration: "1 min"
    },
    cta: "Practice Pitch / Book Live Consultation",
    guarantees: [
      { label: "Module 1-3 Mastered", desc: "Foundations, The 4 Website Types & Mobile Apps (In Plain English)" },
      { label: "Module 4-5 Mastered", desc: "AI, Automations & Winning Discovery Calls" },
      { label: "Module 6 Certified", desc: "8 Verbal Questions, Real Stories, Traps & Final Quiz" }
    ]
  }
];
