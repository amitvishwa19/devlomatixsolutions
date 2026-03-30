import * as React from"react";
import { X, Check, ChevronsUpDown } from"lucide-react";
import { Badge } from"@/components/ui/badge";
import { Button } from"@/components/ui/button";
import {
 Command,
 CommandEmpty,
 CommandGroup,
 CommandInput,
 CommandItem,
 CommandList,
} from"@/components/ui/command";
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from"@/components/ui/popover";
import { cn } from"@/lib/utils";



export function RoleSelect({ roles, selected, onChange, placeholder ="Select roles...", className, }) {
 const [open, setOpen] = React.useState(false);

 const handleSelect = (roleId) => {
 if (selected.includes(roleId)) {
 onChange(selected.filter((id) => id !== roleId));
 } else {
 onChange([...selected, roleId]);
 }
 };

 const handleRemove = (roleId, e) => {
 e.stopPropagation();
 onChange(selected.filter((id) => id !== roleId));
 };

 const selectedRoles = roles.filter((role) => selected.includes(role.id));

 return (
 <Popover open={open} onOpenChange={setOpen}>
 <PopoverTrigger asChild>
 <Button
 variant="outline"
 role="combobox"
 aria-expanded={open}
 className={cn(
"w-full justify-between min- h-auto",
 selectedRoles.length > 0 ?"px-2 py-2":"px-3",
 className
 )}
 >
 {selectedRoles.length > 0 ? (
 <div className="flex flex-wrap gap-1">
 {selectedRoles.map((role) => (
 <Badge
 key={role.id}
 variant="secondary"
 className="flex items-center gap-1 pr-1"
 style={role.color ? { borderLeftColor: role.color, borderLeftWidth: 3 } : undefined}
 >
 {role.color && (
 <span
 className="h-2 w-2 rounded-full shrink-0"
 style={{ backgroundColor: role.color }}
 />
 )}
 <span className="truncate max-w-[150px]">{role.title}</span>
 <div
 type="button"
 className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted-foreground/20 p-0.5"
 onClick={(e) => handleRemove(role.id, e)}
 >
 <X className="h-3 w-3 text-muted-foreground hover:text-foreground"/>
 </div>
 </Badge>
 ))}
 </div>
 ) : (
 <span className="text-muted-foreground font-normal">{placeholder}</span>
 )}
 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-[--radix-popover-trigger-width] p-0"align="start">
 <Command>
 <CommandInput placeholder="Search roles..."/>
 <CommandList>
 <CommandEmpty>No roles found.</CommandEmpty>
 <CommandGroup>
 <div className="grid grid-cols-2 gap-1">
 {roles.map((role) => {
 const isSelected = selected.includes(role.id);
 return (
 <CommandItem
 key={role.id}
 value={role.title}
 onSelect={() => handleSelect(role.id)}
 className="cursor-pointer"
 >
 <div
 className={cn(
"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
 isSelected
 ?"bg-primary text-primary-foreground"
 :"opacity-50 [&_svg]:invisible"
 )}
 >
 <Check className="h-3 w-3"/>
 </div>
 <div className="flex items-center gap-2 flex-1">
 {role.color && (
 <span
 className="h-3 w-3 rounded-full shrink-0"
 style={{ backgroundColor: role.color }}
 />
 )}
 <div className="flex flex-col">
 <span className="font-medium">{role.title}</span>
 {role.description && (
 <span className="text-xs text-muted-foreground">
 {role.description}
 </span>
 )}
 </div>
 </div>
 </CommandItem>
 );
 })}
 </div>
 </CommandGroup>
 </CommandList>
 </Command>
 </PopoverContent>
 </Popover>
 );
}