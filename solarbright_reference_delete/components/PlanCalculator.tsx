import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Sparkles, ArrowRight, Building2, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import calculatorConfig, { type PlanRule } from "@/data/calculatorConfig";

const PlanCalculator = () => {
  const [propertyType, setPropertyType] = useState(calculatorConfig.propertyTypes[0].value);
  const [towers, setTowers] = useState(1);
  const [panelCount, setPanelCount] = useState(calculatorConfig.panelRange.default);
  const [frequency, setFrequency] = useState(calculatorConfig.cleaningFrequency[0].value);

  const totalPanels = useMemo(() => {
    const prop = calculatorConfig.propertyTypes.find((p) => p.value === propertyType);
    return Math.round(panelCount * towers * (prop?.panelMultiplier ?? 1));
  }, [propertyType, towers, panelCount]);

  const frequencyMultiplier = useMemo(() => {
    return calculatorConfig.cleaningFrequency.find((f) => f.value === frequency)?.multiplier ?? 1;
  }, [frequency]);

  const recommendedPlan: PlanRule = useMemo(() => {
    const plans = calculatorConfig.plans;
    if (totalPanels >= 50 || frequencyMultiplier >= 6) return plans[2]; // AMC
    if (totalPanels >= 15 || frequencyMultiplier >= 4) return plans[1]; // Standard
    return plans[0]; // Basic
  }, [totalPanels, frequencyMultiplier]);

  return (
    <section id="calculator" className="py-28 relative overflow-hidden mesh-bg">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Plan Calculator
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Find Your Perfect Plan
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Tell us about your setup and we'll recommend the best cleaning plan for you.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Input Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 rounded-2xl border border-border bg-card p-8 space-y-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">Your Setup</h3>
            </div>

            {/* Property Type */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Property Type
              </Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calculatorConfig.propertyTypes.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number of Buildings */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Number of Buildings / Towers
              </Label>
              <Select value={String(towers)} onValueChange={(v) => setTowers(Number(v))}>
                <SelectTrigger className="h-12 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calculatorConfig.towerOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Panel Count */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary" /> Panels per Building
                <span className="ml-auto text-primary font-bold text-lg">{panelCount}</span>
              </Label>
              <Slider
                value={[panelCount]}
                onValueChange={([v]) => setPanelCount(v)}
                min={calculatorConfig.panelRange.min}
                max={calculatorConfig.panelRange.max}
                step={calculatorConfig.panelRange.step}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{calculatorConfig.panelRange.min} panels</span>
                <span>{calculatorConfig.panelRange.max} panels</span>
              </div>
            </div>

            {/* Cleaning Frequency */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Cleaning Frequency
              </Label>
              <RadioGroup value={frequency} onValueChange={setFrequency} className="grid grid-cols-2 gap-3">
                {calculatorConfig.cleaningFrequency.map((opt) => (
                  <Label
                    key={opt.value}
                    htmlFor={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      frequency === opt.value
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-secondary hover:border-primary/20"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <span className="text-sm text-foreground">{opt.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </motion.div>

          {/* Result Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Summary */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h4 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wider">Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Total Panels</span>
                  <span className="font-bold text-primary text-lg">{totalPanels}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Cleanings / Year</span>
                  <span className="font-bold">{frequencyMultiplier}x</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Est. Per Visit</span>
                  <span className="font-bold">₹{(totalPanels * recommendedPlan.pricePerPanel).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Est. Annual Cost</span>
                  <span className="font-bold text-primary text-lg">
                    ₹{(totalPanels * recommendedPlan.pricePerPanel * frequencyMultiplier).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Plan */}
            <div className="rounded-2xl border border-primary/40 bg-card p-6 space-y-4 shadow-glow relative overflow-hidden">
              <div className="absolute top-0 right-0 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Recommended
              </div>
              <h4 className="font-heading text-2xl font-bold text-foreground mt-4">{recommendedPlan.name}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-primary font-heading">₹{recommendedPlan.pricePerPanel}</span>
                <span className="text-muted-foreground text-sm">/panel</span>
              </div>
              <p className="text-sm text-muted-foreground">{recommendedPlan.description}</p>
              <div className="text-xs text-muted-foreground bg-secondary rounded-lg p-3">
                <span className="font-semibold text-foreground">Best for:</span> {recommendedPlan.bestFor}
              </div>
              <Button className="w-full rounded-full h-12 bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:brightness-110 transition-all duration-300" size="lg" asChild>
                <a href="#contact">
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>

            {/* Other plans */}
            <div className="space-y-3">
              {calculatorConfig.plans
                .filter((p) => p.id !== recommendedPlan.id)
                .map((plan) => (
                  <div key={plan.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-heading font-bold text-foreground text-sm">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">₹{plan.pricePerPanel}/panel</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary" asChild>
                      <a href="#contact">Select</a>
                    </Button>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlanCalculator;
