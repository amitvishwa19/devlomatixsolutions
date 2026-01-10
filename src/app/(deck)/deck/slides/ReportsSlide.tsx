import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  FileSpreadsheet,
  Download
} from "lucide-react";

const ReportsSlide = () => {
  const reportTypes = [
    { name: "Patient Statistics", icon: <Users className="w-5 h-5" /> },
    { name: "Revenue Analysis", icon: <TrendingUp className="w-5 h-5" /> },
    { name: "Department Performance", icon: <Activity className="w-5 h-5" /> },
    { name: "Occupancy Reports", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
          Analytics & Reports
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Data-Driven <span className="text-gradient-primary">Insights</span>
        </h2>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl w-full">
        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-effect rounded-2xl p-6 flex-1"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Dashboard Overview</h3>
            <span className="text-xs text-muted-foreground">Real-time</span>
          </div>

          {/* Mini Charts */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Today's Patients</p>
              <p className="text-2xl font-bold text-primary">127</p>
              <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                <TrendingUp className="w-3 h-3" />
                +12%
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl font-bold text-primary">₹4.2L</p>
              <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                <TrendingUp className="w-3 h-3" />
                +8%
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Bed Occupancy</p>
              <p className="text-2xl font-bold text-primary">78%</p>
              <div className="w-full bg-border rounded-full h-1.5 mt-2">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Pending Reports</p>
              <p className="text-2xl font-bold text-orange-400">23</p>
              <p className="text-xs text-muted-foreground mt-1">Lab & Radiology</p>
            </div>
          </div>

          {/* Bar Chart Placeholder */}
          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-3">Weekly Patient Trend</p>
            <div className="flex items-end gap-2 h-20">
              {[60, 80, 45, 90, 70, 85, 75].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                  className="flex-1 bg-primary/60 rounded-t"
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </motion.div>

        {/* Report Types */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col gap-4 lg:w-64"
        >
          <h4 className="font-semibold text-foreground">Report Categories</h4>
          {reportTypes.map((report, index) => (
            <motion.div
              key={report.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="glass-effect rounded-lg p-4 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="text-primary">{report.icon}</div>
              <span className="text-sm text-foreground">{report.name}</span>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="glass-effect rounded-lg p-4 mt-2"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span className="font-medium text-sm">Export Options</span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">PDF</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Excel</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">CSV</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsSlide;
