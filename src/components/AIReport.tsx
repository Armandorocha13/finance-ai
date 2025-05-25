import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AIReportProps {
  timeframe: 'week' | 'month' | 'year';
  onGenerateReport?: () => void;
}

const AIReport: React.FC<AIReportProps> = ({ timeframe, onGenerateReport }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { user } = useAuth();

  const generateReport = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual AI report generation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating API call
      setReport('Este é um relatório de exemplo gerado pela IA...');
      onGenerateReport?.();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-green-500" />
          Relatório Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
            <p className="text-slate-300">Gerando relatório...</p>
          </div>
        ) : report ? (
          <div className="space-y-4">
            <p className="text-slate-300">{report}</p>
            <Button
              onClick={() => setReport(null)}
              variant="outline"
              className="w-full mt-4"
            >
              Gerar Novo Relatório
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-300">
              Gere um relatório personalizado com análises detalhadas das suas finanças.
              Nossa IA analisará seus gastos e fornecerá insights valiosos.
            </p>
            <Button
              onClick={generateReport}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Gerar Relatório {timeframe === 'month' ? 'Mensal' : timeframe === 'week' ? 'Semanal' : 'Anual'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIReport; 