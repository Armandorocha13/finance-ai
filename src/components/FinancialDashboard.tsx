import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { calculateFinancialMetrics, getFinancialHealth } from '@/services/financialMetrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, AlertTriangle } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export function FinancialDashboard() {
  const { transactions } = useTransactions();
  const metrics = calculateFinancialMetrics(transactions);
  const health = getFinancialHealth(metrics);

  // Preparar dados para o gráfico de despesas por categoria
  const expenseCategoryData = [
    { name: 'Essenciais', value: metrics.expenseCategories.essential },
    { name: 'Não Essenciais', value: metrics.expenseCategories.nonEssential },
    { name: 'Economia', value: metrics.expenseCategories.savings }
  ];

  // Preparar dados para o gráfico de tendência
  const trendData = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc: any[], transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      const existingDay = acc.find(d => d.date === date);

      if (existingDay) {
        if (transaction.type === 'income') {
          existingDay.income += transaction.amount;
        } else {
          existingDay.expenses += transaction.amount;
        }
      } else {
        acc.push({
          date,
          income: transaction.type === 'income' ? transaction.amount : 0,
          expenses: transaction.type === 'expense' ? transaction.amount : 0
        });
      }

      return acc;
    }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Cartão de Saúde Financeira */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Saúde Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-200">{health.score}%</p>
              <p className={`text-sm ${
                health.status === 'Excelente' ? 'text-green-400' :
                health.status === 'Bom' ? 'text-yellow-400' :
                health.status === 'Regular' ? 'text-orange-400' :
                'text-red-400'
              }`}>{health.status}</p>
            </div>
            {health.status === 'Excelente' ? (
              <ArrowUpRight className="w-8 h-8 text-green-400" />
            ) : health.status === 'Preocupante' ? (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            ) : (
              <Wallet className="w-8 h-8 text-yellow-400" />
            )}
          </div>
          <div className="mt-4 space-y-2">
            {health.recommendations.map((rec, index) => (
              <p key={index} className="text-sm text-slate-300">{rec}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cartão de Métricas */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Métricas Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Taxa de Economia</p>
            <p className="text-xl font-bold text-slate-200">{metrics.savingsRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Fundo de Emergência</p>
            <p className="text-xl font-bold text-slate-200">{metrics.emergencyFundRatio.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Proporção Dívida/Renda</p>
            <p className="text-xl font-bold text-slate-200">{metrics.debtToIncomeRatio.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Tendência */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 col-span-2">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Tendência Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  name="Receitas"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Distribuição de Despesas */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200">Distribuição de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {expenseCategoryData.map((category, index) => (
              <div key={category.name}>
                <div className="flex items-center justify-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-xs text-slate-300">{category.name}</span>
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {((category.value / metrics.monthlyExpenses) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 