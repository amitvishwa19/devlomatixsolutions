import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Users, BarChart3, Briefcase, ArrowRight, CheckCircle, Zap, Shield, Globe,
  MousePointerClick, Clock, Star, MessageSquare, FileText, Mail,
  Layers, Target, TrendingUp, Award, Headphones, Play, X, Check,
  Sparkles, Rocket, Heart, Coffee, Code, Linkedin, Twitter, Github
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useScrollReveal } from "@/ATS/hooks/useScrollReveal";
import { useState, useEffect, useRef } from "react";

const features = [
  { icon: Users, title: "Candidate Management", desc: "Track every applicant through your hiring pipeline with ease. Store resumes, notes, and scorecards in one place." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Get insights on your hiring funnel, time-to-hire, source effectiveness, and team performance." },
  { icon: Briefcase, title: "Job Board Integration", desc: "Post to LinkedIn, Naukri, Glassdoor, and 50+ job boards with a single click." },
  { icon: Zap, title: "Automated Workflows", desc: "Automate screening, rejection emails, interview scheduling, and stage transitions." },
  { icon: Shield, title: "Compliance Ready", desc: "Built-in EEOC, GDPR, and data privacy compliance with audit trails." },
  { icon: Globe, title: "Collaborative Hiring", desc: "Team scorecards, shared notes, @mentions, and structured interview kits." },
  { icon: MousePointerClick, title: "Drag & Drop Pipeline", desc: "Visual Kanban board lets you move candidates between stages with a simple drag." },
  { icon: Mail, title: "Email Templates", desc: "Pre-built email templates for every stage — from application received to offer letter." },
  { icon: Target, title: "AI Candidate Matching", desc: "Let AI rank and match candidates to your open roles based on skills and experience." },
];

const stats = [
  { value: 10000, suffix: "+", label: "Companies Trust Us" },
  { value: 2, suffix: "M+", label: "Candidates Processed" },
  { value: 40, suffix: "%", label: "Faster Time-to-Hire" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
];

const howItWorks = [
  { step: "01", icon: FileText, title: "Create a Job Posting", desc: "Define your role, requirements, and publish to multiple job boards instantly." },
  { step: "02", icon: Users, title: "Collect Applications", desc: "Candidates apply through your branded career page or job boards. All data flows in automatically." },
  { step: "03", icon: Layers, title: "Screen & Evaluate", desc: "Use AI scoring, custom scorecards, and collaborative reviews to shortlist the best talent." },
  { step: "04", icon: Award, title: "Hire the Best", desc: "Send offers, track acceptances, and onboard new hires — all from one dashboard." },
];

const testimonials = [
  { name: "Ananya Gupta", role: "VP of People, TechCorp India", avatar: "AG", quote: "HireFlow cut our time-to-hire by 45%. The pipeline view alone saved our recruiters hours every week.", rating: 5 },
  { name: "Vikram Malhotra", role: "Head of Talent, ScaleUp", avatar: "VM", quote: "We went from spreadsheets to a fully automated hiring pipeline in one afternoon. The team collaboration features are incredible.", rating: 5 },
  { name: "Kavita Patel", role: "HR Director, GlobalFin", avatar: "KP", quote: "The compliance features give us peace of mind. GDPR, EEOC — it's all built in. No more worrying about audits.", rating: 5 },
  { name: "James Wright", role: "Founder, StartupLab", avatar: "JW", quote: "As a small team, we needed something simple yet powerful. HireFlow is exactly that — intuitive and feature-rich.", rating: 5 },
];

const integrations = [
  { name: "LinkedIn", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>) },
  { name: "Naukri", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M11.566 21.5629v-8.148c0-.6893.0776-.9564.2329-1.5505.3106-1.1458 1.0894-2.1022 2.0234-2.7187.4659-.3105.9788-.543 1.5282-.6893.4882-.1329 1.0447-.1776 1.8235-.1776V5c-1.4059.0447-2.6517.3776-3.7199 1.0447-1.0671.6446-1.9117 1.5729-2.5117 2.7187v-3.54H8v16.34h3.566zM15.174 4.7c1.2894 0 2.3353-1.0682 2.3353-2.3576C17.5093 1.0459 16.4634 0 15.174 0c-1.2894 0-2.3341 1.0459-2.3341 2.3424 0 1.2894 1.0447 2.3576 2.3341 2.3576z"/></svg>) },
  { name: "Glassdoor", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M17.144 20.572H6.857A3.429 3.429 0 0 1 3.43 17.144V10.29h13.714a3.429 3.429 0 0 1 3.429 3.428v6.854zm0-20.572H6.857v6.857H20.57V3.43A3.429 3.429 0 0 0 17.144 0z"/></svg>) },
  { name: "Google Calendar", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H5.684v5.684h12.632zM0 18.316h5.684V5.684H0v12.632zM5.684 24H0v-5.684h5.684V24zm12.632 0H24v-5.684h-5.684V24zM0 0v5.684h5.684V0H0zm18.316 0v5.684H24V0h-5.684z"/></svg>) },
  { name: "Slack", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>) },
  { name: "Microsoft Teams", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M20.625 8.25h-1.5a2.247 2.247 0 0 0 .375 1.245V14.1a3.6 3.6 0 0 1-3.6 3.6h-3.27a4.47 4.47 0 0 0 1.62 1.95 4.47 4.47 0 0 0 2.49.75 4.5 4.5 0 0 0 4.5-4.5V8.865a.615.615 0 0 0-.615-.615zM21.75 7.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75zM13.5 6a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5zM16.125 7.5H10.5a.75.75 0 0 0-.75.75v6a3.75 3.75 0 0 0 7.125 1.613A3.75 3.75 0 0 0 16.875 14.25V8.25a.75.75 0 0 0-.75-.75zM8.25 9H3.375A1.125 1.125 0 0 0 2.25 10.125v3.75A1.125 1.125 0 0 0 3.375 15h1.5v2.625a1.875 1.875 0 0 0 3.75 0V10.125A1.125 1.125 0 0 0 7.5 9h.75z"/></svg>) },
  { name: "Zoom", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-6.263-1.2l-3.135 2.237V10.8a1.2 1.2 0 0 0-1.2-1.2H6.6a1.2 1.2 0 0 0-1.2 1.2v4.8a1.2 1.2 0 0 0 1.2 1.2h6.802a1.2 1.2 0 0 0 1.2-1.2v-2.237l3.135 2.237V10.8z"/></svg>) },
  { name: "Gmail", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>) },
  { name: "Outlook", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 0 1-.587.236h-8.175V9.879l1.6 1.076 1-.725V8.346l-2.6 1.78-1-1.025V7.387h10z M0 3.449l9 1.56v14.041L0 20.551V3.449zm4.5 10.2c.597 0 1.089-.234 1.476-.703.387-.469.58-1.07.58-1.803 0-.764-.188-1.37-.563-1.818-.375-.448-.872-.672-1.493-.672-.616 0-1.11.227-1.483.683-.372.456-.558 1.065-.558 1.828 0 .739.183 1.331.55 1.776.366.446.867.669 1.491.709z"/></svg>) },
  { name: "GitHub", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>) },
  { name: "Workday", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/></svg>) },
  { name: "BambooHR", icon: (<svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d="M12 0C8 0 6 4 6 8c0 2 .5 3.5 1.5 5C5 14 3 16 3 19c0 2.5 2 5 5 5h8c3 0 5-2.5 5-5 0-3-2-5-4.5-6 1-1.5 1.5-3 1.5-5 0-4-2-8-6-8zm0 2c2.5 0 4 3 4 6s-1.5 5-4 5-4-2-4-5 1.5-6 4-6z"/></svg>) },
];

const faqs = [
  { q: "How long does it take to set up?", a: "Most teams are up and running in under 15 minutes. Import your existing candidates via CSV or connect your email to start collecting applications immediately." },
  { q: "Can I customize the hiring pipeline?", a: "Absolutely! Create custom stages, add scoring criteria, and design workflows that match your unique hiring process." },
  { q: "Is my data secure?", a: "Yes. We use enterprise-grade encryption, SOC 2 compliance, and your data is hosted on secure cloud infrastructure with 99.99% uptime." },
  { q: "Do you offer a free plan?", a: "Yes! Our Starter plan is free forever for small teams with up to 5 active job postings and 50 candidates per month." },
  { q: "Can I integrate with my existing tools?", a: "HireFlow integrates with 50+ tools including Slack, Google Calendar, Zoom, LinkedIn, and all major job boards." },
  { q: "What kind of support do you offer?", a: "All plans include email support. Pro plans get priority chat support, and Enterprise customers get a dedicated success manager." },
];

const comparisonFeatures = [
  { feature: "AI Resume Screening", hireflow: true, competitor1: false, competitor2: true },
  { feature: "Drag & Drop Pipeline", hireflow: true, competitor1: true, competitor2: false },
  { feature: "Custom Scorecards", hireflow: true, competitor1: false, competitor2: false },
  { feature: "Bulk Actions", hireflow: true, competitor1: true, competitor2: true },
  { feature: "Collaborative Notes", hireflow: true, competitor1: false, competitor2: true },
  { feature: "Advanced Analytics", hireflow: true, competitor1: true, competitor2: false },
  { feature: "Free Plan Available", hireflow: true, competitor1: false, competitor2: false },
  { feature: "API Access", hireflow: true, competitor1: true, competitor2: true },
  { feature: "White-Label Career Page", hireflow: true, competitor1: false, competitor2: false },
  { feature: "Interview Scheduling", hireflow: true, competitor1: true, competitor2: true },
];

const teamMembers = [
  { name: "Arjun Mehta", role: "CEO & Co-Founder", avatar: "AM", bio: "Former VP Engineering at Infosys. Passionate about fixing broken hiring." },
  { name: "Shreya Iyer", role: "CTO & Co-Founder", avatar: "SI", bio: "Ex-Google engineer. Built ML systems serving millions of users." },
  { name: "Rohan Desai", role: "Head of Product", avatar: "RD", bio: "10 years in HR tech. Designed products used by 500+ companies." },
  { name: "Sofia Petrov", role: "Head of Design", avatar: "SP", bio: "Award-winning designer. Believes great UX is a competitive advantage." },
];

const marqueeLogos = ["TechCorp", "ScaleUp", "GlobalFin", "StartupLab", "MegaHire", "CloudTech", "InnovateCo", "DataDriven", "HyperGrowth", "FutureWorks"];

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-3xl font-bold text-gradient-sun font-heading lg:text-5xl">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

const RevealSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-screen bg-background mesh-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-sun font-heading">HireFlow</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#comparison" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/admin">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/admin">
              <Button size="sm" className="shadow-lg" style={{ boxShadow: "var(--shadow-glow)" }}>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-36">
        <div className="absolute inset-0 mesh-bg" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <RevealSection delay={0}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-sm text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Now with AI-powered candidate matching
              </div>
            </RevealSection>
            <RevealSection delay={150}>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-7xl font-heading leading-tight">
                Hire Smarter,{" "}
                <span className="text-gradient-sun text-glow">Hire Faster</span>
              </h1>
            </RevealSection>
            <RevealSection delay={300}>
              <p className="mb-10 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                HireFlow is the modern applicant tracking system that helps you find, evaluate, and hire top talent — all in one beautifully designed platform.
              </p>
            </RevealSection>
            <RevealSection delay={450}>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/admin">
                  <Button size="lg" className="gap-2 px-8 text-base h-12" style={{ boxShadow: "var(--shadow-glow-lg)" }}>
                    Try Demo Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="gap-2 px-8 text-base h-12 border-glow">
                  <Play className="h-4 w-4" /> Watch Demo
                </Button>
              </div>
            </RevealSection>
            <RevealSection delay={600}>
              <p className="mt-6 text-xs text-muted-foreground">No credit card required • Free plan available • Setup in 15 minutes</p>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Animated Marquee Logos */}
      <section className="py-12 border-y border-border/30 overflow-hidden">
        <p className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-wider">Trusted by recruiting teams at leading companies</p>
        <div className="relative">
          <div className="flex animate-marquee gap-16 whitespace-nowrap">
            {[...marqueeLogos, ...marqueeLogos].map((name, i) => (
              <span key={i} className="text-xl font-heading font-semibold text-muted-foreground/40 select-none">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section id="stats" className="py-20">
        <div className="container">
          <RevealSection>
            <div className="glass-card rounded-2xl p-10">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {stats.map((stat, i) => (
                  <RevealSection key={stat.label} delay={i * 100}>
                    <div className="text-center">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                      <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Features</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">Everything You Need to Hire</h2>
              <p className="text-muted-foreground text-lg">Powerful features designed for modern recruiting teams of all sizes.</p>
            </div>
          </RevealSection>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <RevealSection key={f.title} delay={i * 80}>
                <div className="group rounded-xl glass-card p-6 transition-all hover:border-glow hover:-translate-y-1 hover:shadow-lg shimmer h-full">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground font-heading">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Product Preview</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">See HireFlow in Action</h2>
              <p className="text-muted-foreground text-lg">A clean, intuitive interface designed for speed and collaboration.</p>
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-xl border border-border/50 overflow-hidden shadow-2xl" style={{ boxShadow: "var(--shadow-glow-lg)" }}>
                {/* Mock browser chrome */}
                <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/60" />
                    <div className="h-3 w-3 rounded-full bg-warning/60" />
                    <div className="h-3 w-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="rounded-md bg-background/50 px-4 py-1 text-xs text-muted-foreground">app.hireflow.io/pipeline</div>
                  </div>
                </div>
                {/* Mock dashboard content */}
                <div className="bg-card p-6">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Open Positions", val: "12", change: "+3 this week" },
                      { label: "Active Candidates", val: "284", change: "+47 this month" },
                      { label: "Interviews Today", val: "8", change: "3 remaining" },
                      { label: "Offers Pending", val: "5", change: "2 accepted" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg bg-muted/30 p-4 border border-border/30">
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                        <div className="text-2xl font-bold text-foreground font-heading mt-1">{m.val}</div>
                        <div className="text-xs text-primary mt-1">{m.change}</div>
                      </div>
                    ))}
                  </div>
                  {/* Mock pipeline */}
                  <div className="grid grid-cols-5 gap-3">
                    {["Applied", "Screening", "Interview", "Offer", "Hired"].map((stage, i) => (
                      <div key={stage} className="rounded-lg border border-border/30 p-3">
                        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between">
                          {stage}
                          <span className="rounded-full bg-primary/10 text-primary px-1.5 text-[10px]">{[42, 18, 12, 5, 3][i]}</span>
                        </div>
                        {Array.from({ length: Math.min(3, [4, 3, 2, 2, 1][i]) }).map((_, j) => (
                          <div key={j} className="mb-2 rounded-md bg-background/60 p-2 border border-border/20">
                            <div className="h-2 w-3/4 rounded bg-muted-foreground/20 mb-1" />
                            <div className="h-1.5 w-1/2 rounded bg-muted-foreground/10" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -left-4 top-1/4 glass-card rounded-lg p-3 animate-bounce hidden lg:flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">AI Match: 94%</span>
              </div>
              <div className="absolute -right-4 bottom-1/3 glass-card rounded-lg p-3 hidden lg:flex items-center gap-2" style={{ animation: "bounce 2s ease-in-out infinite 0.5s" }}>
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Offer Accepted!</span>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">How It Works</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">From Job Post to Offer in 4 Steps</h2>
              <p className="text-muted-foreground text-lg">A streamlined hiring process that saves your team time and finds better candidates.</p>
            </div>
          </RevealSection>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              {howItWorks.map((item, i) => (
                <RevealSection key={item.step} delay={i * 150}>
                  <div className="relative glass-card rounded-xl p-8 h-full">
                    <span className="absolute -top-4 -left-2 text-6xl font-heading font-bold text-primary/10">{item.step}</span>
                    <div className="relative">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-foreground font-heading">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Compare</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">Why Teams Choose HireFlow</h2>
              <p className="text-muted-foreground text-lg">See how we stack up against traditional ATS platforms.</p>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <div className="mx-auto max-w-3xl glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Feature</th>
                      <th className="p-4 text-center">
                        <span className="text-sm font-bold text-gradient-sun font-heading">HireFlow</span>
                      </th>
                      <th className="p-4 text-center text-sm font-medium text-muted-foreground">Competitor A</th>
                      <th className="p-4 text-center text-sm font-medium text-muted-foreground">Competitor B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? "bg-muted/5" : ""}>
                        <td className="p-4 text-sm text-foreground">{row.feature}</td>
                        <td className="p-4 text-center">
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        </td>
                        <td className="p-4 text-center">
                          {row.competitor1 ? <Check className="h-5 w-5 text-muted-foreground/50 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />}
                        </td>
                        <td className="p-4 text-center">
                          {row.competitor2 ? <Check className="h-5 w-5 text-muted-foreground/50 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16">
        <div className="container">
          <RevealSection>
            <div className="relative overflow-hidden rounded-2xl bg-primary p-12 lg:p-16 text-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(170 80% 45% / 0.5) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(210 60% 50% / 0.4) 0%, transparent 50%)" }} />
              <div className="relative">
                <h2 className="mb-4 text-3xl lg:text-4xl font-bold text-primary-foreground font-heading">Ready to Transform Your Hiring?</h2>
                <p className="mb-8 text-lg text-primary-foreground/80 max-w-2xl mx-auto">Join 10,000+ companies already using HireFlow to build their dream teams faster.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/admin">
                    <Button size="lg" variant="secondary" className="gap-2 px-8 text-base h-12 font-semibold">
                      Start Free Trial <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="ghost" className="px-8 text-base h-12 text-primary-foreground hover:bg-primary-foreground/10">
                    Talk to Sales
                  </Button>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Testimonials</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">Loved by Hiring Teams</h2>
              <p className="text-muted-foreground text-lg">See what recruiting professionals are saying about HireFlow.</p>
            </div>
          </RevealSection>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <RevealSection key={t.name} delay={i * 100}>
                <div className="glass-card rounded-xl p-8 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Our Team</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">Built by Hiring Experts</h2>
              <p className="text-muted-foreground text-lg">We've lived the pain of broken hiring. That's why we built something better.</p>
            </div>
          </RevealSection>
          <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, i) => (
              <RevealSection key={member.name} delay={i * 100}>
                <div className="glass-card rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-glow">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary font-heading">
                    {member.avatar}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground font-heading">{member.name}</h3>
                  <p className="text-xs text-primary font-medium mt-1">{member.role}</p>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{member.bio}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Integrations</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">Works With Your Favorite Tools</h2>
              <p className="text-muted-foreground text-lg">Connect HireFlow with the tools your team already uses every day.</p>
            </div>
          </RevealSection>
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {integrations.map((item, i) => (
                <RevealSection key={item.name} delay={i * 50}>
                  <div className="glass-card rounded-lg p-4 text-center transition-all hover:border-glow hover:-translate-y-0.5 flex flex-col items-center gap-2">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Pricing</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground text-lg">Start free. Scale as you grow. No hidden fees.</p>
            </div>
          </RevealSection>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              { name: "Starter", price: "Free", period: "forever", desc: "For small teams getting started", features: ["Up to 5 active jobs", "50 candidates/month", "Basic Kanban pipeline", "Email support", "Career page"] },
              { name: "Pro", price: "$49", period: "/mo per user", desc: "For growing recruiting teams", features: ["Unlimited jobs", "Unlimited candidates", "Drag & drop pipeline", "Analytics & reports", "Team collaboration", "Email templates", "Priority support"], popular: true },
              { name: "Enterprise", price: "Custom", period: "contact us", desc: "For large organizations", features: ["Everything in Pro", "SSO & SAML", "Custom integrations", "Dedicated success manager", "SLA guarantee", "Custom workflows", "API access"] },
            ].map((plan, i) => (
              <RevealSection key={plan.name} delay={i * 150}>
                <div className={`relative rounded-xl glass-card p-8 transition-all hover:-translate-y-1 h-full flex flex-col ${plan.popular ? "border-glow ring-1 ring-primary/30 scale-105" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-foreground font-heading">{plan.name}</h3>
                  <div className="my-4">
                    <span className="text-4xl font-bold text-gradient-sun font-heading">{plan.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <p className="mb-6 text-sm text-muted-foreground">{plan.desc}</p>
                  <ul className="mb-8 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} style={plan.popular ? { boxShadow: "var(--shadow-glow)" } : {}}>
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">FAQ</span>
              <h2 className="mt-3 mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-lg">Everything you need to know about HireFlow.</p>
            </div>
          </RevealSection>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <RevealSection key={i} delay={i * 80}>
                <details className="group glass-card rounded-xl">
                  <summary className="flex cursor-pointer items-center justify-between p-6 text-foreground font-medium font-heading">
                    {faq.q}
                    <span className="ml-4 text-primary transition-transform group-open:rotate-45 text-xl">+</span>
                  </summary>
                  <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </div>
                </details>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto max-w-2xl glass-card rounded-2xl p-10 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground font-heading">Stay in the Loop</h2>
              <p className="mb-6 text-muted-foreground">Get hiring tips, product updates, and industry insights delivered to your inbox.</p>
              {subscribed ? (
                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <CheckCircle className="h-5 w-5" /> You're subscribed! Check your inbox.
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" className="gap-2" style={{ boxShadow: "var(--shadow-glow)" }}>
                    Subscribe <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}
              <p className="mt-4 text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container">
          <RevealSection>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl lg:text-4xl font-bold text-foreground font-heading">Start Hiring Better Today</h2>
              <p className="mb-8 text-lg text-muted-foreground max-w-xl mx-auto">
                Join thousands of companies that trust HireFlow to find and hire the best talent. Get started in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/admin">
                  <Button size="lg" className="gap-2 px-10 text-base h-12" style={{ boxShadow: "var(--shadow-glow-lg)" }}>
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-10 text-base h-12 border-glow gap-2">
                  <Headphones className="h-4 w-4" /> Talk to Sales
                </Button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">Free 14-day trial • No credit card required • Cancel anytime</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Briefcase className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-gradient-sun font-heading">HireFlow</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">The modern ATS built for teams that want to hire smarter and faster.</p>
              <div className="flex gap-3">
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 font-heading">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Integrations", "Changelog", "Roadmap"].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 font-heading">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Press", "Contact"].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 font-heading">Legal</h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 HireFlow. All rights reserved.</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-destructive inline" /> by the HireFlow team
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
