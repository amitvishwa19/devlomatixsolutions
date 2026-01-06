import { cn } from "@/lib/utils";

const departments = [
  { name: "Cardiology", patients: 156, capacity: 200, color: "bg-primary" },
  { name: "Neurology", patients: 89, capacity: 120, color: "bg-chart-2" },
  { name: "Orthopedics", patients: 134, capacity: 150, color: "bg-chart-3" },
  { name: "Pediatrics", patients: 78, capacity: 100, color: "bg-chart-4" },
  { name: "Oncology", patients: 67, capacity: 80, color: "bg-chart-5" },
];

export function DepartmentStats() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Department Load</h3>
        <p className="text-xs text-muted-foreground">Current patient distribution</p>
      </div>

      <div className="space-y-3">
        {departments.map((dept) => {
          const percentage = Math.round((dept.patients / dept.capacity) * 100);
          return (
            <div key={dept.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{dept.name}</span>
                <span className="text-muted-foreground text-xs">
                  {dept.patients}/{dept.capacity} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", dept.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
