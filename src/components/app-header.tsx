import React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PanelTop, FileCode } from 'lucide-react';
import { DashboardPanel } from '@/components/dashboard-panel';
import type { LogFile } from '@/lib/types';

interface AppHeaderProps {
  logFiles: LogFile[];
}

export default function AppHeader({ logFiles }: AppHeaderProps) {
  const { state } = useSidebar();
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <FileCode className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">LogLens AI</h1>
      </div>
      <div className="ml-auto">
        <DashboardPanel logFiles={logFiles}>
          <Button variant="outline" size="sm" disabled={logFiles.length === 0}>
            <PanelTop className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </DashboardPanel>
      </div>
    </header>
  );
}
