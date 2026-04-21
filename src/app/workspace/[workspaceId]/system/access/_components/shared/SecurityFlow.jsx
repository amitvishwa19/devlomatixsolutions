import React from "react";
import { Shield, Key, Layers, ArrowRight, Info, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { titleCaseLabel } from "@/utils/functions";

export function SecurityFlow({ role, permissions, activePermissions }) {
    // This component visualizes the impact of the current security selections
    // Aligned with the high-fidelity styling of GeneralRoleForm

    return (
        <div className="p-6 space-y-6 bg-background/20">
            {/* Header / Info bar - aligned with Accordion styles */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/40 border border-primary/10 shadow-sm">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                    <Info className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                    <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest">
                        Security Impact Analysis
                    </h4>
                    <p className="text-[10px] text-muted-foreground opacity-60">
                        Live visualization of structural reach & permission chain
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
                {/* Column 1: Role - Matches General Category styling */}
                <div className="flex flex-col gap-4 p-5 rounded-lg bg-muted/5 border border-border/40 relative group/col hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Identity Hub</h4>
                    </div>
                    
                    <div 
                        className="p-4 rounded-md border border-primary/20 bg-card/50 shadow-md relative overflow-hidden transition-all group-hover/col:shadow-lg group-hover/col:shadow-primary/5"
                        style={{ borderLeft: `4px solid ${role?.color || '#0d9488'}` }}
                    >
                        <p className="text-[13px] font-bold truncate tracking-tight">{titleCaseLabel(role?.title || 'New Role')}</p>
                        <p className="text-[10px] text-muted-foreground opacity-70 line-clamp-2 mt-1 italic">{role?.description || 'Defining new operational boundary'}</p>
                    </div>

                    {role?.parentId && (
                        <div className="mt-auto p-2.5 rounded-md bg-primary/5 border border-dashed border-primary/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-700">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                            <span className="text-[9px] font-bold text-primary/70 uppercase tracking-tighter">Inheritance active</span>
                        </div>
                    )}
                </div>

                {/* Connection Arrow 1 */}
                <div className="hidden md:flex items-center justify-center opacity-30 mt-8">
                    <div className="relative">
                        <ArrowRight className="w-5 h-5 text-primary" />
                        <div className="absolute inset-0 blur-md bg-primary/20 scale-150" />
                    </div>
                </div>

                {/* Column 2: Access Perimeter - Matches Permission Item styling */}
                <div className="flex flex-col gap-4 p-5 rounded-lg bg-muted/5 border border-border/40 relative group/col hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
                            <Key className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Access Perimeter</h4>
                    </div>
                    
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                        {activePermissions?.length > 0 ? (
                            activePermissions.map((perm) => (
                                <div key={perm.id} className="flex items-center gap-3 p-2.5 rounded-md border border-primary/10 bg-background/40 group/item hover:bg-primary/5 transition-all">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/item:bg-primary group-hover/item:shadow-[0_0_8px_rgba(13,148,136,0.8)] transition-all" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold truncate group-hover/item:text-primary transition-colors">{titleCaseLabel(perm.title)}</span>
                                        <span className="text-[8px] font-mono opacity-40">{perm.value}</span>
                                    </div>
                                    <Badge variant="outline" className="ml-auto h-4 text-[7px] border-primary/20 text-primary/70 bg-primary/5 px-1 font-bold uppercase">
                                        {perm.value.split('.')[1]}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30 space-y-2">
                                <Key className="w-8 h-8" />
                                <p className="text-[9px] font-bold uppercase tracking-widest">No grants detected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Connection Arrow 2 */}
                <div className="hidden md:flex items-center justify-center opacity-30 mt-8">
                    <div className="relative">
                        <ArrowRight className="w-5 h-5 text-primary" />
                        <div className="absolute inset-0 blur-md bg-primary/20 scale-150" />
                    </div>
                </div>

                {/* Column 3: Functional Impact */}
                <div className="flex flex-col gap-4 p-5 rounded-lg bg-muted/5 border border-border/40 relative group/col hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">System Reach</h4>
                    </div>
                    
                    <div className="p-4 rounded-md border border-primary/10 bg-card/40 shadow-inner">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">Modules Impacted</span>
                            <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 shadow-[0_0_10px_rgba(13,148,136,0.1)]">
                                <span className="text-[11px] font-black text-primary">{new Set(activePermissions?.map(p => p.category)).size}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mt-6">
                            <div className="relative h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000 shadow-[2px_0_10px_rgba(13,148,136,0.6)]" 
                                    style={{ width: `${Math.min(100, (activePermissions?.length / 20) * 100)}%` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full h-full animate-shimmer" />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-40">Perimeter Coverage</p>
                                <p className="text-[10px] text-primary/60 italic text-center leading-relaxed">
                                    Operational grants mapped across structural boundaries
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
