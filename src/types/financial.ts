export interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: Record<string, number>;
  topExpenses: Array<{
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
  timeframe: string;
}

export interface AIReportResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  charts: {
    spending_patterns: any;
    category_distribution: any;
  };
} 