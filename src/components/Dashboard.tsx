import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, LogOut, User, Tag, Wifi, WifiOff, Loader2, Brain, Crown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import CategoryManager from './CategoryManager';
import AIReport from './AIReport';
import Plans from './Plans';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { transactions, isLoading } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportsUsed, setReportsUsed] = useState(0);
  const isPro = user?.user_metadata?.is_pro || false;
  const MAX_FREE_REPORTS = 5;

  useEffect(() => {
    const usedReports = parseInt(localStorage.getItem('reportsUsed') || '0');
    setReportsUsed(usedReports);
  }, []);

  const handleGenerateReport = async () => {
    if (!isPro && reportsUsed >= MAX_FREE_REPORTS) {
      toast({
        title: "Limite de relatórios atingido",
        description: "Faça upgrade para o plano Pro para gerar relatórios ilimitados.",
        variant: "destructive",
      });
      setActiveTab('plans');
      return;
    }

    const newReportsUsed = reportsUsed + 1;
    setReportsUsed(newReportsUsed);
    localStorage.setItem('reportsUsed', newReportsUsed.toString());
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-black flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              <p className="text-white">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-green-500" />
              Finance io
            </h1>
            <p className="text-sm sm:text-base text-slate-300">Controle suas finanças de forma inteligente</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-1.5">
              <User className="w-4 h-4 text-white" />
              <span className="text-white text-sm">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-transparent border-green-500 text-green-500 hover:bg-green-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
            
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-lg border border-white/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
              Transações
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <Tag className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="ai-report" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              Relatório IA
              {!isPro && (
                <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full">
                  {MAX_FREE_REPORTS - reportsUsed}/{MAX_FREE_REPORTS}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <Crown className="w-4 h-4 mr-2" />
              Planos
              {!isPro && <div className="w-2 h-2 bg-yellow-500 rounded-full absolute -top-1 -right-1" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-4">
              <TransactionList transactions={transactions.slice(0, 5)} />
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionList transactions={transactions} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="ai-report">
            <AIReport timeframe="month" onGenerateReport={handleGenerateReport} />
          </TabsContent>

          <TabsContent value="plans">
            <Plans />
          </TabsContent>
        </Tabs>

        {/* Modal de Nova Transação */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md">
              <TransactionForm 
                onSubmit={(data) => {
                  // TODO: Implementar adição de transação
                  setShowForm(false);
                }}
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