import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Clock, IndianRupee, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ContactFormModal from "../ContactFormModal";


const ROICalculator = () => {
    const [beds, setBeds] = useState([0]);
    const [dailyOPD, setDailyOPD] = useState([0]);
    const [staffCount, setStaffCount] = useState([0]);

    const calculations = useMemo(() => {
        const bedCount = beds[0];
        const opdCount = dailyOPD[0];
        const staff = staffCount[0];

        // ROI calculations (simplified model)
        const annualBillingErrors = opdCount * 365 * 0.05 * 500; // 5% errors at ₹500 avg
        const billingErrorsSaved = annualBillingErrors * 0.4; // 40% reduction

        const manualHoursPerWeek = staff * 5; // 5 hours/week manual work
        const hoursSavedPerYear = manualHoursPerWeek * 0.6 * 52; // 60% time saved
        const labourCostSaved = hoursSavedPerYear * 150; // ₹150/hour

        const revenueLeakage = bedCount * 365 * 0.03 * 2000; // 3% leakage at ₹2000/bed/day
        const leakageRecovered = revenueLeakage * 0.5; // 50% recovery

        const totalAnnualSavings = billingErrorsSaved + labourCostSaved + leakageRecovered;
        const monthlySavings = totalAnnualSavings / 12;

        return {
            billingErrorsSaved: Math.round(billingErrorsSaved),
            hoursSavedPerYear: Math.round(hoursSavedPerYear),
            labourCostSaved: Math.round(labourCostSaved),
            leakageRecovered: Math.round(leakageRecovered),
            totalAnnualSavings: Math.round(totalAnnualSavings),
            monthlySavings: Math.round(monthlySavings),
        };
    }, [beds, dailyOPD, staffCount]);

    const formatCurrency = (amount) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        }
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    return (
        <section className="py-20 lg:py-28 bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Calculator className="inline h-4 w-4 mr-1" />
                        ROI Calculator
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Calculate Your Savings
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        See how much your hospital could save annually with CareWell HMS
                    </p>
                </motion.div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-10">
                        {/* Input Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="bg-secondary/30 rounded-2xl p-8 border border-border/50"
                        >
                            <h3 className="text-xl font-semibold text-foreground mb-8">
                                Enter Your Hospital Details
                            </h3>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-sm font-medium text-foreground">Number of Beds</label>
                                        <span className="text-sm font-bold text-primary">{beds[0]} beds</span>
                                    </div>
                                    <Slider
                                        value={beds}
                                        onValueChange={setBeds}
                                        min={0}
                                        max={500}
                                        step={1}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                        <span>0</span>
                                        <span>500</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-sm font-medium text-foreground">Daily OPD Patients</label>
                                        <span className="text-sm font-bold text-primary">{dailyOPD[0]} patients</span>
                                    </div>
                                    <Slider
                                        value={dailyOPD}
                                        onValueChange={setDailyOPD}
                                        min={0}
                                        max={500}
                                        step={5}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                        <span>0</span>
                                        <span>500</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-sm font-medium text-foreground">Administrative Staff</label>
                                        <span className="text-sm font-bold text-primary">{staffCount[0]} staff</span>
                                    </div>
                                    <Slider
                                        value={staffCount}
                                        onValueChange={setStaffCount}
                                        min={0}
                                        max={100}
                                        step={1}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                        <span>0</span>
                                        <span>100</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Results Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            {/* Total Savings Card */}
                            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                                <p className="text-sm text-primary font-medium mb-2">Estimated Annual Savings</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-bold text-primary">
                                        {formatCurrency(calculations.totalAnnualSavings)}
                                    </span>
                                    <span className="text-muted-foreground">/year</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    That's {formatCurrency(calculations.monthlySavings)}/month!
                                </p>
                            </div>

                            {/* Breakdown */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <IndianRupee className="h-4 w-4 text-blue-500" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-foreground">{formatCurrency(calculations.billingErrorsSaved)}</p>
                                    <p className="text-xs text-muted-foreground">Billing Errors Prevented</p>
                                </div>

                                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-emerald-500" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-foreground">{calculations.hoursSavedPerYear}h</p>
                                    <p className="text-xs text-muted-foreground">Staff Hours Saved</p>
                                </div>

                                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-purple-500" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-foreground">{formatCurrency(calculations.labourCostSaved)}</p>
                                    <p className="text-xs text-muted-foreground">Labour Cost Saved</p>
                                </div>

                                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <TrendingUp className="h-4 w-4 text-amber-500" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-foreground">{formatCurrency(calculations.leakageRecovered)}</p>
                                    <p className="text-xs text-muted-foreground">Revenue Recovered</p>
                                </div>
                            </div>

                            <ContactFormModal>
                                <Button size="lg" className="w-full group">
                                    Get Custom ROI Analysis
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </ContactFormModal>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ROICalculator;
