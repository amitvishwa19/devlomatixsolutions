const categories = [
  { name: "Medical Records", count: 892, percentage: 31 },
  { name: "Lab Reports", count: 654, percentage: 23 },
  { name: "Prescriptions", count: 512, percentage: 18 },
  { name: "Imaging", count: 398, percentage: 14 },
  { name: "Consent Forms", count: 245, percentage: 9 },
  { name: "Administrative", count: 146, percentage: 5 },
];

export function CategoryBreakdown() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Categories</h3>
        <p className="text-xs text-muted-foreground">Document distribution</p>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">{category.name}</span>
              <span className="text-muted-foreground">
                {category.count} ({category.percentage}%)
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-primary/60"
                style={{ width: `${category.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
