'use client'

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { GitBranch, Activity, Key, BookOpen, Settings, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "workflows", label: "Workflows", icon: GitBranch, path: "" },
  { id: "executions", label: "Executions", icon: Activity, path: "/executions" },
  { id: "credentials", label: "Credentials", icon: Key, path: "/credentials" },
  { id: "templates", label: "Templates", icon: BookOpen, path: "/templates" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { workspaceId } = useParams();

  const isActive = (path) => {
    const fullPath = `/workspace/${workspaceId}/flowbyte${path}`;
    if (path === "") return pathname === fullPath;
    return pathname.startsWith(fullPath);
  };

  return (
    <div className="w-16 lg:w-56 h-screen bg-[#111116] border-r border-[#22222a] flex flex-col shrink-0 z-40 transition-all duration-300 group">
      {/* Logo Area */}
      <div className="h-14 flex items-center px-4 mb-4 mt-2">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20 shrink-0">
          F
        </div>
        <span className="ml-3 font-bold text-white text-base tracking-tight opacity-0 group-hover:opacity-100 transition-opacity lg:opacity-100 hidden lg:block">FlowByte</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={`/workspace/${workspaceId}/flowbyte${item.path}`}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              isActive(item.path)
                ? "bg-primary text-white shadow-lg shadow-primary/10"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <item.icon className={cn("h-5 w-5 shrink-0 transition-transform", isActive(item.path) ? "scale-110" : "")} />
            <span className={cn(
              "text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap lg:opacity-100 hidden lg:block",
              isActive(item.path) ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
            )}>
              {item.label}
            </span>
            {isActive(item.path) && (
              <div className="ml-auto opacity-0 group-hover:opacity-100 lg:opacity-100 hidden lg:block">
                <ChevronRight className="h-3 w-3 opacity-40" />
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 pb-6 space-y-1 mt-auto border-t border-[#22222a] pt-4">
        <Link
          href={`/workspace/${workspaceId}/flowbyte/settings`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            isActive("/settings")
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity lg:opacity-100 hidden lg:block">Settings</span>
        </Link>

        <div className="flex items-center gap-3 px-3 py-4 mt-2 bg-[#1a1a20]/50 rounded-2xl mx-1 shadow-inner border border-[#ffffff05]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-[#ffffff10]">
            JD
          </div>
          <div className="min-w-0 opacity-0 group-hover:opacity-100 lg:opacity-100 hidden lg:block">
            <p className="text-xs font-bold text-zinc-200 truncate leading-none">John Doe</p>
            <p className="text-[10px] text-zinc-500 truncate mt-1">Admin Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
