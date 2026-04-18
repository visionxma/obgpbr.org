'use client';
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface OscPerfil {
  id: string;
  user_id: string;
  osc_id: string;
  razao_social: string | null;
  cnpj: string | null;
  responsavel: string | null;
  telefone: string | null;
  municipio: string | null;
  estado: string | null;
  status_selo: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado';
  observacao_selo: string | null;
  created_at: string;
  updated_at: string;
}

interface PainelContextType {
  user: User | null;
  perfil: OscPerfil | null;
  loading: boolean;
  refreshPerfil: () => Promise<void>;
}

const PainelContext = createContext<PainelContextType>({
  user: null,
  perfil: null,
  loading: true,
  refreshPerfil: async () => {},
});

function generateOscId(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OSC-${year}-${rand}`;
}

export function PainelProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<OscPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchOrCreate = async (u: User) => {
    const { data } = await supabase
      .from('osc_perfis')
      .select('*')
      .eq('user_id', u.id)
      .single();

    if (data) {
      setPerfil(data);
      return;
    }

    const meta = u.user_metadata || {};
    const { data: created } = await supabase
      .from('osc_perfis')
      .insert({
        user_id: u.id,
        osc_id: generateOscId(),
        responsavel: meta.nome || null,
        razao_social: meta.organizacao || null,
      })
      .select('*')
      .single();

    if (created) setPerfil(created);
  };

  const refreshPerfil = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('osc_perfis')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setPerfil(data);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        const isNewUser = user?.id !== session.user.id;
        setUser(session.user);
        if (!initializedRef.current || isNewUser) {
          initializedRef.current = true;
          fetchOrCreate(session.user).finally(() => setLoading(false));
        }
      } else {
        initializedRef.current = false;
        setUser(null);
        setPerfil(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <PainelContext.Provider value={{ user, perfil, loading, refreshPerfil }}>
      {children}
    </PainelContext.Provider>
  );
}

export function usePainel() {
  return useContext(PainelContext);
}
