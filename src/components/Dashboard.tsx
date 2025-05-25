import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, LogOut, User, Tag, Wifi, WifiOff, Loader2, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import CategoryManager from './CategoryManager';
import AIReport from './AIReport';

// Interface que define a estrutura de uma transação
interface Transaction {
  description: string;  // Descrição da transação
  amount: number;       // Valor da transação
  type: 'income' | 'expense';  // Tipo: receita ou despesa
  category: string;     // Categoria da transação
  date: string;        // Data da transação
}

// Componente principal do Dashboard
const Dashboard = () => {
  // Hooks de estado e contexto
  const { user, signOut } = useAuth();  // Autenticação do usuário
  const { toast } = useToast();         // Sistema de notificações
  const { transactions, isLoading, addTransaction, deleteTransaction } = useTransactions();  // Gerenciamento de transações
  
  // Estados locais
  const [showForm, setShowForm] = useState(false);  // Controle do modal de nova transação
  const [activeTab, setActiveTab] = useState('dashboard');  // Controle da aba ativa
  const [isOnline, setIsOnline] = useState(navigator.onLine);  // Estado de conexão

  // Cálculo de totais
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Dados para o gráfico de linha
  const chartData = [
    { name: 'Jan', income: 6200, expenses: 4500 },
    { name: 'Fev', income: 5800, expenses: 4200 },
    { name: 'Mar', income: 7200, expenses: 5100 },
    { name: 'Abr', income: 6500, expenses: 4800 },
    { name: 'Mai', income: 7800, expenses: 5200 },
    { name: 'Jun', income: 8200, expenses: 5500 },
  ];

  // Processamento de dados para o gráfico de pizza
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
    name: category,
    value: amount,
    color: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'][index % 5]
  }));

  // Handlers de eventos
  const handleAddTransaction = (transaction: Transaction) => {
    addTransaction(transaction);
    setShowForm(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado!",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Monitoramento do estado de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Log para debug
  useEffect(() => {
    console.log('Active Tab:', activeTab);
  }, [activeTab]);

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-black flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                {/* Círculo estático externo */}
                <div className="w-16 h-16 rounded-full bg-green-500/20 absolute" />
                {/* Círculo giratório interno */}
                <Loader2 className="w-16 h-16 text-green-500 animate-spin" />
                {/* Ícone central */}
                <DollarSign className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl text-white font-semibold">Finance io</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-slate-300">Carregando suas transações...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderização principal do dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Cabeçalho com informações do usuário e ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-green-500" />
              Finance io
              {/* Online/Offline Indicator */}
              <div className="ml-2 sm:ml-4 flex items-center text-xs sm:text-sm">
                {isOnline ? (
                  <div className="flex items-center text-green-500">
                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-500">
                    <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Offline - Alterações serão sincronizadas</span>
                    <span className="sm:hidden">Offline</span>
                  </div>
                )}
              </div>
            </h1>
            <p className="text-sm sm:text-base text-slate-300">Controle suas finanças de forma inteligente</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* User Info */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-initial">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="text-white truncate">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            
            {/* Logout Button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-transparent border-green-500 text-green-500 hover:bg-green-500/10 hover:border-green-400 text-xs sm:text-sm py-1.5 px-3 sm:px-4"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Sair
            </Button>
            
            {/* Add Transaction Button */}
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm flex-1 sm:flex-initial"
            >
              <Plus className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Sistema de abas para navegação */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border border-white/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs sm:text-sm py-1.5 sm:py-2">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs sm:text-sm py-1.5 sm:py-2">
              Transações
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs sm:text-sm py-1.5 sm:py-2">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="ai-report" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs sm:text-sm py-1.5 sm:py-2">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Relatório IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/15 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">
                    Receitas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-green-400">
                    R$ {totalIncome.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Total de receitas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/15 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">
                    Despesas
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-red-400">
                    R$ {totalExpenses.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Total de despesas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/15 transition-all duration-200 sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">
                    Saldo
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {balance.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {balance >= 0 ? 'Situação positiva' : 'Atenção necessária'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-slate-200">Receitas vs Despesas</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#F9FAFB',
                          fontSize: '12px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Receitas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name="Despesas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-slate-200 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#F9FAFB',
                          fontSize: '12px'
                        }} 
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <TransactionList transactions={transactions.slice(0, 5)} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <TransactionList transactions={transactions} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 sm:space-y-6">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="ai-report" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <AIReport timeframe="month" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal do formulário de transação */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 w-full max-w-md">
              <TransactionForm 
                onSubmit={handleAddTransaction}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
