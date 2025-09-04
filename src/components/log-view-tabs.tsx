"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { LogDisplay } from './log-display';
import type { LogFile, ClusteredLogs } from '@/lib/types';
import { Merge } from 'lucide-react';

interface LogViewTabsProps {
  logFiles: LogFile[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  workspace: 'raw' | 'clustered' | 'filtered';
  filterTerm: string;
  clusteredData: ClusteredLogs | null;
  highlightedLines: number[];
  onClearHighlights: () => void;
}

export default function LogViewTabs({
  logFiles,
  activeTab,
  onTabChange,
  workspace,
  filterTerm,
  clusteredData,
  highlightedLines,
  onClearHighlights
}: LogViewTabsProps) {

  const activeLogFile = React.useMemo(() => {
    if (activeTab === 'merged') {
        const allEntries = logFiles.flatMap(f => f.content);
        // This is a simplified sort without real timestamp parsing for the demo.
        allEntries.sort((a, b) => a.lineNumber - b.lineNumber); 
        return { id: 'merged', name: 'Merged Logs', content: allEntries };
    }
    return logFiles.find((f) => f.id === activeTab);
  }, [activeTab, logFiles]);

  if (logFiles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Welcome to LogLens AI</h2>
          <p className="mt-2 text-muted-foreground">Import a log file from the sidebar to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex flex-col h-full p-4 pt-0 gap-4">
      <TabsList className="flex-shrink-0 w-full justify-start rounded-none bg-transparent p-0 border-b">
        {logFiles.map((file) => (
          <TabsTrigger key={file.id} value={file.id} className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary -mb-px">
            {file.name}
          </TabsTrigger>
        ))}
        {logFiles.length > 1 && (
          <TabsTrigger value="merged" className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary -mb-px">
            <Merge className="w-4 h-4 mr-2" /> Merged
          </TabsTrigger>
        )}
      </TabsList>

      <div className="flex-1 min-h-0">
        <Card className="h-full border-0 shadow-none">
            <CardContent className="h-full p-0">
              <LogDisplay
                logFile={activeLogFile}
                workspace={workspace}
                filterTerm={filterTerm}
                clusteredData={clusteredData}
                highlightedLines={highlightedLines}
                onClearHighlights={onClearHighlights}
              />
            </CardContent>
        </Card>
      </div>
    </Tabs>
  );
}
