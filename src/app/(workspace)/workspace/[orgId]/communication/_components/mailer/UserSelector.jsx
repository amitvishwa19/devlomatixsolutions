import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, X, User as UserIcon, Stethoscope, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockUsers, searchUsers } from "../../_lib/mockUsers";

const getRoleIcon = (role) => {
    switch (role) {
        case "doctor":
            return <Stethoscope className="w-3 h-3" />;
        case "staff":
            return <Building2 className="w-3 h-3" />;
        default:
            return <UserIcon className="w-3 h-3" />;
    }
};

const getRoleBadgeClass = (role) => {
    switch (role) {
        case "doctor":
            return "bg-primary/10 text-primary border-primary/20";
        case "staff":
            return "bg-accent/10 text-accent border-accent/20";
        default:
            return "bg-secondary text-secondary-foreground";
    }
};

export const UserSelector = ({
    selectedUsers,
    onSelect,
    onRemove,
    multiple = true,
}) => {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredUsers = useMemo(() => {
        let users = search ? searchUsers(search) : mockUsers;
        if (roleFilter !== "all") {
            users = users.filter((u) => u.role === roleFilter);
        }
        return users;
    }, [search, roleFilter]);

    const isSelected = (userId) =>
        selectedUsers.some((u) => u.id === userId);

    const handleUserClick = (user) => {
        if (isSelected(user.id)) {
            onRemove(user.id);
        } else {
            onSelect(user);
        }
    };

    return (
        <div className="space-y-4">
            {/* Selected Users */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                        <Badge
                            key={user.id}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 gap-1 bg-primary/10 text-primary border border-primary/20"
                        >
                            <span className="max-w-[150px] truncate">{user.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 hover:bg-primary/20 rounded-full"
                                onClick={() => onRemove(user.id)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Role Filters */}
            <div className="flex gap-2 flex-wrap">
                {["all", "patient", "doctor", "staff"].map((role) => (
                    <Button
                        key={role}
                        variant={roleFilter === role ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRoleFilter(role)}
                        className={cn(
                            "capitalize text-xs",
                            roleFilter === role && "gradient-primary text-primary-foreground"
                        )}
                    >
                        {role === "all" ? "All" : role + "s"}
                    </Button>
                ))}
            </div>

            {/* User List */}
            <ScrollArea className="h-[200px] border rounded-lg">
                <div className="p-2 space-y-1">
                    {filteredUsers.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                                "hover:bg-muted/50",
                                isSelected(user.id) && "bg-primary/5 border border-primary/20"
                            )}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn("text-xs gap-1", getRoleBadgeClass(user.role))}
                            >
                                {getRoleIcon(user.role)}
                                {user.role}
                            </Badge>
                            {isSelected(user.id) && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                        </button>
                    ))}
                    {filteredUsers.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-8">
                            No users found
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
