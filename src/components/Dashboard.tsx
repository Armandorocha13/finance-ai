import React, { useState } from 'react';
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
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { transactions, isLoading } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Você foi desconectado com sucesso.");
    } catch (error) {
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Olá, {user?.user_metadata?.name || 'Usuário'}
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="hover:text-foreground/80"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-background/10 border-border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-background/20">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-background/20">
              Transações
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-background/20">
              Categorias
            </TabsTrigger>
            <TabsTrigger value="ai-report" className="data-[state=active]:bg-background/20">
              Relatório IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Receitas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    R$ {transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Despesas
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    R$ {transactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Saldo
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    R$ {(transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0) -
                      transactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0))
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Transações
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    {transactions.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-card-foreground">
                    Receitas vs Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transactions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="date" stroke="currentColor" fontSize={12} opacity={0.5} />
                      <YAxis stroke="currentColor" fontSize={12} opacity={0.5} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)',
                          fontSize: '12px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Receitas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name="Despesas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-card-foreground">
                    Distribuição de Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={transactions
                          .filter(t => t.type === 'expense')
                          .reduce((acc, t) => {
                            const existing = acc.find(item => item.category === t.category);
                            if (existing) {
                              existing.value += t.amount;
                            } else {
                              acc.push({ category: t.category, value: t.amount });
                            }
                            return acc;
                          }, [] as { category: string; value: number }[])}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#10B981"
                        label
                      >
                        {transactions
                          .filter(t => t.type === 'expense')
                          .map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                          ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <TransactionList transactions={transactions || []} />
            )}
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="ai-report">
            <AIReport timeframe="month" />
          </TabsContent>
        </Tabs>

        {showForm && (
          <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card/10 backdrop-blur-lg border border-border rounded-2xl p-6 w-full max-w-md">
              <TransactionForm 
                onSubmit={(data) => {
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
