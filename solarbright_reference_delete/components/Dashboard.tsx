import { BarChart3, Smartphone, FileText, Bell, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import dashboardMockup from "@/assets/dashboard-mockup.png";

const features = [
  {
    icon: BarChart3,
    title: "Weekly Output Dashboard",
    description: "Track your solar panel performance with detailed weekly reports showing energy generation, efficiency trends, and comparisons.",
  },
  {
    icon: Smartphone,
    title: "Custom Monitoring App",
    description: "Access your solar data anytime with our dedicated mobile app. Real-time alerts and insights at your fingertips.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Detailed graphs and analytics showing unit-wise output, peak generation hours, and seasonal performance patterns.",
  },
  {
    icon: FileText,
    title: "Detailed Reports",
    description: "Monthly and quarterly performance reports with actionable insights to maximize your solar investment returns.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified instantly about performance drops, maintenance needs, or any issues requiring attention.",
  },
  {
    icon: Shield,
    title: "Dedicated Account Manager",
    description: "A single point of contact for all your solar maintenance needs, ensuring personalized and priority service.",
  },
];

const Dashboard = () => {
  return (
    <section id="dashboard" className="py-28 relative overflow-hidden bg-muted/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[200px]" />

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
            AMC Exclusive
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Smart Solar Monitoring
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            AMC plan members get access to our complete monitoring and reporting suite.
          </p>
          <Badge variant="outline" className="mt-4 border-primary/30 text-primary font-semibold px-4 py-1.5">
            Included in AMC Plan — ₹14/panel
          </Badge>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-border overflow-hidden shadow-elevated bg-card">
            <img
              src={dashboardMockup}
              alt="SolarShine smart monitoring dashboard showing weekly energy output, performance analytics, alerts, and account manager details"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Preview of the SolarShine monitoring dashboard — included with every AMC plan
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Dashboard;
