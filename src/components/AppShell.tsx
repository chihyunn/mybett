'use client';

import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import LoginScreen from './LoginScreen';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
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
    <ThemeProvider>
      <AuthProvider>
        <AppContent>{children}</AppContent>
      </AuthProvider>
    </ThemeProvider>
  );
}
