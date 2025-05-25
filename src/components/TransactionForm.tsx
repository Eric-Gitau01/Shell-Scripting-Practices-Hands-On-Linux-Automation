
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { VoiceInput } from '@/components/VoiceInput';
import { ReceiptCapture } from '@/components/ReceiptCapture';
import { Mic, Camera, DollarSign, Calendar } from 'lucide-react';

export const TransactionForm: React.FC = () => {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    description: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const category = categories.find(c => c.id === formData.category_id);
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category_id: formData.category_id,
          category_name: category?.name,
          description: formData.description,
          notes: formData.notes,
          date: formData.date,
        });

      if (error) throw error;

      toast({
        title: "Transaction Added!",
        description: `${formData.type === 'income' ? 'Income' : 'Expense'} of $${formData.amount} has been recorded.`,
      });

      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        category_id: '',
        description: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    // Simple parsing logic for voice input
    const words = text.toLowerCase().split(' ');
    const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    
    if (amountMatch) {
      setFormData(prev => ({ ...prev, amount: amountMatch[1] }));
    }
    
    if (words.includes('income') || words.includes('earned') || words.includes('received')) {
      setFormData(prev => ({ ...prev, type: 'income' }));
    } else if (words.includes('expense') || words.includes('spent') || words.includes('paid')) {
      setFormData(prev => ({ ...prev, type: 'expense' }));
    }
    
    setFormData(prev => ({ ...prev, description: text }));
  };

  const availableCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Add Transaction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => 
                setFormData(prev => ({ ...prev, type: value, category_id: '' }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, category_id: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was this transaction for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Voice Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5" />
            <span>Voice Input</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceInput onResult={handleVoiceResult} />
        </CardContent>
      </Card>

      {/* Receipt Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Receipt Capture</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReceiptCapture onReceiptData={(data) => {
            if (data.amount) setFormData(prev => ({ ...prev, amount: data.amount.toString() }));
            if (data.description) setFormData(prev => ({ ...prev, description: data.description }));
          }} />
        </CardContent>
      </Card>
    </div>
  );
};
