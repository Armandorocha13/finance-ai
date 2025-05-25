import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, Trash2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';

// Interface que define a estrutura de uma transação
interface Transaction {
  id: string;           // Identificador único da transação
  description: string;  // Descrição da transação
  amount: number;       // Valor da transação
  type: 'income' | 'expense';  // Tipo: receita ou despesa
  category: string;     // Categoria da transação
  date: string;        // Data da transação
}

// Props do componente TransactionList
interface TransactionListProps {
  transactions: Transaction[];  // Lista de transações a serem exibidas
}

// Componente que exibe a lista de transações
const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  // Hooks para gerenciamento de estado e feedback
  const { deleteTransaction, isDeletingTransaction } = useTransactions();  // Função e estado de exclusão
  const { toast } = useToast();  // Sistema de notificações

  // Formata a data para o padrão brasileiro (dd/mm/yyyy)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handler para exclusão de transação com confirmação
  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(transactionId);
        toast({
          title: "Transação excluída",
          description: "A transação foi removida com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a transação. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Transações {transactions.length > 5 ? 'Todas' : 'Recentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mensagem quando não há transações */}
          {transactions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Nenhuma transação encontrada
            </p>
          ) : (
            // Lista de transações
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 group"
              >
                {/* Lado esquerdo: ícone, descrição e categoria */}
                <div className="flex items-center space-x-3">
                  {/* Ícone indicador do tipo de transação */}
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-400/20 text-green-400' 
                      : 'bg-red-400/20 text-red-400'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  {/* Informações da transação */}
                  <div>
                    <p className="font-medium text-white">{transaction.description}</p>
                    <p className="text-sm text-slate-400">
                      {transaction.category} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                {/* Lado direito: valor e botão de exclusão */}
                <div className="flex items-center gap-3">
                  {/* Valor da transação */}
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {/* Botão de exclusão (visível apenas no hover) */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    disabled={isDeletingTransaction}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-green-500 hover:text-green-400 hover:bg-green-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
