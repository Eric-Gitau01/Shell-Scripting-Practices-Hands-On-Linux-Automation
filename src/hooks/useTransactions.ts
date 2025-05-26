
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id?: string;
  category_name?: string;
  description?: string;
  notes?: string;
  receipt_url?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching transactions for user:', user.id);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        // If there's an auth error, still set loading to false so the UI can render
        if (error.message.includes('JWT') || error.message.includes('auth')) {
          console.log('Auth error, user might not be fully confirmed yet');
        }
      } else {
        console.log('Transactions fetched:', data);
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('transactions')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transactions' },
          () => {
            console.log('Real-time update received');
            fetchTransactions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  return { transactions, loading, refetch: fetchTransactions };
}
