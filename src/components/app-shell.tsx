"use client";

import React, { useState, useMemo } from 'react';
import type { LogFile, LogEntry, ClusteredLogs } from '@/lib/types';
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import LogViewTabs from '@/components/log-view-tabs';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { mockCluster } from '@/lib/log-parser';

export function AppShell() {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>('welcome');
  const [workspace, setWorkspace] = useState<'raw' | 'clustered' | 'filtered'>('raw');
  const [filterTerm, setFilterTerm] = useState('');
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);

  const handleFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newLogFile: LogFile = {
        id: `log-${Date.now()}`,
        name: file.name,
        content: content.split('\n').map((line, index) => ({
          lineNumber: index + 1,
          content: line,
        })),
      };
      setLogFiles((prev) => [...prev, newLogFile]);
      setActiveTab(newLogFile.id);
    };
    reader.readAsText(file);
  };
  
  const activeLogFile = useMemo(() => {
    if (activeTab === 'merged') {
      const allEntries: LogEntry[] = logFiles.flatMap(f => f.content);
      // This is a simplified sort without real timestamp parsing for the demo.
      // A real implementation would parse timestamps from each line.
      allEntries.sort((a, b) => a.lineNumber - b.lineNumber); 
      return { id: 'merged', name: 'Merged Logs', content: allEntries };
    }
    return logFiles.find((f) => f.id === activeTab);
  }, [activeTab, logFiles]);

  const clusteredData: ClusteredLogs | null = useMemo(() => {
    if (workspace === 'clustered' && activeLogFile) {
      return mockCluster(activeLogFile.content);
    }
    return null;
  }, [workspace, activeLogFile]);
  
  return (
    <SidebarProvider style={
      {
        // @ts-ignore  — CSS vars for the shadcn sidebar
        "--sidebar-width": "20rem",            // matches w-80
        "--sidebar-width-collapsed": "4rem",   // icon-only width
      } as React.CSSProperties
    }>
        <Sidebar collapsible="icon" className="w-80 border-r">
            <AppSidebar
              onFileImport={handleFileImport}
              workspace={workspace}
              onWorkspaceChange={setWorkspace}
              filterTerm={filterTerm}
              onFilterChange={setFilterTerm}
              activeLogContent={activeLogFile?.content.map(l => l.content).join('\n') || ''}
              onHighlightLines={setHighlightedLines}
              hasLogs={logFiles.length > 0}
            />
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col h-screen">
            <AppHeader logFiles={logFiles}/>
            <main className="flex-1 overflow-hidden">
                <LogViewTabs
                logFiles={logFiles}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                workspace={workspace}
                filterTerm={filterTerm}
                clusteredData={clusteredData}
                highlightedLines={highlightedLines}
                onClearHighlights={() => setHighlightedLines([])}
                />
            </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
