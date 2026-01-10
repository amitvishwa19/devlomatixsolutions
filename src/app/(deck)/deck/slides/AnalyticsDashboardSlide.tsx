import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Bed, 
  DollarSign, 
  Activity,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const patientData = [
  { month: "Jan", opd: 4200, ipd: 890, emergency: 340 },
  { month: "Feb", opd: 4500, ipd: 920, emergency: 380 },
  { month: "Mar", opd: 4800, ipd: 1100, emergency: 420 },
  { month: "Apr", opd: 5100, ipd: 1050, emergency: 390 },
  { month: "May", opd: 5400, ipd: 1200, emergency: 450 },
  { month: "Jun", opd: 5800, ipd: 1350, emergency: 480 },
];

const revenueData = [
  { month: "Jan", revenue: 2.4 },
  { month: "Feb", revenue: 2.8 },
  { month: "Mar", revenue: 3.2 },
  { month: "Apr", revenue: 3.0 },
  { month: "May", revenue: 3.6 },
  { month: "Jun", revenue: 4.1 },
];

const departmentData = [
  { name: "Cardiology", value: 28, color: "hsl(210, 90%, 55%)" },
  { name: "Orthopedics", value: 22, color: "hsl(340, 75%, 55%)" },
  { name: "Neurology", value: 18, color: "hsl(152, 55%, 42%)" },
  { name: "Pediatrics", value: 17, color: "hsl(38, 85%, 52%)" },
  { name: "Others", value: 15, color: "hsl(270, 70%, 55%)" },
];

const kpis = [
  { 
    label: "Total Patients", 
    value: "12,847", 
    change: "+12.5%", 
    trend: "up",
    icon: Users,
    color: "text-primary"
  },
  { 
    label: "Bed Occupancy", 
    value: "87.3%", 
    change: "+3.2%", 
    trend: "up",
    icon: Bed,
    color: "text-green-500"
  },
  { 
    label: "Revenue (Cr)", 
    value: "₹4.1", 
    change: "+18.4%", 
    trend: "up",
    icon: DollarSign,
    color: "text-amber-500"
  },
  { 
    label: "Avg. Wait Time", 
    value: "14 min", 
    change: "-8.3%", 
    trend: "down",
    icon: Activity,
    color: "text-purple-500"
  },
];

const AnalyticsDashboardSlide = () => {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm font-medium">Real-time Analytics</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Analytics Dashboard
        </h2>
        <p className="text-muted-foreground mt-2">
          Live KPIs and performance metrics at a glance
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl glass-effect"
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-xs font-medium flex items-center gap-0.5 ${
                kpi.trend === "up" ? "text-green-500" : "text-red-500"
              }`}>
                {kpi.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient Flow Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl glass-effect"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Patient Flow Trends
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientData}>
                <defs>
                  <linearGradient id="colorOpd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 90%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210, 90%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIpd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 55%, 42%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152, 55%, 42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="opd"
                  stroke="hsl(210, 90%, 55%)"
                  fillOpacity={1}
                  fill="url(#colorOpd)"
                  name="OPD"
                />
                <Area
                  type="monotone"
                  dataKey="ipd"
                  stroke="hsl(152, 55%, 42%)"
                  fillOpacity={1}
                  fill="url(#colorIpd)"
                  name="IPD"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl glass-effect"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            Revenue Growth (in Crores)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(38, 85%, 52%)" 
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-xl glass-effect md:col-span-2"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" />
            Department-wise Patient Distribution
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-48 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {departmentData.map((dept) => (
                <div key={dept.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {dept.name} ({dept.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardSlide;
