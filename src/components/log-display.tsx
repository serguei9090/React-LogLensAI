"use client";

import React, { useMemo } from 'react';
import type { LogFile, ClusteredLogs } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface LogDisplayProps {
  logFile: LogFile | undefined;
  workspace: 'raw' | 'clustered' | 'filtered';
  filterTerm: string;
  clusteredData: ClusteredLogs | null;
  highlightedLines: number[];
  onClearHighlights: () => void;
}

const Highlighted = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-accent text-accent-foreground rounded px-1 py-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export function LogDisplay({ logFile, workspace, filterTerm, clusteredData, highlightedLines, onClearHighlights }: LogDisplayProps) {
  const filteredLogs = useMemo(() => {
    if (!logFile) return [];
    if (!filterTerm) return logFile.content;
    try {
      const regex = new RegExp(filterTerm, 'i');
      return logFile.content.filter(entry => regex.test(entry.content));
    } catch (e) {
      // Handle invalid regex
      return logFile.content.filter(entry => entry.content.toLowerCase().includes(filterTerm.toLowerCase()));
    }
  }, [logFile, filterTerm]);
  
  React.useEffect(() => {
    if (highlightedLines.length > 0) {
      const timer = setTimeout(() => {
        onClearHighlights();
      }, 5000); // clear highlights after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [highlightedLines, onClearHighlights]);

  if (!logFile) {
    return <div className="p-4 text-muted-foreground">No log file selected.</div>;
  }

  if (workspace === 'clustered') {
    if (!clusteredData) {
      return <div className="p-4 text-muted-foreground">Clustering logs...</div>;
    }
    return (
      <ScrollArea className="h-full">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[100px]">Count</TableHead>
              <TableHead>Log Template</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clusteredData.clusters.map((cluster, index) => (
              <TableRow key={index} className="font-mono text-sm">
                <TableCell><Badge variant="secondary">{cluster.count}</Badge></TableCell>
                <TableCell>{cluster.template}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="font-mono text-sm p-4">
        {filteredLogs.map((entry) => (
          <div
            key={entry.lineNumber}
            className={`flex items-start transition-colors duration-300 -mx-4 px-4 py-0.5 hover:bg-secondary/50 ${highlightedLines.includes(entry.lineNumber) ? 'bg-primary/20' : ''}`}
          >
            <span className="w-12 text-right pr-4 text-muted-foreground select-none">{entry.lineNumber}</span>
            <pre className="flex-1 whitespace-pre-wrap m-0 p-0 bg-transparent border-0">
              <Highlighted text={entry.content} highlight={filterTerm} />
            </pre>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
