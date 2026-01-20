'use client'
import { useState } from "react";
import {
    LayoutDashboard,
    Workflow,
    CalendarDays,
    Calendar,
    Columns3,
    FileText,
    Newspaper,
    Tags,
    Users,
    FileEdit,
    Stethoscope,
    FlaskConical,
    BedDouble,
    Package,
    Receipt,
    CreditCard,
    Pill,
    MessageSquare,
    Mail,
    Code2,
    ShieldCheck,
    ChevronDown,
    Activity,
    Menu,
    X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import Link from "next/link";

// Utility function - self-contained
function cn(...inputs) {
    return twMerge(clsx(inputs));
}





// Navigation Data
const navigationItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    {
        label: "Operations",
        icon: Workflow,
        items: [
            { label: "Workflow", href: "/workflow", icon: Workflow },
            { label: "Appointment", href: "/appointment", icon: CalendarDays },
            { label: "Calendar", href: "/calendar", icon: Calendar },
            { label: "Kanban", href: "/kanban", icon: Columns3 },
        ],
    },
    {
        label: "Records",
        icon: FileText,
        items: [
            { label: "Documents", href: "/documents", icon: FileText },
            { label: "Articles", href: "/articles", icon: Newspaper },
            { label: "Taxonomy", href: "/taxonomy", icon: Tags },
            { label: "Patients", href: "/patients", icon: Users },
            { label: "Prescriptions", href: "/prescriptions", icon: FileEdit },
        ],
    },
    {
        label: "Clinical",
        icon: Stethoscope,
        items: [
            { label: "Services", href: "/services", icon: Stethoscope },
            { label: "Laboratory", href: "/laboratory", icon: FlaskConical },
            { label: "Rooms & Beds", href: "/rooms-beds", icon: BedDouble },
            { label: "Pharmacy", href: "/pharmacy", icon: Pill },
        ],
    },
    {
        label: "Finance",
        icon: CreditCard,
        items: [
            { label: "Invoices", href: "/invoices", icon: Receipt },
            { label: "Payments", href: "/payments", icon: CreditCard },
            { label: "Inventory", href: "/inventory", icon: Package },
        ],
    },
    {
        label: "Communication",
        icon: MessageSquare,
        items: [
            { label: "Messages", href: "/communication", icon: MessageSquare },
            { label: "Mailbox", href: "/mailbox", icon: Mail },
        ],
    },
    {
        label: "Admin",
        icon: ShieldCheck,
        items: [
            { label: "Development", href: "/development", icon: Code2 },
            { label: "Access Management", href: "/access-management", icon: ShieldCheck },
        ],
    },
];

// Type Guard
function isNavGroup(item) {
    return "items" in item;
}



function DropdownMenu({ group, isOpen, onMouseEnter, onMouseLeave }) {

    // const isActive = group.items.some((item) => location.pathname === item.href);
    const Icon = group.icon;

    return (
        <div
            className="relative"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <button
                className={cn(
                    "nav-item",
                    // isActive && "nav-item-active"
                )}
            >
                <Icon className="h-4 w-4" />
                <span>{group.label}</span>
                <ChevronDown
                    className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <div
                className={cn(
                    "nav-dropdown",
                    isOpen && "nav-dropdown-visible"
                )}
            >
                {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    // const isItemActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "nav-dropdown-item",
                                // isItemActive && "bg-primary/10 text-primary"
                            )}
                        >
                            <ItemIcon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

// Main TopNav Component
export function AppTopNav() {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    return (
        <nav className="bg-nav sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-nav-active">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-white hidden sm:block">
                            MediCare HMS
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navigationItems.map((item) => {
                            if (isNavGroup(item)) {
                                return (
                                    <DropdownMenu
                                        key={item.label}
                                        group={item}
                                        isOpen={openDropdown === item.label}
                                        onMouseEnter={() => setOpenDropdown(item.label)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    />
                                );
                            }

                            const Icon = item.icon;
                            // const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                // className={cn("nav-item", isActive && "nav-item-active")}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden p-2 rounded-lg text-nav-foreground hover:bg-nav-hover transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-nav-hover">
                    <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
                        {navigationItems.map((item) => {
                            if (isNavGroup(item)) {
                                const GroupIcon = item.icon;
                                return (
                                    <div key={item.label} className="space-y-1">
                                        <div className="nav-item text-nav-foreground/60 cursor-default">
                                            <GroupIcon className="h-4 w-4" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        <div className="pl-6 space-y-1">
                                            {item.items.map((subItem) => {
                                                const SubIcon = subItem.icon;
                                                // const isActive = location.pathname === subItem.href;
                                                return (
                                                    <Link
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        className={cn(
                                                            "nav-item",
                                                            // isActive && "nav-item-active"
                                                        )}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <SubIcon className="h-4 w-4" />
                                                        <span>{subItem.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            const Icon = item.icon;
                            const isActive = 'true';
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn("nav-item", isActive && "nav-item-active")}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default AppTopNav;
