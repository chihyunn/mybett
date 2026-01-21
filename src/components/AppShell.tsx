'use client';

import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginScreen from './LoginScreen';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader />
      <main className="pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}
