import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingDown, TrendingUp, IndianRupee, Sun, Leaf } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ELECTRICITY_RATE = 7; // ₹ per kWh average in India
const PANEL_WATT = 400; // watts per panel
const PEAK_SUN_HOURS = 5; // average daily peak sun hours in India
const DIRTY_LOSS_PERCENT = 25; // efficiency loss from dirty panels

function useAnimatedCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = value;
    const diff = target - start;
    if (Math.abs(diff) < 1) { setValue(target); return; }
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(start + diff * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

const EnergySavingsCalculator = () => {
  const [panelCount, setPanelCount] = useState(20);
  const [years, setYears] = useState("1");

  const yearNum = Number(years);
  const dailyOutputClean = panelCount * PANEL_WATT * PEAK_SUN_HOURS / 1000; // kWh
  const dailyOutputDirty = dailyOutputClean * (1 - DIRTY_LOSS_PERCENT / 100);
  const dailyLoss = dailyOutputClean - dailyOutputDirty; // kWh lost
  const annualLossKwh = dailyLoss * 365 * yearNum;
  const annualLossMoney = Math.round(annualLossKwh * ELECTRICITY_RATE);
  const annualCleanRevenue = Math.round(dailyOutputClean * 365 * yearNum * ELECTRICITY_RATE);
  const co2Saved = Math.round(annualLossKwh * 0.82); // kg CO₂ per kWh in India

  const animatedLoss = useAnimatedCounter(annualLossMoney);
  const animatedRevenue = useAnimatedCounter(annualCleanRevenue);
  const animatedCO2 = useAnimatedCounter(co2Saved);

  return (
    <section id="savings" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
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
            Energy Savings
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            How Much Are Dirty Panels Costing You?
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Dust and grime can reduce solar output by up to 25%. See exactly how much money you're leaving on the table.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-8 space-y-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">Your Solar Setup</h3>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Number of Panels
                <span className="ml-auto text-primary font-bold text-lg">{panelCount}</span>
              </Label>
              <Slider
                value={[panelCount]}
                onValueChange={([v]) => setPanelCount(v)}
                min={5}
                max={500}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 panels</span>
                <span>500 panels</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" /> Time Period
              </Label>
              <Select value={years} onValueChange={setYears}>
                <SelectTrigger className="h-12 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Year</SelectItem>
                  <SelectItem value="2">2 Years</SelectItem>
                  <SelectItem value="5">5 Years</SelectItem>
                  <SelectItem value="10">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visual comparison bar */}
            <div className="space-y-4 pt-4">
              <p className="text-sm font-semibold text-foreground">Daily Output Comparison</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-primary font-medium">Clean Panels</span>
                    <span className="text-foreground font-bold">{dailyOutputClean.toFixed(1)} kWh</span>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-destructive font-medium">Dirty Panels</span>
                    <span className="text-foreground font-bold">{dailyOutputDirty.toFixed(1)} kWh</span>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-destructive/80 to-destructive/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - DIRTY_LOSS_PERCENT}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Money Lost */}
            <div className="rounded-2xl border border-destructive/30 bg-card p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-semibold text-destructive uppercase tracking-wider">Money You're Losing</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-destructive font-heading">
                    ₹{animatedLoss.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Over {yearNum} year{yearNum > 1 ? "s" : ""} with {DIRTY_LOSS_PERCENT}% efficiency loss
                </p>
              </div>
            </div>

            {/* Clean Revenue */}
            <div className="rounded-2xl border border-primary/40 bg-card p-6 relative overflow-hidden shadow-glow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Clean Panel Revenue</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-primary font-heading">
                    ₹{animatedRevenue.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Total energy value with clean, optimized panels
                </p>
              </div>
            </div>

            {/* CO2 */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-5 w-5 text-green-500" />
                <span className="text-sm font-semibold text-green-500 uppercase tracking-wider">Environmental Impact</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground font-heading">
                  {animatedCO2.toLocaleString()} kg
                </span>
                <span className="text-muted-foreground text-sm">CO₂ wasted</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Extra carbon emissions due to compensating with grid power
              </p>
            </div>

            <Button className="w-full rounded-full h-12 bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:brightness-110 transition-all duration-300" size="lg" asChild>
              <a href="#contact">
                Stop Losing Money — Get a Quote <Zap className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EnergySavingsCalculator;
