
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceInput } from './VoiceInput';
import { ReceiptCapture } from './ReceiptCapture';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { toast } from '@/components/ui/use-toast';

export const TransactionForm: React.FC = () => {
  const { categories } = useCategories();
  const { addTransaction } = useTransactions();
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    description: '',
    notes: '',
    receipt_url: '',
    date: new Date().toISOString().split('T')[0],
  });

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in amount and description.",
        variant: "destructive",
      });
      return;
    }

    const selectedCategory = categories.find(cat => cat.id === formData.category_id);
    
    const transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'> = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      category_id: formData.category_id || undefined,
      category_name: selectedCategory?.name,
      description: formData.description,
      notes: formData.notes || undefined,
      receipt_url: formData.receipt_url || undefined,
      date: formData.date,
    };

    try {
      await addTransaction(transaction);
      
      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        category_id: '',
        description: '',
        notes: '',
        receipt_url: '',
        date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: "Transaction Added",
        description: `${formData.type === 'income' ? 'Income' : 'Expense'} of $${formData.amount} recorded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceTranscript = (text: string) => {
    // Simple parsing for voice input - could be enhanced with AI
    const words = text.toLowerCase().split(' ');
    const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    
    if (amountMatch) {
      setFormData(prev => ({ ...prev, amount: amountMatch[1] }));
    }
    
    // Use the full text as description if no amount found
    if (!formData.description) {
      setFormData(prev => ({ ...prev, description: text }));
    }
  };

  const handleReceiptCapture = (url: string) => {
    setFormData(prev => ({ ...prev, receipt_url: url }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'income' | 'expense', category_id: '' }))}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                Expense
              </TabsTrigger>
              <TabsTrigger value="income" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((category) => (
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this transaction for?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Voice Input</Label>
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>

            <div>
              <Label>Receipt Photo</Label>
              <ReceiptCapture onImageCapture={handleReceiptCapture} />
            </div>
          </div>

          {formData.receipt_url && (
            <div>
              <Label>Receipt Preview</Label>
              <img 
                src={formData.receipt_url} 
                alt="Receipt" 
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            Add {formData.type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
