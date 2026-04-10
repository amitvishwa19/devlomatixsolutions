import { Check, Plus } from"lucide-react";
import { cn } from"@/lib/utils";


export const PermissionCheckbox = ({
 checked,
 onChange,
 disabled = false,
 exists = true,
}) => {
 if (!exists) {
 return (
 <button
 onClick={onChange}
 disabled={disabled}
 className={cn(
"w-4 h-4 rounded border-2 border-dashed flex items-center justify-center transition-all duration-200",
"border-muted-foreground/30 hover:border-primary/60 bg-transparent",
 disabled &&"opacity-50 cursor-not-allowed",
 !disabled &&"cursor-pointer hover:scale-110"
 )}
 title="Click to create this permission"
 >
 <Plus className="w-3 h-3 text-muted-foreground/50"/>
 </button>
 );
 }

 return (
 <button
 onClick={onChange}
 disabled={disabled}
 className={cn(
"w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200",
 checked
 ?"bg-primary border-primary glow-primary"
 :"border-muted-foreground/40 hover:border-primary/60 bg-transparent",
 disabled &&"opacity-50 cursor-not-allowed",
 !disabled &&"cursor-pointer hover:scale-110"
 )}
 >
 {checked && (
 <Check className="w-3.5 h-3.5 text-primary-foreground animate-scale-in"/>
 )}
 </button>
 );
};