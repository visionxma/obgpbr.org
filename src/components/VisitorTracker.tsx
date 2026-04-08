'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Não rastreia as páginas do Admin
    if (pathname?.startsWith('/admin')) return;

    let sessionId = sessionStorage.getItem('gn_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('gn_session_id', sessionId);
    }

    const startTime = Date.now();
    let visitId = '';

    const recordVisit = async () => {
      // Faz o insert ignorando erros silenciosamente (fire-and-forget) na UI
      const { data } = await supabase
        .from('page_visits')
        .insert([{ path: pathname || '/', session_id: sessionId }])
        .select('id')
        .single();
      
      if (data) {
        visitId = data.id;
      }
    };
    
    recordVisit();

    const updateDuration = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (visitId && duration > 0) {
        // Atualiza a duracao quando desmonta
        supabase.from('page_visits').update({ duration_seconds: duration }).eq('id', visitId).then();
      }
    };

    return updateDuration;
  }, [pathname]);

  return null;
}
