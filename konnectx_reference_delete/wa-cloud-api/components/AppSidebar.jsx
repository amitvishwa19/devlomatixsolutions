import { useState } from "react";
import { Activity, BarChart3, BookOpen, Bot, BookTemplate, ChevronRight, ClipboardList, ContactRound, FileSpreadsheet, Filter, Image, Inbox, LineChart, MessageSquare, Phone, Rocket, Settings, Sparkles, Webhook, MessagesSquare, ScrollText, Merge, Wallet, Send } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const nav = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "stream", label: "Stream", icon: Activity },
  { id: "messages", label: "Messages", icon: MessagesSquare },
  { id: "send", label: "Send", icon: MessageSquare },
  {
    id: "contacts",
    label: "Contacts",
    icon: ContactRound,
    children: [
      { id: "contacts", label: "All contacts", icon: ContactRound },
      { id: "import-export", label: "Import / Export", icon: FileSpreadsheet },
      { id: "duplicates", label: "Duplicate merge", icon: Merge },
    ],
  },
  { id: "segments", label: "Segments", icon: Filter },
  { id: "templates", label: "Templates", icon: BookTemplate },
  { id: "flows", label: "Flows", icon: ClipboardList },
  { id: "automation", label: "Automation", icon: Bot },
  { id: "campaigns", label: "Campaigns", icon: Rocket },
  { id: "media", label: "Media", icon: Image },
  { id: "webhooks", label: "Webhooks out", icon: Send },
  { id: "billing", label: "Usage & billing", icon: Wallet },
  { id: "docs", label: "Docs", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ view, setView }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isChildActive = (item) => item.children?.some((c) => c.id === view);
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    nav.forEach((item) => { if (item.children && isChildActive(item)) init[item.id] = true; });
    return init;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Phone className="h-4.5 w-4.5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">KonnectX</p>
              <p className="truncate text-[11px] text-muted-foreground">WhatsApp business suite</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                if (item.children) {
                  const groupActive = isChildActive(item);
                  const open = collapsed ? false : (openGroups[item.id] ?? groupActive);
                  return (
                    <Collapsible
                      key={item.id}
                      open={open}
                      onOpenChange={(o) => setOpenGroups((s) => ({ ...s, [item.id]: o }))}
                      asChild
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={groupActive}
                            className={groupActive ? "bg-sidebar-accent/60 text-sidebar-accent-foreground font-medium" : ""}
                          >
                            <item.icon className={`h-4 w-4 shrink-0 ${groupActive ? "text-primary" : ""}`} />
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const active = view === child.id;
                              return (
                                <SidebarMenuSubItem key={child.id}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={active}
                                    className={active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}
                                  >
                                    <button type="button" onClick={() => setView(child.id)} className="w-full text-left">
                                      <child.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                                      <span>{child.label}</span>
                                    </button>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const active = view === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setView(item.id)}
                      isActive={active}
                      tooltip={item.label}
                      className={active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Pro tip
            </div>
            <p className="text-xs text-muted-foreground">Set a default account in Settings — all actions use it.</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export { nav };
