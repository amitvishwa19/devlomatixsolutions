import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import carewellLogo from '@/assets/carewell-logo.png';
import { Activity, Heart, Users, Shield, Pill, FileText, Cloud, Smartphone, Building, CreditCard } from 'lucide-react';

const slidingContent = [
  {
    title: "Caring for Health Beyond Treatment.",
    highlight: "Organizing Care, Empowering Lives",
    description: "Smart systems. Seamless care. Where medicine meets management. Our platform simplifies healthcare by connecting people, processes, and data — ensuring every detail of patient care is perfectly organized.",
    icon: Heart
  },
  {
    title: "Complete Clinical Management.",
    highlight: "OPD, IPD & EMR Solutions",
    description: "Streamline patient consultations, admissions, and electronic medical records. Track patient history, prescriptions, and treatment plans with our comprehensive clinical workflow management system.",
    icon: Activity
  },
  {
    title: "Advanced Pharmacy Module.",
    highlight: "GST Compliant Inventory Control",
    description: "Manage medicine inventory, batch tracking, expiry alerts, and GST-compliant billing. Integrated with clinical modules for seamless prescription fulfillment and stock management.",
    icon: Pill
  },
  {
    title: "Pathology & Radiology.",
    highlight: "500+ Reports & Templates",
    description: "Complete laboratory and radiology management with 500+ pre-built report templates. Automated result delivery, sample tracking, and integration with diagnostic equipment.",
    icon: FileText
  },
  {
    title: "Auto Cloud Backup.",
    highlight: "Secure Data Protection",
    description: "Never lose critical patient data with automatic cloud backup. HIPAA-compliant security, encrypted storage, and instant disaster recovery for complete peace of mind.",
    icon: Cloud
  },
  {
    title: "Mobile Application.",
    highlight: "Healthcare On The Go",
    description: "Access patient records, appointments, and reports from anywhere. Real-time notifications, telemedicine support, and seamless sync across all your devices.",
    icon: Smartphone
  },
  {
    title: "TPA & Insurance Management.",
    highlight: "Cashless Claims Processing",
    description: "Streamlined insurance claim processing, TPA tie-ups, and corporate billing. Automated pre-authorization, claim tracking, and seamless reimbursement workflows.",
    icon: CreditCard
  },
  {
    title: "Multi-Branch Support.",
    highlight: "Centralized Hospital Network",
    description: "Manage multiple hospital branches from a single dashboard. Unified patient records, inter-branch referrals, and consolidated reporting across your healthcare network.",
    icon: Building
  }
];

const AuthLayout = ({ children, title, subtitle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate stable random positions using useMemo
  const networkLines = useMemo(() =>
    [...Array(15)].map((_, i) => ({
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
    })), []
  );

  const networkNodes = useMemo(() =>
    [...Array(20)].map((_, i) => ({
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      size: 3 + Math.random() * 5,
    })), []
  );

  const particles = useMemo(() =>
    [...Array(30)].map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
    })), []
  );

  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slidingContent.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  const currentContent = slidingContent[currentSlide];
  const CurrentIcon = currentContent.icon;

  return (
    <div className="min-h-screen flex flex-row">
      {/* Left Section - Loader Content (70%) */}
      <div className="flex w-[70%] min-h-screen relative overflow-hidden bg-gradient-to-br from-primary/95 via-primary to-primary/90">
        {/* Animated Network Background */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Animated connection lines */}
            {networkLines.map((line, i) => (
              <line
                key={`line-${i}`}
                x1={`${line.x1}%`}
                y1={`${line.y1}%`}
                x2={`${line.x2}%`}
                y2={`${line.y2}%`}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.5}s`, animationDuration: '4s' }}
              />
            ))}

            {/* Network nodes */}
            {networkNodes.map((node, i) => (
              <g key={`node-${i}`}>
                <circle
                  cx={`${node.cx}%`}
                  cy={`${node.cy}%`}
                  r={node.size}
                  fill="url(#nodeGlow)"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.4}s`, animationDuration: '5s' }}
                />
                <circle
                  cx={`${node.cx}%`}
                  cy={`${node.cy}%`}
                  r={node.size / 2}
                  fill="white"
                  opacity="0.4"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-8 py-12">
          {/* Healthcare Icons */}
          <div className="flex justify-center gap-6 mb-8">
            <Activity
              className="w-10 h-10 text-white animate-bounce"
              style={{ animationDelay: '0s', animationDuration: '2s' }}
            />
            <Heart
              className="w-10 h-10 text-white animate-bounce"
              style={{ animationDelay: '0.2s', animationDuration: '2s' }}
            />
            <Users
              className="w-10 h-10 text-white animate-bounce"
              style={{ animationDelay: '0.4s', animationDuration: '2s' }}
            />
            <Shield
              className="w-10 h-10 text-white animate-bounce"
              style={{ animationDelay: '0.6s', animationDuration: '2s' }}
            />
          </div>

          {/* Auto-Sliding Content */}
          <div className={`transition-all duration-500 text-center max-w-2xl ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            {/* Current Feature Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                <CurrentIcon className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              {currentContent.title}{" "}
              <span className="text-white/80">{currentContent.highlight}</span>
            </h1>

            {/* Description */}
            <p className="text-white/70 text-sm md:text-base mb-8 max-w-xl mx-auto">
              {currentContent.description}
            </p>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {slidingContent.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentSlide(index);
                    setIsAnimating(false);
                  }, 300);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                    ? 'bg-white w-6'
                    : 'bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>

          {/* Divider with Heart */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-0.5 bg-white/50" />
            <Heart className="w-6 h-6 text-white fill-white animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="w-16 h-0.5 bg-white/50" />
          </div>

          {/* Subtitle */}
          <p className="text-white/60 text-sm md:text-base mb-8 text-center">
            Empowering healthcare providers with intelligent solutions for<br />
            patient care, resource management, and operational excellence
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10">
            <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Shield className="w-4 h-4 text-white" />
              <span>Secure & Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <Activity className="w-4 h-4 text-white" />
              <span>Real-time Monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Users className="w-4 h-4 text-white" />
              <span>Patient-Centric</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <Heart className="w-4 h-4 text-white" />
              <span>Compassionate Care</span>
            </div>
          </div>

        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-white/20" />
        <div className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-white/20" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-white/20" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-white/20" />
      </div>

      {/* Right Section - Form (30%) */}
      <div className="w-[30%] flex flex-col items-center justify-center p-8 bg-background min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/">
              <img src={carewellLogo} alt="CareWell HMS" className="h-12" />
            </Link>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center text-foreground mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground text-center mb-8">{subtitle}</p>
          )}

          {/* Form Content */}
          {children}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-border rounded-md hover:bg-accent transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-foreground">Google</span>
          </button>

          {/* Terms */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
