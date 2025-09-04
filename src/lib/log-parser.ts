import type { LogEntry, ClusteredLogs } from './types';

// This is a very basic mock of a log clustering algorithm like Drain3.
// It groups logs based on the first few words and replaces numbers with wildcards.
export function mockCluster(logEntries: LogEntry[]): ClusteredLogs {
  const clusters = new Map<string, { count: number; example: LogEntry }>();

  logEntries.forEach(entry => {
    // A simple template generation: replace all numbers with <*> and take first 8 words
    const template = entry.content
      .replace(/\d+/g, '<*>')
      .split(' ')
      .slice(0, 8)
      .join(' ') + (entry.content.split(' ').length > 8 ? ' ...' : '');

    if (clusters.has(template)) {
      clusters.get(template)!.count++;
    } else {
      clusters.set(template, { count: 1, example: entry });
    }
  });

  const sortedClusters = Array.from(clusters.entries())
    .map(([template, data]) => ({
      template,
      count: data.count,
      example: data.example,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    clusters: sortedClusters,
    totalLines: logEntries.length,
  };
}
