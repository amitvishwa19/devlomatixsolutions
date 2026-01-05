import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const data = [
  { month: "Jan", inpatients: 120, outpatients: 240, emergency: 45 },
  { month: "Feb", inpatients: 150, outpatients: 280, emergency: 52 },
  { month: "Mar", inpatients: 180, outpatients: 320, emergency: 48 },
  { month: "Apr", inpatients: 140, outpatients: 290, emergency: 61 },
  { month: "May", inpatients: 200, outpatients: 350, emergency: 55 },
  { month: "Jun", inpatients: 170, outpatients: 310, emergency: 42 },
];

export function PatientOverview() {
  const [chartType, setChartType] = useState("area");

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card rounded-lg p-3 border border-border shadow-lg">
          <p className="font-medium text-foreground mb-2 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ background: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Patient Overview</h3>
          <p className="text-xs text-muted-foreground">Monthly admissions trend</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-success">
            <TrendingUp className="h-3 w-3" />
            <span>+12.5%</span>
          </div>
          <div className="flex rounded-md bg-secondary p-0.5">
            <button
              onClick={() => setChartType("area")}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-all",
                chartType === "area" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Area
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-all",
                chartType === "bar" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInpatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 90%, 55%)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="hsl(210, 90%, 55%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutpatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 55%, 42%)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="hsl(152, 55%, 42%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 85%, 52%)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="hsl(38, 85%, 52%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(220, 14%, 16%)" 
                vertical={false} 
              />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="outpatients" 
                stroke="hsl(152, 55%, 42%)" 
                strokeWidth={1.5}
                fillOpacity={1} 
                fill="url(#colorOutpatients)" 
                name="Outpatients"
              />
              <Area 
                type="monotone" 
                dataKey="inpatients" 
                stroke="hsl(210, 90%, 55%)" 
                strokeWidth={1.5}
                fillOpacity={1} 
                fill="url(#colorInpatients)" 
                name="Inpatients"
              />
              <Area 
                type="monotone" 
                dataKey="emergency" 
                stroke="hsl(38, 85%, 52%)" 
                strokeWidth={1.5}
                fillOpacity={1} 
                fill="url(#colorEmergency)" 
                name="Emergency"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(220, 14%, 16%)" 
                vertical={false} 
              />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="inpatients" fill="hsl(210, 90%, 55%)" radius={[3, 3, 0, 0]} name="Inpatients" />
              <Bar dataKey="outpatients" fill="hsl(152, 55%, 42%)" radius={[3, 3, 0, 0]} name="Outpatients" />
              <Bar dataKey="emergency" fill="hsl(38, 85%, 52%)" radius={[3, 3, 0, 0]} name="Emergency" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Inpatients</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Outpatients</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Emergency</span>
        </div>
      </div>
    </div>
  );
}
