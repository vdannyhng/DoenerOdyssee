import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { crewKeys } from '@/features/crew/api';
import { supabase } from '@/lib/supabase';

import { logbookKey } from './api';

/** Änderungen anderer Crew-Mitglieder live übernehmen (RLS gilt auch für Realtime) */
export function useRealtimeSync(crewId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!crewId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Mehrere Events kurz hintereinander (z. B. Besuch + Teilnehmer + Note) bündeln
    const refreshLogbook = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void qc.invalidateQueries({ queryKey: logbookKey }), 300);
    };

    const channel = supabase
      .channel(`crew-${crewId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spots' }, refreshLogbook)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, refreshLogbook)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visit_participants' }, refreshLogbook)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, refreshLogbook)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        void qc.invalidateQueries({ queryKey: crewKeys.members });
        refreshLogbook();
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [crewId, qc]);
}
