import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AppSidebar, nav } from "./components/AppSidebar";
import { AppTopNav } from "./components/AppTopNav";
import { useWaData } from "./hooks/useWaData";
import { Dashboard } from "./pages/Dashboard";
import { Contacts } from "./pages/Contacts";
import { Segments } from "./pages/Segments";
import { Inbox as InboxPage } from "./pages/Inbox";
import { SendMessage } from "./pages/SendMessage";
import { Templates } from "./pages/Templates";
import { Campaigns } from "./pages/Campaigns";
import { MediaManager } from "./pages/MediaManager";
import { Settings as SettingsPage } from "./pages/Settings";
import { MessagesStream } from "./pages/MessagesStream";
import { Messages } from "./pages/Messages";
import { Flows } from "./pages/Flows";
import { Automation } from "./pages/Automation";
import { Analytics } from "./pages/Analytics";
import { ImportExport } from "./pages/ImportExport";
import { Webhooks } from "./pages/Webhooks";
import { DuplicateMerge } from "./pages/DuplicateMerge";
import { Billing } from "./pages/Billing";
import { Docs } from "./pages/Docs";

// Test Numbers moved into Settings page
export default function WaCloudApiApp() {
  const [view, setView] = useState("dashboard");
  const data = useWaData();
  const findLabel = (id) => {
    for (const item of nav) {
      if (item.id === id && !item.children) return item.label;
      if (item.children) {
        const child = item.children.find((c) => c.id === id);
        if (child) return child.label;
      }
    }
    return "Dashboard";
  };
  const title = findLabel(view);
  const page = {
    dashboard: <Dashboard data={data} setView={setView} />,
    analytics: <Analytics data={data} />,
    inbox: <InboxPage data={data} />,
    stream: <MessagesStream data={data} />,
    messages: <Messages data={data} />,
    send: <SendMessage data={data} />,
    contacts: <Contacts data={data} />,
    segments: <Segments data={data} />,
    templates: <Templates data={data} />,
    flows: <Flows />,
    automation: <Automation data={data} />,
    campaigns: <Campaigns data={data} />,
    media: <MediaManager data={data} />,
    "import-export": <ImportExport data={data} />,
    duplicates: <DuplicateMerge data={data} />,
    webhooks: <Webhooks />,
    billing: <Billing data={data} />,
    docs: <Docs />,
    settings: <SettingsPage data={data} />,
  }[view];

  return (
    <div className="flex h-dvh max-w-[100vw] overflow-hidden bg-background text-foreground">
      <SidebarProvider>
        <AppSidebar view={view} setView={setView} />
        <SidebarInset className="flex h-full w-full flex-col p-2 transition-all">
          <div className="p-2">
            <AppTopNav
              title={title}
              accounts={data.phoneNumbers.data || []}
              activeAccount={data.activeAccount}
              onAccountChange={data.setActiveAccountId}
              onRefresh={() => data.refetchAll()}
            />
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden pt-0">
            <div className="relative h-full overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm">
              <ScrollArea className="relative h-full overflow-hidden">
                <div className="p-4 lg:p-6">{page}</div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
