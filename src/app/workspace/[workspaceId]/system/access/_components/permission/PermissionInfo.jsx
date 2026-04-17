import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const colorOptions = [
    { id: "emerald", label: "Emerald", color: "#15803D" },
    { id: "blue", label: "Blue", color: "#2563EB" },
    { id: "purple", label: "Purple", color: "#9333EA" },
    { id: "amber", label: "Amber", color: "#F59E0B" },
    { id: "rose", label: "Rose", color: "#F43F5E" },
    { id: "cyan", label: "Cyan", color: "#06B6D4" },
    { id: "orange", label: "Orange", color: "#F97316" },
    { id: "teal", label: "Teal", color: "#14B8A6" },
];

export function PermissionInfo({
    moduleName,
    setModuleName,
    categorySlug,
    selectedColor,
    setSelectedColor
}) {
    return (
        <div id="moduleIdentity" className="space-y-4">
            <div className="grid gap-2 p-1">
                <Label htmlFor="moduleName" className="text-xs opacity-50 ml-1">Module Identity</Label>
                <Input
                    id="moduleName"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="bg-secondary/30 border border-primary/20   rounded-md text-lg font-medium focus:ring-primary/20"
                    placeholder="e.g. Content Analytics"
                />
                {moduleName && (
                    <div className="flex items-center gap-2 ml-1">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <p className="text-xs text-muted-foreground font-mono opacity-60">
                            System Slug: <span className="text-primary">{categorySlug}</span>
                        </p>
                    </div>
                )}
            </div>

            <div className="grid gap-3">
                <Label className="text-xs opacity-50 ml-1">Visual Signature</Label>
                <div className="flex flex-wrap gap-2.5 p-3 rounded-md bg-secondary/20 border border-border/30">
                    {colorOptions.map((color) => (
                        <button
                            key={color.id}
                            type="button"
                            onClick={() => setSelectedColor(color.id)}
                            className={`w-6 h-6 rounded-md transition-all duration-300 relative group cursor-pointer ${selectedColor === color.id
                                ? "ring-2 ring-primary ring-offset-0 ring-offset-background scale-110 shadow-lg"
                                : "hover:scale-110 opacity-60 hover:opacity-100"
                                }`}
                            style={{ backgroundColor: color.color }}
                            title={color.label}
                        >
                            {selectedColor === color.id && <div className="absolute inset-0 rounded-md bg-white/20 animate-pulse" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
