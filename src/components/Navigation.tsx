
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Plus, User, LogOut } from 'lucide-react';

interface NavigationProps {
  currentView: 'dashboard' | 'add-transaction';
  onViewChange: (view: 'dashboard' | 'add-transaction') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">ShopTrack</h1>
          
          <div className="hidden md:flex space-x-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => onViewChange('dashboard')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            
            <Button
              variant={currentView === 'add-transaction' ? 'default' : 'ghost'}
              onClick={() => onViewChange('add-transaction')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{user?.email}</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-2">
          <Button
            variant={currentView === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => onViewChange('dashboard')}
            className="h-16 rounded-none flex flex-col space-y-1"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Button>
          
          <Button
            variant={currentView === 'add-transaction' ? 'default' : 'ghost'}
            onClick={() => onViewChange('add-transaction')}
            className="h-16 rounded-none flex flex-col space-y-1"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
