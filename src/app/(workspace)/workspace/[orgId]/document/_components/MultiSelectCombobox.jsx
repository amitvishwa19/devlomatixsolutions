import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

const roleColors = { doctor: "bg-blue-500/20 text-blue-400 border-blue-500/30", nurse: "bg-green-500/20 text-green-400 border-green-500/30", admin: "bg-purple-500/20 text-purple-400 border-purple-500/30", technician: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
const roleLabels = { doctor: "Doctor", nurse: "Nurse", admin: "Admin", technician: "Tech" };
const departmentLabels = { cardiology: "Cardiology", radiology: "Radiology", emergency: "Emergency", surgery: "Surgery", general: "General" };
const departmentIcons = { cardiology: "❤️", radiology: "📡", emergency: "🚨", surgery: "🏥", general: "🩺" };

function getInitials(name) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }
function getAvatarColor(name) { const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500", "bg-indigo-500", "bg-rose-500"]; return colors[name.charCodeAt(0) % colors.length]; }

export function MultiSelectCombobox({ options, selected, onChange, placeholder = "Select...", searchPlaceholder = "Search...", emptyMessage = "No results found.", className, recentIds = [], groupByDepartment = true }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const handleSelect = (value) => { if (selected.includes(value)) onChange(selected.filter((v) => v !== value)); else onChange([...selected, value]); };
  const handleRemove = (value, e) => { e.stopPropagation(); onChange(selected.filter((v) => v !== value)); };
  const handleSelectAll = () => { if (selected.length === options.length) onChange([]); else onChange(options.map((opt) => opt.value)); };
  const filteredOptions = useMemo(() => { if (!search) return options; const s = search.toLowerCase(); return options.filter((opt) => opt.label.toLowerCase().includes(s) || opt.role?.toLowerCase().includes(s) || opt.department?.toLowerCase().includes(s)); }, [options, search]);
  const recentOptions = useMemo(() => filteredOptions.filter((opt) => recentIds.includes(opt.value)), [filteredOptions, recentIds]);
  const groupedOptions = useMemo(() => { if (!groupByDepartment) return { ungrouped: filteredOptions }; const groups = {}; filteredOptions.forEach((opt) => { if (recentIds.includes(opt.value)) return; const dept = opt.department || "general"; if (!groups[dept]) groups[dept] = []; groups[dept].push(opt); }); return groups; }, [filteredOptions, groupByDepartment, recentIds]);
  const selectedOptions = selected.map((value) => options.find((opt) => opt.value === value)).filter(Boolean);
  const isAllSelected = selected.length === options.length && options.length > 0;
  const renderUserItem = (option) => (<CommandItem key={option.value} value={option.label} onSelect={() => handleSelect(option.value)} className="cursor-pointer py-2"><div className="flex items-center gap-3 w-full"><Checkbox checked={selected.includes(option.value)} className="pointer-events-none" /><Avatar className="h-8 w-8"><AvatarFallback className={cn("text-xs text-white", getAvatarColor(option.label))}>{getInitials(option.label)}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-medium text-sm truncate">{option.label}</span>{option.role && <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", roleColors[option.role])}>{roleLabels[option.role]}</Badge>}</div>{option.department && <span className="text-xs text-muted-foreground">{departmentIcons[option.department]} {departmentLabels[option.department]}</span>}</div></div></CommandItem>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={open} className={cn("justify-between min-w-[200px] h-auto min-h-10 bg-background", className)}><div className="flex flex-wrap gap-1 flex-1">{selected.length === 0 ? <span className="text-muted-foreground">{placeholder}</span> : selectedOptions.slice(0, 3).map((option) => <Badge key={option.value} variant="secondary" className="gap-1 pr-1"><Avatar className="h-4 w-4"><AvatarFallback className={cn("text-[8px] text-white", getAvatarColor(option.label))}>{getInitials(option.label)}</AvatarFallback></Avatar><span className="max-w-[80px] truncate">{option.label.split(" ")[0]}</span><X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={(e) => handleRemove(option.value, e)} /></Badge>)}{selectedOptions.length > 3 && <Badge variant="secondary" className="gap-1">+{selectedOptions.length - 3} more</Badge>}</div><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 z-50 bg-popover" align="start"><Command shouldFilter={false}><CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} /><CommandList className="max-h-[300px]"><CommandEmpty>{emptyMessage}</CommandEmpty><CommandGroup><CommandItem onSelect={handleSelectAll} className="cursor-pointer py-2 border-b border-border"><div className="flex items-center gap-3 w-full"><Checkbox checked={isAllSelected} className="pointer-events-none" /><Users className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-sm">{isAllSelected ? "Deselect All" : "Select All"}</span><Badge variant="outline" className="ml-auto text-xs">{options.length}</Badge></div></CommandItem></CommandGroup>{recentOptions.length > 0 && <><CommandGroup heading={<div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" />Recent</div>}>{recentOptions.map(renderUserItem)}</CommandGroup><CommandSeparator /></>}{groupByDepartment ? Object.entries(groupedOptions).map(([dept, opts]) => { if (opts.length === 0) return null; return <CommandGroup key={dept} heading={<div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{departmentIcons[dept] || "🏥"}</span>{departmentLabels[dept] || dept}</div>}>{opts.map(renderUserItem)}</CommandGroup>; }) : <CommandGroup>{filteredOptions.map(renderUserItem)}</CommandGroup>}</CommandList></Command></PopoverContent>
    </Popover>
  );
}
