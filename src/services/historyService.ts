export interface TestRecord {
  id: string;
  timestamp: number;
  mode: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  duration: number;
  soundProfile: string;
}

export class HistoryService {
  private static instance: HistoryService;
  private records: TestRecord[] = [];

  private constructor() {
    const saved = localStorage.getItem('mechtype_history');
    if (saved) {
      try {
        this.records = JSON.parse(saved);
      } catch {
        this.records = [];
      }
    }
  }

  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  public addRecord(record: Omit<TestRecord, 'id' | 'timestamp'>): void {
    const newRecord: TestRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    this.records.unshift(newRecord);
    // Keep last 200 records
    if (this.records.length > 200) {
      this.records = this.records.slice(0, 200);
    }
    localStorage.setItem('mechtype_history', JSON.stringify(this.records));
  }

  public getRecords(): TestRecord[] {
    return this.records;
  }

  public getBestWpm(): number {
    if (this.records.length === 0) return 0;
    return Math.max(...this.records.map((r) => r.wpm));
  }

  public getAvgWpm(): number {
    if (this.records.length === 0) return 0;
    const sum = this.records.reduce((acc, r) => acc + r.wpm, 0);
    return Math.round(sum / this.records.length);
  }

  public getAvgAccuracy(): number {
    if (this.records.length === 0) return 100;
    const sum = this.records.reduce((acc, r) => acc + r.accuracy, 0);
    return Math.round(sum / this.records.length);
  }

  public exportJson(): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mechtype-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public clearHistory(): void {
    this.records = [];
    localStorage.removeItem('mechtype_history');
  }
}

export const historyService = HistoryService.getInstance();
