import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import React from "react";

export const navigationItems = [
    // DASHBOARD
    { title: "Dashboard", url: "/", icon: "layout-dashboard", category: "Dashboard" },

    // OPERATIONS
    { title: "Workflow", url: "workflow", icon: "workflow", category: "Operations" },
    { title: "Appointment", url: "appointment", icon: "calendar", category: "Operations" },
    { title: "Calendar", url: "calendar", icon: "calendar-days", category: "Operations" },
    { title: "Kanban", url: "kanban", icon: "file-text", category: "Operations" },
    { title: "Documents", url: "document", icon: "file-text", category: "Operations" },
    { title: "Articles", url: "article", icon: "book-open", category: "Operations" },
    { title: "Taxonomy", url: "taxonomy", icon: "tags", category: "Operations" },

    // CLINICAL
    { title: "Patients", url: "patient", icon: "users", category: "Clinical" },
    { title: "Prescriptions", url: "prescription", icon: "pill", category: "Clinical" },
    { title: "Services", url: "services", icon: "stethoscope", category: "Clinical" },
    { title: "Laboratory", url: "laboratory", icon: "flask-conical", category: "Clinical" },
    { title: "Rooms & Beds", url: "accomodation", icon: "bed-double", category: "Clinical" },
    { title: "Pharmacy", url: "pharmacy", icon: "cross", category: "Clinical" },

    // ADMINISTRATION
    { title: "Inventory", url: "inventory", icon: "package", category: "Administration" },

    // FINANCE
    { title: "Invoices", url: "invoice", icon: "receipt", category: "Finance" },
    { title: "Payments", url: "payment", icon: "credit-card", category: "Finance" },

    // COMMUNICATION
    { title: "Communication", url: "communication", icon: "message-square", category: "Communication" },
    { title: "Mailbox", url: "mailer", icon: "mails", category: "Communication" },

    // SYSTEM
    { title: "Development", url: "dev", icon: "combine", category: "System" },
    { title: "Access Management", url: "access", icon: "shield-user", category: "System" },
];

// Convert kebab-case to PascalCase for icon lookup
const getIconComponent = (iconName) => {
    const pascalCase = iconName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
    const IconsRecord = Icons;
    return IconsRecord[pascalCase] || Icons.Circle;
};

// Group items by category
const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
        acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
}, {});

const categories = Object.keys(groupedItems);



const ListItem = React.forwardRef(
    ({ className, title, icon, href, ...props }, ref) => {
        const IconComponent = getIconComponent(icon);
        return (
            <li>
                <NavigationMenuLink asChild>
                    <a
                        ref={ref}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            className
                        )}
                        {...props}
                    >
                        <IconComponent className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{title}</span>
                    </a>
                </NavigationMenuLink>
            </li>
        );
    }
);
ListItem.displayName = "ListItem";

export function AppTopNav() {
    const dashboardItem = navigationItems.find((item) => item.category === "Dashboard");

    return (
        <div className="w-full border-b border-border bg-card shadow-sm">
            <div className="container flex h-14 items-center">
                <div className="mr-6 flex items-center gap-2">
                    <Icons.Activity className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg text-foreground">MediCare</span>
                </div>

                <NavigationMenu>
                    <NavigationMenuList>
                        {/* Dashboard - Direct link */}
                        {dashboardItem && (
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    href={dashboardItem.url}
                                    className={navigationMenuTriggerStyle()}
                                >
                                    <Icons.LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}

                        {/* Other categories as dropdowns */}
                        {categories
                            .filter((cat) => cat !== "Dashboard")
                            .map((category) => (
                                <NavigationMenuItem key={category}>
                                    <NavigationMenuTrigger className="bg-transparent">
                                        {category}
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[300px] gap-1 p-2 md:w-[400px] md:grid-cols-2">
                                            {groupedItems[category].map((item) => (
                                                <ListItem
                                                    key={item.title}
                                                    title={item.title}
                                                    href={item.url}
                                                    icon={item.icon}
                                                />
                                            ))}
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            ))}
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="ml-auto flex items-center gap-2">
                    <button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Icons.Bell className="h-5 w-5" />
                    </button>
                    <button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Icons.Settings className="h-5 w-5" />
                    </button>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        JD
                    </div>
                </div>
            </div>
        </div>
    );
}
