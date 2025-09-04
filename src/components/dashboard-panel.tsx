"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, Pie, Cell, BarChart as RechartsBarChart, PieChart as RechartsPieChart, XAxis, YAxis, Tooltip } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import type { LogFile } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCluster } from '@/lib/log-parser';
import { X } from 'lucide-react';

interface DashboardPanelProps {
  children: React.ReactNode;
  logFiles: LogFile[];
}

const getLogLevel = (line: string): string => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error')) return 'ERROR';
    if (lowerLine.includes('warn') || lowerLine.includes('warning')) return 'WARN';
    if (lowerLine.includes('info')) return 'INFO';
    if (lowerLine.includes('debug')) return 'DEBUG';
    return 'UNKNOWN';
}

const chartConfig = {
  count: { label: "Count" },
  message: { label: "Message" },
  INFO: { label: 'Info', color: 'hsl(var(--chart-1))' },
  ERROR: { label: 'Error', color: 'hsl(var(--chart-5))' },
  WARN: { label: 'Warning', color: 'hsl(var(--chart-4))' },
  DEBUG: { label: 'Debug', color: 'hsl(var(--chart-3))' },
  UNKNOWN: { label: 'Unknown', color: 'hsl(var(--muted))' },
} satisfies ChartConfig;

const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

export function DashboardPanel({ children, logFiles }: DashboardPanelProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedLogId && logFiles.length > 0) {
      setSelectedLogId(logFiles[0].id);
    }
    if (logFiles.length > 0 && !logFiles.find(f => f.id === selectedLogId)) {
      setSelectedLogId(logFiles[0].id);
    }
  }, [logFiles, selectedLogId]);

  const selectedLogFile = useMemo(() => {
    return logFiles.find(file => file.id === selectedLogId);
  }, [selectedLogId, logFiles]);

  const dashboardData = useMemo(() => {
    if (!selectedLogFile) return null;

    // 1. Calculate Log Type Distribution
    const logTypeCounts: Record<string, number> = { INFO: 0, ERROR: 0, WARN: 0, DEBUG: 0, UNKNOWN: 0 };
    selectedLogFile.content.forEach(entry => {
        const level = getLogLevel(entry.content);
        logTypeCounts[level]++;
    });
    const logTypeData = Object.entries(logTypeCounts)
        .map(([type, count]) => ({ type, count, fill: `var(--color-${type})` }))
        .filter(item => item.count > 0);

    // 2. Get Most Frequent Logs using the existing clustering logic
    const clustered = mockCluster(selectedLogFile.content);
    const frequentLogsData = clustered.clusters.slice(0, 5).map(c => ({
        message: truncateText(c.template, 40),
        count: c.count,
    }));

    return { logTypeData, frequentLogsData };
  }, [selectedLogFile]);


  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-3xl p-0" side="right">
        <SheetHeader className="p-6 pb-2 border-b">
          <div className="flex justify-between items-start">
            <div className='flex-1'>
                <SheetTitle>Log-cluster Dashboard</SheetTitle>
                <SheetDescription>Visual charts and statistics derived from clustered logs.</SheetDescription>
            </div>
            {logFiles.length > 0 && (
                <div className="ml-4 flex-shrink-0">
                  <Select value={selectedLogId ?? undefined} onValueChange={setSelectedLogId}>
                      <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder="Select a log file" />
                      </SelectTrigger>
                      <SelectContent>
                          {logFiles.map(file => (
                              <SelectItem key={file.id} value={file.id}>{file.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
            )}
          </div>
        </SheetHeader>
        <div className="p-6 grid gap-6 grid-cols-1 lg:grid-cols-5">
            {selectedLogFile && dashboardData ? (
                <>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Log Distribution</CardTitle>
                            <CardDescription>{selectedLogFile.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <RechartsPieChart>
                                    <Tooltip content={<ChartTooltipContent nameKey="type" hideLabel />} />
                                    <Pie data={dashboardData.logTypeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80}>
                                        {dashboardData.logTypeData.map((entry) => (
                                            <Cell key={`cell-${entry.type}`} fill={chartConfig[entry.type as keyof typeof chartConfig]?.color} />
                                        ))}
                                    </Pie>
                                    <ChartLegend content={<ChartLegendContent nameKey="type" />} />
                                </RechartsPieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Most Frequent Logs</CardTitle>
                             <CardDescription>Top 5 log templates found in {selectedLogFile.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <RechartsBarChart layout="vertical" data={dashboardData.frequentLogsData} margin={{ left: 10, right: 10, top: 10, bottom: 10, }}>
                                    <Tooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" labelKey="message" />}
                                    />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="message" type="category" tickLine={false} axisLine={false} tickFormatter={(value) => truncateText(value, 35)} width={120} />
                                    <Bar dataKey="count" layout="vertical" radius={5} barSize={20}>
                                        {dashboardData.frequentLogsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartConfig.INFO.color} />
                                        ))}
                                    </Bar>
                                </RechartsBarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <div className="col-span-full text-center py-20">
                    <p className="text-muted-foreground">Please import a log file to view the dashboard.</p>
                </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
