
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
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading ShopTrack...</div>
          <div className="text-sm text-gray-500">Setting up your account</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show email verification notice if user is not confirmed */}
      {user && !user.email_confirmed_at && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-yellow-800">
              📧 Please check your email to verify your account. You can still use the app while waiting for verification.
            </p>
          </div>
        </div>
      )}
      
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'add-transaction' && <TransactionForm />}
      </main>
    </div>
  );
};

export default Index;
