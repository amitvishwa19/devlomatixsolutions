import { useState } from "react";
import LoadingScreen from "@/carewell/components/LoadingScreen";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings,
  Bell,
  Search,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">H</span>
          </div>
          <span className="font-bold text-xl">Hospital<span className="text-primary">HMS</span></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
          </Button>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">A</AvatarFallback>
            </Avatar>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-border bg-muted/30 p-4">
          <nav className="space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: Users, label: "Patients" },
              { icon: Calendar, label: "Appointments" },
              { icon: FileText, label: "Reports" },
              { icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, Amit!</h1>
            <p className="text-muted-foreground">Here's what's happening with your hospital today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Patients", value: "2,847", change: "+12%", color: "text-teal-500" },
              { label: "Appointments", value: "148", change: "+8%", color: "text-blue-500" },
              { label: "Available Beds", value: "42", change: "-3%", color: "text-amber-500" },
              { label: "Staff on Duty", value: "126", change: "+2%", color: "text-purple-500" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-xl border border-border bg-card">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span> from last month
                </p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "New patient registered", time: "2 minutes ago", user: "Dr. Priya Sharma" },
                { action: "Appointment completed", time: "15 minutes ago", user: "Dr. Rajesh Kumar" },
                { action: "Lab report uploaded", time: "1 hour ago", user: "Lab Technician" },
                { action: "Prescription issued", time: "2 hours ago", user: "Dr. Amit Singh" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
