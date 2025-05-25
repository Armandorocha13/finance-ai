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
  try {
    const timeframeMatch = prompt.match(/período \((.*?)\)/);
    const incomeMatch = prompt.match(/Receita total: R\$ ([\d.,]+)/);
    const expensesMatch = prompt.match(/Despesas totais: R\$ ([\d.,]+)/);
    const balanceMatch = prompt.match(/Saldo: R\$ ([\d.,]+)/);
    
    // Extrair categorias de despesas
    const categoryStart = prompt.indexOf('Despesas por categoria:') + 'Despesas por categoria:'.length;
    const categoryEnd = prompt.indexOf('Maiores gastos:');
    let categoriesJson = prompt.slice(categoryStart, categoryEnd).trim();
    
    // Extrair maiores gastos
    const expensesStart = prompt.indexOf('Maiores gastos:') + 'Maiores gastos:'.length;
    const expensesEnd = prompt.indexOf('INSTRUÇÕES:');
    let expensesJson = prompt.slice(expensesStart, expensesEnd).trim();

    if (!incomeMatch || !expensesMatch || !balanceMatch || !timeframeMatch) {
      throw new Error('Dados financeiros não encontrados no prompt');
    }

    // Função para limpar e parsear números
    const parseAmount = (str: string) => {
      if (!str) return 0;
      return parseFloat(str.replace(/\./g, '').replace(',', '.'));
    };

    // Limpar e validar JSON antes de parsear
    try {
      // Tentar parsear diretamente
      const expensesByCategory = JSON.parse(categoriesJson);
      const topExpenses = JSON.parse(expensesJson);

      return {
        timeframe: timeframeMatch[1],
        totalIncome: parseAmount(incomeMatch[1]),
        totalExpenses: parseAmount(expensesMatch[1]),
        balance: parseAmount(balanceMatch[1]),
        expensesByCategory,
        topExpenses
      };
    } catch (jsonError) {
      console.error('Erro ao parsear JSON:', jsonError);
      // Se falhar, tentar limpar o JSON antes de parsear novamente
      categoriesJson = categoriesJson.replace(/\s+/g, ' ').trim();
      expensesJson = expensesJson.replace(/\s+/g, ' ').trim();

      return {
        timeframe: timeframeMatch[1],
        totalIncome: parseAmount(incomeMatch[1]),
        totalExpenses: parseAmount(expensesMatch[1]),
        balance: parseAmount(balanceMatch[1]),
        expensesByCategory: JSON.parse(categoriesJson),
        topExpenses: JSON.parse(expensesJson)
      };
    }
  } catch (error) {
    console.error('Erro ao extrair dados financeiros:', error);
    throw new Error('Falha ao processar dados do relatório: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}

function generateLocalReport(data: FinancialData): string {
  const { totalIncome, totalExpenses, balance, expensesByCategory, topExpenses, timeframe } = data;
  
  // Formatar números
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Determinar status financeiro
  const status = balance >= 0 ? '✅ Positivo' : '⚠️ Negativo';
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);
  
  // Ordenar categorias por valor
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => {
      const percentage = (amount / totalExpenses * 100).toFixed(1);
      return `${category}: ${formatCurrency(amount)} (${percentage}%)`;
    });
  
  // Formatar maiores gastos
  const formattedTopExpenses = topExpenses.map((expense, index) => 
    `${index + 1}. ${expense.description}: ${formatCurrency(expense.amount)} (${expense.category})`
  );

  // Gerar recomendações baseadas nos dados
  const recommendations = generateRecommendations(data);

  return `
📊 RELATÓRIO FINANCEIRO ${timeframe.toUpperCase()} 📊

💰 VISÃO GERAL
${status}
- Receitas: ${formatCurrency(totalIncome)} 📈
- Despesas: ${formatCurrency(totalExpenses)} 📉
- Saldo: ${formatCurrency(balance)} ${balance >= 0 ? '🟢' : '🔴'}
- Taxa de Economia: ${savingsRate}% ${Number(savingsRate) > 20 ? '🌟' : ''}

📋 ANÁLISE DE DESPESAS POR CATEGORIA
${sortedCategories.join('\n')}

💸 MAIORES GASTOS
${formattedTopExpenses.join('\n')}

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