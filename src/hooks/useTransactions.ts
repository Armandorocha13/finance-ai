
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  user_id: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: transactions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: "Transação adicionada!",
        description: "Sua transação foi salva com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar transação. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error adding transaction:', error);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: "Transação removida!",
        description: "A transação foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação. Tente novamente.",
        variant: "destructive",
      });
      console.error('Error deleting transaction:', error);
    },
  });

  return {
    transactions,
    isLoading,
    error,
    addTransaction: addTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isAddingTransaction: addTransactionMutation.isPending,
    isDeletingTransaction: deleteTransactionMutation.isPending,
  };
};
