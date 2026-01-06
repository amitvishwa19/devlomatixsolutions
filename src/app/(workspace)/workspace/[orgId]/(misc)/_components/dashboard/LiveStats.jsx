import { useState, useEffect } from "react";
import { Heart, Thermometer, Droplet, Activity } from "lucide-react";

const stats = [
  { label: "Heart Rate", value: 72, unit: "bpm", icon: Heart, fluctuation: [70, 73, 71, 74, 72, 75] },
  { label: "Temperature", value: 98.6, unit: "°F", icon: Thermometer, fluctuation: [98.4, 98.6, 98.5, 98.7, 98.6, 98.5] },
  { label: "O2 Level", value: 98, unit: "%", icon: Droplet, fluctuation: [97, 98, 99, 98, 97, 98] },
  { label: "Pulse", value: 68, unit: "bpm", icon: Activity, fluctuation: [66, 68, 70, 67, 69, 68] },
];

export function LiveStats() {
  const [currentValues, setCurrentValues] = useState(stats.map(s => s.value));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => (prev + 1) % 6);
      setCurrentValues(stats.map(s => s.fluctuation[tick]));
    }, 2000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Live Vitals</h3>
          <p className="text-xs text-muted-foreground">Patient monitoring</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className="rounded-lg bg-secondary/30 p-3 text-center"
          >
            <stat.icon className="h-4 w-4 mx-auto text-primary mb-2" />
            <p className="text-lg font-semibold text-foreground">
              {currentValues[index]}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">{stat.unit}</span>
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
