'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Network, Settings, ChevronRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrgBuilderSettings } from '../_components/OrgBuilderSettings';

export default function OrgBuilderPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId || 'default';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Breadcrumb & Page Banner */}
      <div className="border-b border-border/50 bg-card/60 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href={`/workspace/${workspaceId}`} className="hover:text-foreground transition-colors">
              Workspace
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <Link href={`/workspace/${workspaceId}/system/setting`} className="hover:text-foreground transition-colors">
              System
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-foreground font-semibold flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-violet-500" />
              Org Builder
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">Organization Hierarchy Builder</h1>
                <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 font-semibold flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Universal Global
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Universal Global: Design and manage company reporting hierarchy, departments, executive positions, and user assignments across all workspaces.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/workspace/${workspaceId}/system/setting`}>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs cursor-pointer">
              <Settings className="w-3.5 h-3.5" />
              System Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Org Builder Canvas Viewport */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
        <OrgBuilderSettings workspaceId="global" />
      </div>
    </div>
  );
}
