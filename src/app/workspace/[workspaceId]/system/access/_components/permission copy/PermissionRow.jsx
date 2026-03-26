import { PermissionCheckbox } from "./PermissionCheckbox";
import { MoreHorizontal, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const permissionTypes = ["view", "create", "edit", "delete", "manage", "export", "import"];

export const PermissionRow = ({
    module,
    onPermissionChange,
    onPermissionCreate,
    onEditModule,
    onDeleteModule,
    index,
}) => {
    const getPermission = (type) => {
        return module.permissions[type];
    };

    const getPermissionStatus = (type) => {
        const permission = module.permissions[type];
        return permission?.status ?? false;
    };

    const hasPermission = (type) => {
        return module.permissions[type] !== null;
    };

    const handleCheckboxChange = (type) => {
        const permission = getPermission(type);
        if (permission) {
            onPermissionChange(permission.id, !permission.status);
        } else {
            onPermissionCreate(module.category, type);
        }
    };

    const enabledCount = permissionTypes.filter(
        (type) => hasPermission(type) && getPermissionStatus(type)
    ).length;
    const totalCount = permissionTypes.filter((type) => hasPermission(type)).length;
    const allEnabled = enabledCount === totalCount && totalCount > 0;

    return (
        <tr
            className={cn(
                "border-b border-border/30 hover:bg-muted/20 transition-colors animate-fade-in",
                "group"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <td className="p-2">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "w-2 h-2 rounded-full",
                            allEnabled
                                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                : "bg-primary shadow-[0_0_8px_rgba(14,165,233,0.3)]"
                        )}
                    />
                    <div>
                        <span className="font-medium text-foreground">{module.displayName}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {enabledCount} of {totalCount} enabled
                        </p>
                    </div>
                </div>
            </td>
            {permissionTypes.map((type) => (
                <td key={type} className="p-2 text-center">
                    <div className="flex justify-center">
                        <PermissionCheckbox
                            checked={getPermissionStatus(type)}
                            onChange={() => handleCheckboxChange(type)}
                            exists={hasPermission(type)}
                        />
                    </div>
                </td>
            ))}
            <td className="py-4 px-2 text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem
                            onClick={() => onEditModule(module)}
                            className="cursor-pointer"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Permission
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDeleteModule(module)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Permission
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
};
