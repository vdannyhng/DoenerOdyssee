import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

type AuthState = { session: Session | null; initializing: boolean };

const AuthContext = createContext<AuthState>({ session: null, initializing: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, initializing: true });

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, initializing: false });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Beim Abmelden alle Crew-Daten aus dem Cache werfen
      if (event === 'SIGNED_OUT') queryClient.clear();
      setState({ session, initializing: false });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function useUserId(): string | null {
  return useAuth().session?.user.id ?? null;
}
