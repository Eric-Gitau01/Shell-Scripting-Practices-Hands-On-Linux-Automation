
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Auth } from '@/components/Auth';
import { Dashboard } from '@/components/Dashboard';
import { TransactionForm } from '@/components/TransactionForm';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-transaction'>('dashboard');

  // Reset view to dashboard when user changes
  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium">Loading ShopTrack...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'add-transaction' && <TransactionForm />}
      </main>
    </div>
  );
};

export default Index;
