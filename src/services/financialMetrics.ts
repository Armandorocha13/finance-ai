import { Transaction } from '@/types/financial';

export interface FinancialMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  emergencyFundRatio: number;
  debtToIncomeRatio: number;
  expenseCategories: {
    essential: number;
    nonEssential: number;
    savings: number;
  };
}

const ESSENTIAL_CATEGORIES = [
  'moradia',
  'alimentação',
  'saúde',
  'transporte',
  'educação',
  'contas',
  'utilities'
];

export function calculateFinancialMetrics(transactions: Transaction[]): FinancialMetrics {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filtrar transações do mês atual
  const monthlyTransactions = transactions.filter(t => 
    new Date(t.date) >= firstDayOfMonth
  );

  // Calcular receitas e despesas mensais
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular taxa de economia
  const savingsRate = monthlyIncome > 0 
    ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 
    : 0;

  // Categorizar despesas
  const expenses = monthlyTransactions.filter(t => t.type === 'expense');
  const essentialExpenses = expenses
    .filter(t => ESSENTIAL_CATEGORIES.includes(t.category.toLowerCase()))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const nonEssentialExpenses = expenses
    .filter(t => !ESSENTIAL_CATEGORIES.includes(t.category.toLowerCase()))
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular fundo de emergência (considerando 6 meses de despesas essenciais)
  const emergencyFundTarget = essentialExpenses * 6;
  const currentSavings = transactions
    .filter(t => t.type === 'income' && t.category.toLowerCase() === 'poupança')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const emergencyFundRatio = emergencyFundTarget > 0 
    ? (currentSavings / emergencyFundTarget) * 100 
    : 0;

  // Calcular proporção dívida/renda
  const monthlyDebt = expenses
    .filter(t => t.category.toLowerCase().includes('dívida') || t.category.toLowerCase().includes('financiamento'))
    .reduce((sum, t) => sum + t.amount, 0);

  const debtToIncomeRatio = monthlyIncome > 0 
    ? (monthlyDebt / monthlyIncome) * 100 
    : 0;

  return {
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    emergencyFundRatio,
    debtToIncomeRatio,
    expenseCategories: {
      essential: essentialExpenses,
      nonEssential: nonEssentialExpenses,
      savings: monthlyIncome - monthlyExpenses
    }
  };
}

export function getFinancialHealth(metrics: FinancialMetrics): {
  score: number;
  status: 'Excelente' | 'Bom' | 'Regular' | 'Preocupante';
  recommendations: string[];
} {
  let score = 0;
  const recommendations: string[] = [];

  // Avaliar taxa de economia (peso: 30%)
  if (metrics.savingsRate >= 20) score += 30;
  else if (metrics.savingsRate >= 10) score += 20;
  else if (metrics.savingsRate > 0) score += 10;

  if (metrics.savingsRate < 20) {
    recommendations.push('Tente aumentar sua taxa de economia para pelo menos 20% da renda');
  }

  // Avaliar fundo de emergência (peso: 30%)
  if (metrics.emergencyFundRatio >= 100) score += 30;
  else if (metrics.emergencyFundRatio >= 50) score += 20;
  else if (metrics.emergencyFundRatio >= 25) score += 10;

  if (metrics.emergencyFundRatio < 100) {
    recommendations.push('Continue construindo seu fundo de emergência até ter 6 meses de despesas essenciais');
  }

  // Avaliar proporção dívida/renda (peso: 20%)
  if (metrics.debtToIncomeRatio <= 30) score += 20;
  else if (metrics.debtToIncomeRatio <= 40) score += 10;

  if (metrics.debtToIncomeRatio > 30) {
    recommendations.push('Considere reduzir suas dívidas para melhorar sua saúde financeira');
  }

  // Avaliar proporção despesas essenciais/não essenciais (peso: 20%)
  const totalExpenses = metrics.expenseCategories.essential + metrics.expenseCategories.nonEssential;
  const essentialRatio = totalExpenses > 0 
    ? (metrics.expenseCategories.essential / totalExpenses) * 100 
    : 0;

  if (essentialRatio <= 60) score += 20;
  else if (essentialRatio <= 70) score += 10;

  if (essentialRatio > 60) {
    recommendations.push('Tente reduzir a proporção de gastos com despesas essenciais');
  }

  // Determinar status baseado na pontuação
  let status: 'Excelente' | 'Bom' | 'Regular' | 'Preocupante';
  if (score >= 80) status = 'Excelente';
  else if (score >= 60) status = 'Bom';
  else if (score >= 40) status = 'Regular';
  else status = 'Preocupante';

  return { score, status, recommendations };
} 