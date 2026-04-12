export interface HistoryEntry {
  id: string;
  date: string;
  time: string;
  type: 'voice' | 'text' | 'image' | 'action';
  icon: string;
  query: string;
  response: string;
  status?: string;
  tags?: string[];
  timestamp: number; // For sorting
}
