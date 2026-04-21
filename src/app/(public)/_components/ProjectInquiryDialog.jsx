import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle, Rocket, Users, Calendar, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  projectType: z.string().min(1, "Please select a project type"),
  budget: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  description: z.string().trim().min(10, "Please provide more details").max(2000),
  features: z.array(z.string()).optional(),
});

const projectTypes = [
  { id: "web-app", label: "Web Application", icon: "🌐" },
  { id: "mobile-app", label: "Mobile App", icon: "📱" },
  { id: "automation", label: "Process Automation", icon: "⚡" },
  { id: "custom-software", label: "Custom Software", icon: "💻" },
  { id: "mvp", label: "MVP Development", icon: "🚀" },
  { id: "integration", label: "System Integration", icon: "🔗" },
];

const budgetRanges = [
  { id: "10k-25k", label: "$10K - $25K" },
  { id: "25k-50k", label: "$25K - $50K" },
  { id: "50k-100k", label: "$50K - $100K" },
  { id: "100k-250k", label: "$100K - $250K" },
  { id: "250k+", label: "$250K+" },
];

const timelines = [
  { id: "1-2-months", label: "1-2 months" },
  { id: "3-4-months", label: "3-4 months" },
  { id: "5-6-months", label: "5-6 months" },
  { id: "6-12-months", label: "6-12 months" },
  { id: "flexible", label: "Flexible" },
];

const featureOptions = [
  "User Authentication",
  "Payment Integration",
  "Real-time Features",
  "Admin Dashboard",
  "API Development",
  "Third-party Integrations",
  "Analytics & Reporting",
  "Mobile Responsive",
];

const ProjectInquiryDialog = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
    features: [],
  });

  const totalSteps = 4;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature],
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    } else if (step === 2) {
      if (!formData.projectType) newErrors.projectType = "Please select a project type";
    } else if (step === 3) {
      if (!formData.budget) newErrors.budget = "Please select a budget range";
      if (!formData.timeline) newErrors.timeline = "Please select a timeline";
    } else if (step === 4) {
      if (formData.description.trim().length < 10) newErrors.description = "Please provide more details (min 10 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    const result = projectSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: "Please check all fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);

    toast({
      title: "Inquiry Submitted!",
      description: "Our team will review your project and contact you within 24 hours.",
    });

    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      setStep(1);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        projectType: "",
        budget: "",
        timeline: "",
        description: "",
        features: [],
      });
    }, 3000);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setIsSuccess(false);
      setErrors({});
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl glass-card p-8 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="font-display text-3xl font-bold text-foreground mb-3">Thank You!</h3>
              <p className="text-muted-foreground text-lg mb-2">Your project inquiry has been submitted.</p>
              <p className="text-muted-foreground">Our team will contact you within 24 hours.</p>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Start Your Project</h2>
                <p className="text-muted-foreground">Tell us about your project and we'll get back to you with a proposal.</p>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        s <= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 4 && (
                      <div className={`flex-1 h-1 rounded-full transition-colors ${
                        s < step ? "bg-primary" : "bg-secondary"
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-foreground">Contact Information</h3>
                          <p className="text-sm text-muted-foreground">How can we reach you?</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Rahul Sharma"
                            className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${errors.name ? 'border-destructive' : 'border-border/50'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors`}
                          />
                          {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="rahul@company.in"
                            className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${errors.email ? 'border-destructive' : 'border-border/50'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors`}
                          />
                          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your company"
                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 97123 40450"
                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-foreground">Project Type</h3>
                          <p className="text-sm text-muted-foreground">What would you like to build?</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {projectTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleSelect("projectType", type.id)}
                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                              formData.projectType === type.id
                                ? "border-primary bg-primary/10"
                                : "border-border/50 bg-secondary/30 hover:border-primary/50"
                            }`}
                          >
                            <span className="text-2xl mb-2 block">{type.icon}</span>
                            <span className="font-medium text-foreground">{type.label}</span>
                          </button>
                        ))}
                      </div>
                      {errors.projectType && <p className="text-destructive text-sm">{errors.projectType}</p>}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-foreground">Budget & Timeline</h3>
                          <p className="text-sm text-muted-foreground">Help us understand your constraints</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">Budget Range *</label>
                        <div className="flex flex-wrap gap-2">
                          {budgetRanges.map((budget) => (
                            <button
                              key={budget.id}
                              type="button"
                              onClick={() => handleSelect("budget", budget.id)}
                              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                                formData.budget === budget.id
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {budget.label}
                            </button>
                          ))}
                        </div>
                        {errors.budget && <p className="text-destructive text-sm mt-1">{errors.budget}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Expected Timeline *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {timelines.map((timeline) => (
                            <button
                              key={timeline.id}
                              type="button"
                              onClick={() => handleSelect("timeline", timeline.id)}
                              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                                formData.timeline === timeline.id
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {timeline.label}
                            </button>
                          ))}
                        </div>
                        {errors.timeline && <p className="text-destructive text-sm mt-1">{errors.timeline}</p>}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-foreground">Project Details</h3>
                          <p className="text-sm text-muted-foreground">Tell us more about your vision</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">Key Features (optional)</label>
                        <div className="flex flex-wrap gap-2">
                          {featureOptions.map((feature) => (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => handleFeatureToggle(feature)}
                              className={`px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 ${
                                formData.features?.includes(feature)
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {feature}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Project Description *</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Describe your project goals, target audience, key features you need, and any specific requirements..."
                          rows={5}
                          className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${errors.description ? 'border-destructive' : 'border-border/50'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none`}
                        />
                        {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  className={step === 1 ? "invisible" : ""}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {step < totalSteps ? (
                  <Button type="button" variant="hero" onClick={nextStep}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Inquiry
                        <Rocket className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectInquiryDialog;
