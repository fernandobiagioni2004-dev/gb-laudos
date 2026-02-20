import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'radiologista' | 'cliente' | 'nenhum';

export interface AppProfile {
  id: number;
  auth_uid: string;
  nome: string;
  email: string | null;
  papel: AppRole;
  cliente_id: number | null;
  softwares: string[] | null;
  criado_em: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: AppProfile | null;
  role: AppRole;
  userId: number | null;
  loading: boolean;
  isPending: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const role: AppRole = profile?.papel ?? 'nenhum';
  const userId: number | null = profile?.id ?? null;
  const isPending = !!session && role === 'nenhum';

  const loadProfile = useCallback(async () => {
    const { data } = await supabase.rpc('current_identity');
    if (data && data.length > 0) {
      const identity = data[0] as { user_id: number; role: AppRole };
      // Fetch full profile
      const { data: profileData } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', identity.user_id)
        .single();
      if (profileData) {
        setProfile(profileData as unknown as AppProfile);
      }
    }
  }, []);

  const initUser = useCallback(async (nome: string, email: string) => {
    await supabase.rpc('init_current_user', { p_nome: nome, p_email: email });
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    // Set up listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(async () => {
          const email = newSession.user.email ?? '';
          const nome = newSession.user.user_metadata?.nome ?? email.split('@')[0];
          await initUser(nome, email);
          setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!initialSession) {
        setLoading(false);
      }
      // onAuthStateChange will handle the rest
    });

    return () => subscription.unsubscribe();
  }, [initUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, nome: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ session, user, profile, role, userId, loading, isPending, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
