import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { generateAIReport } from '@/services/deepseek';

interface AIReportProps {
  timeframe?: 'week' | 'month' | 'year';
}

const AIReport: React.FC<AIReportProps> = ({ timeframe = 'month' }) => {
  const { transactions } = useTransactions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    console.log('Iniciando geração do relatório...');

    try {
      if (!transactions.length) {
        throw new Error('Nenhuma transação encontrada para análise');
      }

      // Preparar os dados para análise
      const now = new Date();
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (timeframe === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        } else if (timeframe === 'month') {
          return transactionDate.getMonth() === now.getMonth() &&
                 transactionDate.getFullYear() === now.getFullYear();
        } else {
          return transactionDate.getFullYear() === now.getFullYear();
        }
      });

      console.log('Transações filtradas:', filteredTransactions);

      if (!filteredTransactions.length) {
        throw new Error(`Nenhuma transação encontrada para o período selecionado (${timeframe})`);
      }

      // Calcular métricas importantes
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = totalIncome - totalExpenses;

      console.log('Métricas calculadas:', { totalIncome, totalExpenses, balance });

      // Categorizar despesas
      const expensesByCategory = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      // Encontrar maiores gastos
      const topExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      console.log('Dados preparados:', { expensesByCategory, topExpenses });

      // Gerar relatório usando DeepSeek
      const prompt = `
        Você é um consultor financeiro especializado em análise de dados financeiros pessoais.
        Analise os seguintes dados financeiros do período (${timeframe}) e gere um relatório detalhado e personalizado em português.

        DADOS FINANCEIROS:
        - Receita total: R$ ${totalIncome.toFixed(2)}
        - Despesas totais: R$ ${totalExpenses.toFixed(2)}
        - Saldo: R$ ${balance.toFixed(2)}
        - Despesas por categoria: ${JSON.stringify(expensesByCategory, null, 2)}
        - Maiores gastos: ${JSON.stringify(topExpenses, null, 2)}

        INSTRUÇÕES:
        1. Comece com uma visão geral da saúde financeira, usando emojis para melhor visualização
        2. Faça uma análise detalhada dos gastos por categoria, identificando áreas de preocupação
        3. Identifique padrões de gastos e comportamentos financeiros
        4. Forneça recomendações personalizadas e práticas para economia
        5. Sugira metas financeiras realistas baseadas nos dados
        6. Use uma linguagem amigável e motivadora
        7. Formate o texto de forma clara e organizada, usando emojis quando apropriado

        IMPORTANTE: Mantenha o relatório conciso mas informativo, focando nas insights mais relevantes.
      `;

      console.log('Enviando prompt para a API...');
      const aiResponse = await generateAIReport(prompt);
      console.log('Resposta recebida da API');
      
      setReport(aiResponse);
      setError(null);
      
      toast({
        title: "Relatório Gerado!",
        description: "Seu relatório financeiro foi gerado com sucesso.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro inesperado ao gerar relatório";
      console.error('Erro detalhado ao gerar relatório:', error);
      setError(errorMessage);
      setReport(null);
      
      toast({
        title: "Erro ao Gerar Relatório",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    try {
      // Criar o conteúdo do arquivo com cabeçalho e formatação
      const fileContent = `Relatório Financeiro - ${new Date().toLocaleDateString('pt-BR')}\n\n${report}`;
      
      // Criar o blob com encoding UTF-8 para suportar caracteres especiais
      const blob = new Blob([fileContent], { 
        type: 'text/plain;charset=utf-8'
      });

      // Criar URL do objeto
      const url = window.URL.createObjectURL(blob);
      
      // Criar elemento de link invisível
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-financeiro-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`;
      
      // Adicionar à página, clicar e remover
      document.body.appendChild(link);
      link.click();
      
      // Pequeno delay antes de limpar
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Download Concluído",
        description: "Seu relatório foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast({
        title: "Erro no Download",
        description: "Não foi possível baixar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
          <Brain className="w-5 h-5 text-green-500" />
          Relatório Inteligente
          <span className="text-sm font-normal text-slate-400">
            ({timeframe === 'week' ? 'Semanal' : timeframe === 'month' ? 'Mensal' : 'Anual'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
              <p>{error}</p>
            </div>
          )}
          
          {!report ? (
            <Button
              onClick={generateReport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Gerar Relatório com IA
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap">
                {report}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={generateReport}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 bg-transparent border-green-500 text-green-500 hover:bg-green-500/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Atualizar Relatório
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={downloadReport}
                  variant="outline"
                  className="bg-transparent border-blue-500 text-blue-500 hover:bg-blue-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Relatório
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIReport; 