import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUserId } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

import { parseCrewSettings, type CrewSettings } from './settings';

export type Member = Tables<'members'>;
export type Crew = Omit<Tables<'crews'>, 'settings'> & { settings: CrewSettings };

export const crewKeys = {
  me: (userId: string | null) => ['me', userId] as const,
  crew: ['crew'] as const,
  members: ['members'] as const,
};

/** Eigenes Mitglied (null = noch keiner Crew beigetreten) */
export function useMyMember() {
  const userId = useUserId();
  return useQuery({
    queryKey: crewKeys.me(userId),
    enabled: !!userId,
    queryFn: async (): Promise<Member | null> => {
      const { data, error } = await supabase.from('members').select('*').eq('user_id', userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCrew() {
  return useQuery({
    queryKey: crewKeys.crew,
    queryFn: async (): Promise<Crew> => {
      const { data, error } = await supabase.from('crews').select('*').single();
      if (error) throw error;
      return { ...data, settings: parseCrewSettings(data.settings) };
    },
  });
}

export function useMembers() {
  return useQuery({
    queryKey: crewKeys.members,
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase.from('members').select('*').order('created_at');
      if (error) throw error;
      return data;
    },
  });
}

type Profile = { displayName: string; avatar: string; color: string };

export function useCreateCrew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ crewName, ...p }: Profile & { crewName: string }) => {
      const { data, error } = await supabase.rpc('create_crew', {
        crew_name: crewName,
        display_name: p.displayName,
        avatar: p.avatar,
        color: p.color,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useJoinCrew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, ...p }: Profile & { code: string }) => {
      const { data, error } = await supabase.rpc('join_crew', {
        code,
        display_name: p.displayName,
        avatar: p.avatar,
        color: p.color,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, ...p }: Profile & { memberId: string }) => {
      const { error } = await supabase
        .from('members')
        .update({ display_name: p.displayName.trim(), avatar: p.avatar, color: p.color })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ['me'] }),
        qc.invalidateQueries({ queryKey: crewKeys.members }),
      ]),
  });
}

export function useUpdateCrew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, settings }: { id: string; name: string; settings: CrewSettings }) => {
      const { error } = await supabase.from('crews').update({ name: name.trim(), settings }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: crewKeys.crew }),
  });
}

export function useRegenerateInviteCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('regenerate_invite_code');
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: crewKeys.crew }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.rpc('remove_member', { target_member: memberId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}
