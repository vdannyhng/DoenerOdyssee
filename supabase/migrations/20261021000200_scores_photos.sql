-- Noten in 0.1er-Schritten statt 0.5 (numeric(3,1) erzwingt bereits eine Nachkommastelle)
alter table public.ratings drop constraint ratings_taste_score_check;
alter table public.ratings add constraint ratings_taste_score_check check (taste_score between 0 and 10);

-- photo_url enthält ab jetzt den Pfad im privaten Bucket „photos“ (<crew_id>/<uuid>.jpg),
-- die App holt dazu kurzlebige Signed URLs.
comment on column public.spots.photo_url is 'Pfad im Storage-Bucket photos';
comment on column public.visits.photo_url is 'Pfad im Storage-Bucket photos';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 5 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Nur Mitglieder der Crew sehen und laden Fotos in den Ordner ihrer Crew
create policy photos_select on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = public.my_crew_id()::text);
create policy photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = public.my_crew_id()::text);
-- Löschen: wer hochgeladen hat, oder der Captain
create policy photos_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = public.my_crew_id()::text
    and (owner_id = auth.uid()::text or public.is_captain())
  );
