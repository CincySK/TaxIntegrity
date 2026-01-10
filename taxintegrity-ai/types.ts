
export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Source {
  id: string;
  fileName: string;
  content: string;
  relevanceScore: number;
}

export interface TaxAnalysis {
  riskScore: number;
  anomalies: string[];
  recommendations: string[];
}
