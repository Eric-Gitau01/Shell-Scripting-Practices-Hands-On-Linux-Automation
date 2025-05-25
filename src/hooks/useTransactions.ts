
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/components/ui/use-toast';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id?: string;
  category_name?: string;
  description?: string;
  notes?: string;
  receipt_url?: string;
  date: string;
  created_at?: string;
  user_id?: string;
  synced?: boolean;
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [localTransactions, setLocalTransactions] = useLocalStorage<Transaction[]>('shoptrack_transactions', []);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Using offline data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync local transactions to Supabase
  const syncTransactions = async () => {
    if (!user) return;

    const unsyncedTransactions = localTransactions.filter(t => !t.synced);
    
    for (const transaction of unsyncedTransactions) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert({
            amount: transaction.amount,
            type: transaction.type,
            category_id: transaction.category_id,
            category_name: transaction.category_name,
            description: transaction.description,
            notes: transaction.notes,
            receipt_url: transaction.receipt_url,
            date: transaction.date,
            user_id: user.id,
          });

        if (!error) {
          // Mark as synced
          setLocalTransactions(prev => 
            prev.map(t => t.id === transaction.id ? { ...t, synced: true } : t)
          );
        }
      } catch (error) {
        console.error('Error syncing transaction:', error);
      }
    }
  };

  // Add transaction (works offline)
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: user?.id,
      synced: false,
    };

    // Add to local storage immediately
    setLocalTransactions(prev => [newTransaction, ...prev]);

    // Try to sync to Supabase if online
    if (user && navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            amount: transaction.amount,
            type: transaction.type,
            category_id: transaction.category_id,
            category_name: transaction.category_name,
            description: transaction.description,
            notes: transaction.notes,
            receipt_url: transaction.receipt_url,
            date: transaction.date,
            user_id: user.id,
          })
          .select()
          .single();

        if (!error && data) {
          // Update with server data
          setLocalTransactions(prev => 
            prev.map(t => t.id === newTransaction.id ? { ...data, synced: true } : t)
          );
          setTransactions(prev => [data, ...prev]);
        }
      } catch (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: "Offline Mode",
          description: "Transaction saved locally. Will sync when online.",
        });
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      syncTransactions();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Combine online and offline transactions
  const allTransactions = user ? transactions : localTransactions;

  return {
    transactions: allTransactions,
    addTransaction,
    loading,
    syncTransactions,
  };
}
