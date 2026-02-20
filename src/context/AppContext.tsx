import React, { createContext, useContext } from 'react';
import { useAuth, AppRole } from '@/context/AuthContext';

// Re-export Role type for backward compatibility
export type Role = AppRole;

interface AppContextValue {
  role: Role;
  userId: number | null;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { role, userId } = useAuth();

  return (
    <AppContext.Provider value={{ role, userId }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
