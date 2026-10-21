import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deletePhoto, signPhotoPaths, uploadPhoto } from '@/features/photos/photos';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

/** photo_url ist der Speicherpfad, photoUri der anzeigbare (signierte) Link */
export type Spot = Tables<'spots'> & { photoUri: string | null };
export type Rating = Tables<'ratings'>;
export type Visit = Tables<'visits'> & { participantIds: string[]; photoUri: string | null };
export type MealType = 'kebab' | 'duerum' | 'teller' | 'vegi' | 'sonstiges';
export const MEAL_TYPES: readonly MealType[] = ['kebab', 'duerum', 'teller', 'vegi', 'sonstiges'];

export type Logbook = { spots: Spot[]; visits: Visit[]; ratings: Rating[] };

export const logbookKey = ['logbook'] as const;

/**
 * Alle Spots, Besuche und Bewertungen der Crew in einer Abfrage.
 * Für eine Freundesgruppe (einige hundert Einträge) bewusst einfach gehalten; RLS filtert auf die eigene Crew.
 */
export function useLogbook() {
  return useQuery({
    queryKey: logbookKey,
    queryFn: async (): Promise<Logbook> => {
      const [spots, visits, ratings] = await Promise.all([
        supabase.from('spots').select('*').order('name'),
        supabase
          .from('visits')
          .select('*, visit_participants(member_id)')
          .order('visited_on', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('ratings').select('*'),
      ]);
      if (spots.error) throw spots.error;
      if (visits.error) throw visits.error;
      if (ratings.error) throw ratings.error;
      const paths = [...spots.data, ...visits.data].flatMap((x) => (x.photo_url ? [x.photo_url] : []));
      const signed = await signPhotoPaths(paths);
      const uri = (path: string | null) => (path ? (signed.get(path) ?? null) : null);
      return {
        spots: spots.data.map((s) => ({ ...s, photoUri: uri(s.photo_url) })),
        visits: visits.data.map(({ visit_participants, ...v }) => ({
          ...v,
          photoUri: uri(v.photo_url),
          participantIds: visit_participants.map((p) => p.member_id),
        })),
        ratings: ratings.data,
      };
    },
  });
}

function useInvalidateLogbook() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: logbookKey });
}

export type SpotInput = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  price: number | null;
  note: string | null;
};

/** undefined = Foto unverändert, null = entfernen, string = neues lokales Foto */
export type PhotoChange = string | null | undefined;

export function useSaveSpot() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    mutationFn: async ({
      id,
      crewId,
      input,
      photo,
      previousPhotoPath,
    }: {
      id?: string;
      crewId: string;
      input: SpotInput;
      photo?: PhotoChange;
      previousPhotoPath?: string | null;
    }): Promise<Tables<'spots'>> => {
      const photoPath = photo ? await uploadPhoto(crewId, photo) : photo;
      const values = {
        ...input,
        name: input.name.trim(),
        note: input.note?.trim() || null,
        ...(photoPath !== undefined ? { photo_url: photoPath } : {}),
      };
      const query = id
        ? supabase.from('spots').update(values).eq('id', id)
        : supabase.from('spots').insert(values); // crew_id/created_by setzt die Datenbank
      const { data, error } = await query.select().single();
      if (error) throw error;
      if (photoPath !== undefined && previousPhotoPath) await deletePhoto(previousPhotoPath);
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteSpot() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('spots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export type VisitInput = {
  spotId: string;
  visitedOn: string;
  mealType: MealType | null;
  participantIds: string[];
  /** Eigene Note direkt beim Anlegen (optional) */
  myRating: { score: number; comment: string | null } | null;
  /** Lokales Foto vom Döner (optional) */
  photoUri?: string | null;
};

export function useCreateVisit() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    mutationFn: async ({ crewId, ...input }: VisitInput & { crewId: string }): Promise<string> => {
      // Foto zuerst: schlägt der Upload fehl, entsteht kein halber Logbuch-Eintrag
      const photoPath = input.photoUri ? await uploadPhoto(crewId, input.photoUri) : null;
      const { data: visit, error } = await supabase
        .from('visits')
        // crew_id und created_by setzt die Datenbank
        .insert({
          spot_id: input.spotId,
          visited_on: input.visitedOn,
          meal_type: input.mealType,
          photo_url: photoPath,
        })
        .select('id')
        .single();
      if (error) throw error;

      const participants = [...new Set(input.participantIds)];
      if (participants.length) {
        const { error: pError } = await supabase
          .from('visit_participants')
          .insert(participants.map((member_id) => ({ visit_id: visit.id, member_id })));
        if (pError) throw pError;
      }
      if (input.myRating) {
        const { error: rError } = await supabase.from('ratings').insert({
          visit_id: visit.id,
          taste_score: input.myRating.score,
          comment: input.myRating.comment?.trim() || null,
        });
        if (rError) throw rError;
      }
      return visit.id;
    },
    onSuccess: invalidate,
  });
}

export function useSetVisitPhoto() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    mutationFn: async (v: {
      visitId: string;
      crewId: string;
      photo: string | null;
      previousPath: string | null;
    }) => {
      const path = v.photo ? await uploadPhoto(v.crewId, v.photo) : null;
      const { error } = await supabase.from('visits').update({ photo_url: path }).eq('id', v.visitId);
      if (error) throw error;
      if (v.previousPath) await deletePhoto(v.previousPath);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteVisit() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('visits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSaveRating() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    // Kein upsert: visit_id/member_id dürfen nachträglich nicht geändert werden (Spaltenrechte)
    mutationFn: async (r: {
      existingId?: string;
      visitId: string;
      score: number;
      comment: string | null;
    }) => {
      const values = { taste_score: r.score, comment: r.comment?.trim() || null };
      const { error } = r.existingId
        ? await supabase.from('ratings').update(values).eq('id', r.existingId)
        : await supabase.from('ratings').insert({ ...values, visit_id: r.visitId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteRating() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ratings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
