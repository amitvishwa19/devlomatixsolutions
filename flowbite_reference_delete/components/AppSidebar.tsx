import { NavLink, useLocation } from "react-router-dom";
import {
  GitBranch,
  Play,
  Key,
  Settings,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuth } from "@/flowbite/hooks/useAuth";

const navItems = [
  { label: "Workflows", path: "/", icon: GitBranch },
  { label: "Executions", path: "/executions", icon: Play },
  { label: "Credentials", path: "/credentials", icon: Key },
  { label: "Templates", path: "/templates", icon: LayoutTemplate },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside
      className={`h-screen bg-n8n-sidebar flex flex-col transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="h-12 flex items-center px-3 gap-2.5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">n8n</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path)) ||
            (item.path === "/" && location.pathname.startsWith("/workflow"));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-n8n-sidebar-hover text-sidebar-accent-foreground"
                  : "text-n8n-sidebar-fg hover:bg-n8n-sidebar-hover hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Theme switcher + Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {user && !collapsed && (
          <div className="px-2.5 py-1.5 text-xs text-n8n-sidebar-fg truncate">
            {user.email}
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-n8n-sidebar-fg hover:bg-n8n-sidebar-hover hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <ThemeSwitcher collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 rounded-md text-n8n-sidebar-fg hover:bg-n8n-sidebar-hover hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
