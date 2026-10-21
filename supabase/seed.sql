-- Demo-Daten NUR für die lokale Entwicklung (`npm run db:reset` spielt sie ein).
-- Logins: anna@crew.test / ben@crew.test / cem@crew.test, Passwort jeweils „doener123“.
-- Einladungscode der Demo-Crew: DEMO42

do $$
declare
  anna uuid := '11111111-1111-1111-1111-111111111111';
  ben uuid := '22222222-2222-2222-2222-222222222222';
  cem uuid := '33333333-3333-3333-3333-333333333333';
  crew uuid := 'c0000000-0000-0000-0000-000000000001';
  m_anna uuid := 'a0000000-0000-0000-0000-000000000001';
  m_ben uuid := 'a0000000-0000-0000-0000-000000000002';
  m_cem uuid := 'a0000000-0000-0000-0000-000000000003';
  u record;
begin
  for u in
    select * from (values (anna, 'anna@crew.test'), (ben, 'ben@crew.test'), (cem, 'cem@crew.test')) as t (id, email)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      extensions.crypt('doener123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now());
  end loop;

  insert into public.crews (id, name, invite_code) values (crew, 'Die Dürüm-Bande', 'DEMO42');
  insert into public.members (id, crew_id, user_id, display_name, avatar, color, role) values
    (m_anna, crew, anna, 'Anna Scharfzunge', 'captain', '#A8261D', 'captain'),
    (m_ben, crew, ben, 'Ben Bratspiess', 'cook', '#1D4E89', 'pirate'),
    (m_cem, crew, cem, 'Cem Kompass', 'navigator', '#2E6B34', 'pirate');
end $$;

-- Spots (fiktive Läden, Koordinaten in Berlin)
insert into public.spots (id, crew_id, name, address, lat, lng, price, note, created_by) values
  ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Bosporus Grill', 'Kottbusser Damm 12, Berlin', 52.4930, 13.4210, 7.50, 'Kräutersosse ist Pflicht!', 'a0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Anadolu Spiess', 'Sonnenallee 40, Berlin', 52.4860, 13.4330, 6.50, null, 'a0000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Kebab Kapitän', 'Warschauer Str. 5, Berlin', 52.5070, 13.4490, 8.00, null, 'a0000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Dürüm Hafen', 'Torstrasse 101, Berlin', 52.5290, 13.4010, 7.00, 'Nur Barzahlung', 'a0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Sultan Döner', 'Karl-Marx-Str. 88, Berlin', 52.4790, 13.4390, 6.00, null, 'a0000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'Goldener Spiess', 'Müllerstr. 30, Berlin', 52.5480, 13.3610, 7.80, null, 'a0000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'Meerblick Imbiss', 'Schönhauser Allee 60, Berlin', 52.5410, 13.4120, 8.50, null, 'a0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'Ali Baba Kebab', 'Turmstr. 15, Berlin', 52.5270, 13.3410, 5.50, null, 'a0000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'Ufer Grill', 'Paul-Lincke-Ufer 3, Berlin', 52.4960, 13.4250, 7.20, null, 'a0000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 'Nachtwache Döner', 'Frankfurter Allee 70, Berlin', 52.5140, 13.4750, 6.80, 'Bis 5 Uhr offen', 'a0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'Leuchtturm Kebab', 'Bergmannstr. 9, Berlin', 52.4890, 13.3920, 9.00, null, 'a0000000-0000-0000-0000-000000000002'),
  -- Wunschliste: noch nicht probiert
  ('50000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000001', 'Piratenbucht Grill', 'Oranienstr. 20, Berlin', 52.5010, 13.4180, null, 'Soll legendär sein', 'a0000000-0000-0000-0000-000000000003');

-- Je Spot ein Besuch mit allen drei; Noten (Anna, Ben, Cem)
with scores (n, anna, ben, cem, days_ago) as (
  values
    (1, 9.5, 9.0, 10.0, 3),
    (2, 8.5, 9.0, 8.0, 10),
    (3, 8.0, 7.5, 9.0, 17),
    (4, 7.5, 8.0, 7.0, 24),
    (5, 7.0, 7.5, 6.5, 31),
    (6, 6.5, 7.0, 7.5, 38),
    (7, 6.0, 7.0, 6.0, 45),
    (8, 5.5, 6.0, 4.5, 52),
    (9, 5.0, 4.0, 6.0, 59),
    (10, 4.0, 3.5, 5.0, 66),
    (11, 3.0, 2.5, 4.0, 73)
),
v as (
  insert into public.visits (id, spot_id, crew_id, visited_on, meal_type, created_by)
  select
    ('60000000-0000-0000-0000-0000000000' || lpad(n::text, 2, '0'))::uuid,
    ('50000000-0000-0000-0000-0000000000' || lpad(n::text, 2, '0'))::uuid,
    'c0000000-0000-0000-0000-000000000001',
    current_date - days_ago,
    (array['kebab', 'duerum', 'teller'])[1 + n % 3],
    'a0000000-0000-0000-0000-000000000001'
  from scores
  returning id
)
insert into public.ratings (visit_id, member_id, taste_score, comment)
select ('60000000-0000-0000-0000-0000000000' || lpad(s.n::text, 2, '0'))::uuid, r.member_id, r.score, r.comment
from scores s
cross join lateral (
  values
    ('a0000000-0000-0000-0000-000000000001'::uuid, s.anna, case when s.n = 1 then 'Bester Döner der sieben Meere!' end),
    ('a0000000-0000-0000-0000-000000000002'::uuid, s.ben, null),
    ('a0000000-0000-0000-0000-000000000003'::uuid, s.cem, case when s.n = 11 then 'Brot war leider pappig' end)
) as r (member_id, score, comment);

-- Zweiter Besuch beim Bosporus Grill: Anna und Ben dabei, Anna hat noch nicht bewertet
insert into public.visits (id, spot_id, crew_id, visited_on, meal_type, created_by)
values ('60000000-0000-0000-0000-000000000099', '50000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001', current_date, 'duerum', 'a0000000-0000-0000-0000-000000000002');
insert into public.ratings (visit_id, member_id, taste_score)
values ('60000000-0000-0000-0000-000000000099', 'a0000000-0000-0000-0000-000000000002', 8.5);

-- Teilnehmer aus den Bewertungen (der Trigger erledigt das ebenfalls) plus Anna beim offenen Besuch
insert into public.visit_participants (visit_id, member_id)
select distinct visit_id, member_id from public.ratings
on conflict do nothing;
insert into public.visit_participants (visit_id, member_id)
values ('60000000-0000-0000-0000-000000000099', 'a0000000-0000-0000-0000-000000000001')
on conflict do nothing;
