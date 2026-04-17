import { Shield, ShieldAlert, Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

export function GeneralPermissionForm({
    moduleName,
    categorySlug,
    selectedActions,
    handleSelectAll,
    actionOptions,
    handleActionToggle,
    setCustomActions,
    setSelectedActions,
    newActionName,
    setNewActionName,
    newActionDescription,
    setNewActionDescription,
    handleAddCustomAction,
    description,
    setDescription,
    formatCategoryName
}) {
    return (
        <div className="p-6 space-y-8 pb-10">

            <div className="space-y-4">
                <div className="flex items-center justify-between mx-1">
                    <Label className="text-xs opacity-50 font-bold  ">Operation Scopes ({selectedActions.length})</Label>
                    <div className="flex items-center gap-3 pr-1">
                        <Label htmlFor="select-all-global" className="text-sm opacity-40">Select Global</Label>
                        <Switch
                            id="select-all-global"
                            checked={selectedActions.length === actionOptions.length}
                            onCheckedChange={handleSelectAll}
                            className="scale-75"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {actionOptions.map((action) => (
                        <div
                            key={action.id}
                            onClick={(e) => {
                                handleActionToggle(action.id);
                                e.stopPropagation();
                            }}
                            className={`flex items-start gap-3 p-4 rounded-md border transition-all duration-500 cursor-pointer group ${selectedActions.includes(action.id)
                                ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/5"
                                : "border-border/40 bg-muted/10 hover:border-primary/30 hover:bg-muted/30"
                                }`}
                        >
                            <Checkbox
                                checked={selectedActions.includes(action.id)}
                                onCheckedChange={() => handleActionToggle(action.id)}
                                className="mt-1 transition-transform group-hover:scale-110"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold block mb-0.5">
                                    {action.label}
                                    {action.isCustom && (
                                        <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full  tracking-normal leading-none align-middle">custom</span>
                                    )}
                                </span>
                                <p className="text-xs text-muted-foreground opacity-60 line-clamp-1">{action.description}</p>
                            </div>
                            {action.isCustom && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCustomActions((prev) => prev.filter((a) => a.id !== action.id));
                                        setSelectedActions((prev) => prev.filter((a) => a !== action.id));
                                    }}
                                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}

                    <div className="col-span-2 p-5 rounded-md border border-dashed border-primary/20 bg-primary/[0.02] mt-2 relative overflow-hidden group">

                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                                <Plus className="w-3 h-3 text-primary font-bold" />
                            </div>
                            <span className="text-xs text-primary/80">Extended Action</span>
                        </div>
                        <div className="space-y-3 relative z-10">
                            <Input
                                value={newActionName}
                                onChange={(e) => setNewActionName(e.target.value)}
                                placeholder="Action identifier (e.g. Audit)"
                                className="bg-background border-border/40 rounded-md text-xs"
                            />
                            <Input
                                value={newActionDescription}
                                onChange={(e) => setNewActionDescription(e.target.value)}
                                placeholder="Contextual description"
                                className="bg-background border-border/40 rounded-md text-xs"
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                onClick={handleAddCustomAction}
                                disabled={!newActionName.trim()}
                                className="w-full rounded-md shadow-lg shadow-primary/10"
                            >
                                Append Scoped Action
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="description" className="text-xs opacity-50 ml-1">Module Context</Label>
                <Textarea
                    id="description"
                    rows='6'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-secondary/30 border border-primary/10 rounded-md resize-none min-h-[100px] p-4 text-xs"
                    placeholder={`High-level overview of the ${formatCategoryName(categorySlug || "module")} scope...`}
                />
            </div>

            {moduleName && selectedActions.length > 0 && (
                <div className="p-6 rounded-md bg-primary/3 border border-primary/10 space-y-4 shadow-inner">
                    <p className="text-xs font-bold  text-primary  opacity-60">Security Manifest Preview</p>
                    <div className="grid grid-cols-2 gap-3">
                        {selectedActions.map((action) => (
                            <div key={action} className="text-[11px] p-3 rounded-md bg-background/80 border border-border/30 shadow-sm flex flex-col gap-1">
                                <span className="font-bold text-foreground">
                                    {action.charAt(0).toUpperCase() + action.slice(1)}{""}
                                    {formatCategoryName(categorySlug)}
                                </span>
                                <span className="font-mono text-[9px] text-primary/70">
                                    {categorySlug}.{action}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
