"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Users, Kanban, Calendar, BarChart3, Settings, Menu, X,
  Briefcase as Logo, ChevronLeft, UserSearch, FileText, FileCheck, GitCompare,
  PieChart, Zap, Shield, Globe, UsersRound, UserPlus, ScrollText, HelpCircle, MoreVertical
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Assuming ThemeToggle exists in the project or will be handled
// import ThemeToggle from "@/components/ThemeToggle"; 


const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/admin/candidates", icon: Users, label: "Candidates" },
  { href: "/admin/pipeline", icon: Kanban, label: "Pipeline" },
  { href: "/admin/interviews", icon: Calendar, label: "Interviews" },
  { href: "/admin/talent", icon: UserSearch, label: "Talent Pool" },
  { href: "/admin/resume-bank", icon: FileText, label: "Resume Bank" },
  { href: "/admin/offers", icon: FileCheck, label: "Offers" },
  { href: "/admin/compare", icon: GitCompare, label: "Compare" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/reports", icon: PieChart, label: "Reports" },
  { href: "/admin/onboarding", icon: UserPlus, label: "Onboarding" },
  { href: "/admin/workflows", icon: Zap, label: "Workflows" },
  { href: "/admin/compliance", icon: Shield, label: "Compliance" },
  { href: "/admin/career-page", icon: Globe, label: "Career Page" },
  { href: "/admin/team", icon: UsersRound, label: "Team Workload" },
  { href: "/admin/audit-log", icon: ScrollText, label: "Audit Log" },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
            <Logo className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold ">HireFlow</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {/* User profile with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-sidebar-accent transition-colors",
              collapsed && "justify-center"
            )}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground text-xs font-bold flex-shrink-0">
                RK
              </div>
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between min-w-0">
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">Rajesh Kumar</p>
                    <p className="text-xs text-muted-foreground truncate">rajesh@hireflow.in</p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 ml-2 mb-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-foreground text-xs font-bold flex-shrink-0">
                RK
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">Rajesh Kumar</p>
                <p className="text-xs text-muted-foreground truncate">rajesh@hireflow.in</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Briefcase className="h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/help" className="flex items-center gap-2 cursor-pointer">
                <HelpCircle className="h-4 w-4" />
                Get Help
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive">
              <X className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {sidebar}
      </div>

      {/* Mobile sidebar */}
      <div className={cn("lg:hidden", mobileOpen ? "block" : "hidden")}>
        {sidebar}
      </div>
    </>
  );
};

export default AdminSidebar;
export const useSidebarWidth = () => "pl-16 lg:pl-64";
