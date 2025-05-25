import { useState } from 'react';
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

const TRANSACTIONS_QUERY_KEY = 'transactions';

export function useTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, user?.id],
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

  // Add transaction
  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY, user?.id] });
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar transação: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete transaction
  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY, user?.id] });
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update transaction
  const updateTransaction = useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', transaction.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY, user?.id] });
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    isLoading,
    error,
    addTransaction: addTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    isAdding: addTransaction.isPending,
    isDeleting: deleteTransaction.isPending,
    isUpdating: updateTransaction.isPending,
  };
} 