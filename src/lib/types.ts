export interface LogEntry {
  lineNumber: number;
  content: string;
}

export interface LogFile {
  id: string;
  name: string;
  content: LogEntry[];
}

export interface LogCluster {
  template: string;
  count: number;
  example: LogEntry;
}

export interface ClusteredLogs {
  clusters: LogCluster[];
  totalLines: number;
}
