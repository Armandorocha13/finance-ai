interface FinancialData {
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

export async function generateAIReport(prompt: string): Promise<string> {
  try {
    // Extrair dados financeiros do prompt
    const data: FinancialData = extractFinancialData(prompt);
    
    // Gerar relatório baseado nos dados
    return generateLocalReport(data);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw new Error('Falha ao gerar relatório: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}

function extractFinancialData(prompt: string): FinancialData {
  const timeframeMatch = prompt.match(/período \((.*?)\)/);
  const incomeMatch = prompt.match(/Receita total: R\$ ([\d.]+)/);
  const expensesMatch = prompt.match(/Despesas totais: R\$ ([\d.]+)/);
  const balanceMatch = prompt.match(/Saldo: R\$ ([\d.]+)/);
  
  // Extrair categorias de despesas
  const categoryStart = prompt.indexOf('Despesas por categoria:') + 'Despesas por categoria:'.length;
  const categoryEnd = prompt.indexOf('Maiores gastos:');
  const categoriesJson = prompt.slice(categoryStart, categoryEnd).trim();
  
  // Extrair maiores gastos
  const expensesStart = prompt.indexOf('Maiores gastos:') + 'Maiores gastos:'.length;
  const expensesEnd = prompt.indexOf('INSTRUÇÕES:');
  const expensesJson = prompt.slice(expensesStart, expensesEnd).trim();

  if (!incomeMatch || !expensesMatch || !balanceMatch || !timeframeMatch) {
    throw new Error('Dados financeiros não encontrados no prompt');
  }

  return {
    timeframe: timeframeMatch[1],
    totalIncome: parseFloat(incomeMatch[1]),
    totalExpenses: parseFloat(expensesMatch[1]),
    balance: parseFloat(balanceMatch[1]),
    expensesByCategory: JSON.parse(categoriesJson),
    topExpenses: JSON.parse(expensesJson)
  };
}

function generateLocalReport(data: FinancialData): string {
  const { totalIncome, totalExpenses, balance, expensesByCategory, topExpenses, timeframe } = data;
  
  // Determinar status financeiro
  const status = balance >= 0 ? '✅ Positivo' : '⚠️ Negativo';
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);
  
  // Ordenar categorias por valor
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a);
  
  // Gerar recomendações baseadas nos dados
  const recommendations = generateRecommendations(data);

  return `
📊 RELATÓRIO FINANCEIRO ${timeframe.toUpperCase()} 📊

💰 VISÃO GERAL
${status}
- Receitas: R$ ${totalIncome.toFixed(2)} 📈
- Despesas: R$ ${totalExpenses.toFixed(2)} 📉
- Saldo: R$ ${balance.toFixed(2)} ${balance >= 0 ? '🟢' : '🔴'}
- Taxa de Economia: ${savingsRate}% ${Number(savingsRate) > 20 ? '🌟' : ''}

📋 ANÁLISE DE DESPESAS POR CATEGORIA
${sortedCategories.map(([category, amount]) => {
  const percentage = (amount / totalExpenses * 100).toFixed(1);
  return `- ${category}: R$ ${amount.toFixed(2)} (${percentage}%)`;
}).join('\n')}

💸 MAIORES GASTOS
${topExpenses.map((expense, index) => 
  `${index + 1}. ${expense.description}: R$ ${expense.amount.toFixed(2)} (${expense.category})`
).join('\n')}

${recommendations}

🎯 METAS SUGERIDAS
1. ${balance >= 0 
  ? `Manter o saldo positivo e aumentar a taxa de economia para ${Math.min(Number(savingsRate) + 5, 30)}%`
  : 'Reduzir despesas para alcançar um saldo positivo nos próximos meses'}
2. Criar um fundo de emergência equivalente a 3-6 meses de despesas
3. ${Number(savingsRate) < 20 
  ? 'Aumentar a taxa de economia para pelo menos 20%' 
  : 'Considerar investimentos para seu dinheiro guardado'}

💡 DICA DO MÊS
${generateMonthlyTip(data)}
`;
}

function generateRecommendations(data: FinancialData): string {
  const { totalIncome, totalExpenses, balance, expensesByCategory } = data;
  const recommendations: string[] = [];

  // Análise de gastos por categoria
  const totalExpensesPercentage = (totalExpenses / totalIncome * 100).toFixed(1);
  
  recommendations.push('📝 RECOMENDAÇÕES');
  
  if (balance < 0) {
    recommendations.push('- ⚠️ Reduzir despesas imediatamente para evitar endividamento');
  }
  
  if (Number(totalExpensesPercentage) > 80) {
    recommendations.push('- 📉 Seus gastos estão muito altos em relação à sua renda');
  }

  // Analisar categorias específicas
  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    const categoryPercentage = (amount / totalIncome * 100).toFixed(1);
    
    if (Number(categoryPercentage) > 30) {
      recommendations.push(`- 🔍 Gastos com ${category} estão muito altos (${categoryPercentage}% da renda)`);
    }
  });

  if (recommendations.length === 1) {
    recommendations.push('- ✨ Continue mantendo o controle dos seus gastos!');
  }

  return recommendations.join('\n');
}

function generateMonthlyTip(data: FinancialData): string {
  const tips = [
    'Estabeleça metas financeiras específicas e mensuráveis para manter o foco.',
    'Considere usar a regra 50/30/20: 50% para necessidades, 30% para desejos e 20% para economia.',
    'Revise suas assinaturas e serviços recorrentes para identificar gastos desnecessários.',
    'Pesquise preços e use aplicativos de desconto antes de fazer compras significativas.',
    'Mantenha um registro detalhado de todos os gastos para identificar padrões e oportunidades de economia.'
  ];

  // Escolher uma dica baseada em algum critério dos dados
  const tipIndex = Math.floor(data.balance >= 0 ? Math.random() * tips.length : 0);
  return tips[tipIndex];
} 