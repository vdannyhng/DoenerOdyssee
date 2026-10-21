-- Döner Odyssee – Kernschema: Crews, Mitglieder, Spots, Besuche, Bewertungen.
-- Berechnete Werte (Gesamtwert, Rang, Tier) werden NICHT gespeichert, sondern client-seitig
-- mit getesteter Logik berechnet (src/features/ranking/scoring.ts).

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table public.crews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  invite_code text not null unique,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews (id) on delete cascade,
  -- Eine Person gehört genau einer Crew an (eine App-Instanz = eine Crew)
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 30),
  avatar text not null default 'buccaneer',
  color text not null default '#1D4E89' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  role text not null default 'pirate' check (role in ('captain', 'pirate')),
  created_at timestamptz not null default now()
);
create index members_crew_idx on public.members (crew_id);

create table public.spots (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  address text not null default '',
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  price numeric(6, 2) check (price is null or price >= 0),
  photo_url text,
  note text check (note is null or char_length(note) <= 500),
  created_by uuid references public.members (id) on delete set null,
  created_at timestamptz not null default now()
);
create index spots_crew_idx on public.spots (crew_id);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  -- Redundant zur Spot-Zuordnung, damit RLS ohne Join auskommt; per Trigger gesetzt
  crew_id uuid not null references public.crews (id) on delete cascade,
  visited_on date not null default current_date,
  meal_type text check (meal_type in ('kebab', 'duerum', 'teller', 'vegi', 'sonstiges')),
  photo_url text,
  created_by uuid references public.members (id) on delete set null,
  created_at timestamptz not null default now()
);
create index visits_spot_idx on public.visits (spot_id);
create index visits_crew_idx on public.visits (crew_id);

create table public.visit_participants (
  visit_id uuid not null references public.visits (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  primary key (visit_id, member_id)
);
create index visit_participants_member_idx on public.visit_participants (member_id);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  taste_score numeric(3, 1) not null
    check (taste_score between 0 and 10 and mod(taste_score * 2, 1) = 0),
  comment text check (comment is null or char_length(comment) <= 280),
  extra_scores jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (visit_id, member_id)
);
create index ratings_member_idx on public.ratings (member_id);

-- ---------------------------------------------------------------------------
-- Hilfsfunktionen (security definer, damit RLS-Policies nicht rekursiv auf members zugreifen)
-- ---------------------------------------------------------------------------

create function public.my_member_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.members where user_id = auth.uid()
$$;

create function public.my_crew_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select crew_id from public.members where user_id = auth.uid()
$$;

create function public.is_captain() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select role = 'captain' from public.members where user_id = auth.uid()), false)
$$;

-- Standardwerte aus der Sitzung, damit der Client Crew/Ersteller nicht mitschicken muss
alter table public.spots
  alter column crew_id set default public.my_crew_id(),
  alter column created_by set default public.my_member_id();
alter table public.visits
  alter column crew_id set default public.my_crew_id(),
  alter column created_by set default public.my_member_id();
alter table public.ratings
  alter column member_id set default public.my_member_id();

-- Einladungscode: 6 Zeichen ohne verwechselbare Zeichen (0/O, 1/I/L)
create function public.generate_invite_code() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea;
  code text;
begin
  loop
    bytes := extensions.gen_random_bytes(6);
    code := '';
    for i in 0..5 loop
      code := code || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.crews where invite_code = code);
  end loop;
  return code;
end;
$$;

-- ---------------------------------------------------------------------------
-- Trigger
-- ---------------------------------------------------------------------------

-- crew_id eines Besuchs immer aus dem Spot übernehmen (nicht vom Client vertrauen)
create function public.visits_set_crew() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  select crew_id into new.crew_id from public.spots where id = new.spot_id;
  return new;
end;
$$;
create trigger visits_set_crew before insert or update of spot_id on public.visits
  for each row execute function public.visits_set_crew();

-- Wer bewertet, nimmt am Besuch teil
create function public.ratings_add_participant() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.visit_participants (visit_id, member_id)
  values (new.visit_id, new.member_id)
  on conflict do nothing;
  return new;
end;
$$;
create trigger ratings_add_participant after insert on public.ratings
  for each row execute function public.ratings_add_participant();

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger ratings_touch before update on public.ratings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.crews enable row level security;
alter table public.members enable row level security;
alter table public.spots enable row level security;
alter table public.visits enable row level security;
alter table public.visit_participants enable row level security;
alter table public.ratings enable row level security;

-- Anonyme Nutzer sehen gar nichts
revoke all on public.crews, public.members, public.spots, public.visits,
  public.visit_participants, public.ratings from anon;

-- crews: lesen für Mitglieder, Name/Einstellungen ändern nur Captain; Anlegen nur per RPC
create policy crews_select on public.crews for select to authenticated
  using (id = public.my_crew_id());
create policy crews_update on public.crews for update to authenticated
  using (id = public.my_crew_id() and public.is_captain())
  with check (id = public.my_crew_id());
revoke insert, update, delete on public.crews from authenticated;
grant update (name, settings) on public.crews to authenticated;

-- members: alle der Crew lesen; eigenes Profil ändern (Rolle/Crew nicht); Beitritt/Entfernen per RPC
create policy members_select on public.members for select to authenticated
  using (crew_id = public.my_crew_id());
create policy members_update_self on public.members for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
revoke insert, update, delete on public.members from authenticated;
grant update (display_name, avatar, color) on public.members to authenticated;

-- spots: Crew liest und legt an; ändern Ersteller oder Captain; löschen nur Captain
create policy spots_select on public.spots for select to authenticated
  using (crew_id = public.my_crew_id());
create policy spots_insert on public.spots for insert to authenticated
  with check (crew_id = public.my_crew_id() and created_by = public.my_member_id());
create policy spots_update on public.spots for update to authenticated
  using (crew_id = public.my_crew_id() and (created_by = public.my_member_id() or public.is_captain()))
  with check (crew_id = public.my_crew_id());
create policy spots_delete on public.spots for delete to authenticated
  using (crew_id = public.my_crew_id() and public.is_captain());
revoke update on public.spots from authenticated;
grant update (name, address, lat, lng, price, photo_url, note) on public.spots to authenticated;

-- visits: Crew liest und legt an; ändern/löschen Ersteller oder Captain
create policy visits_select on public.visits for select to authenticated
  using (crew_id = public.my_crew_id());
create policy visits_insert on public.visits for insert to authenticated
  with check (
    created_by = public.my_member_id()
    and exists (select 1 from public.spots s where s.id = spot_id and s.crew_id = public.my_crew_id())
  );
create policy visits_update on public.visits for update to authenticated
  using (crew_id = public.my_crew_id() and (created_by = public.my_member_id() or public.is_captain()))
  with check (crew_id = public.my_crew_id());
create policy visits_delete on public.visits for delete to authenticated
  using (crew_id = public.my_crew_id() and (created_by = public.my_member_id() or public.is_captain()));
revoke update on public.visits from authenticated;
grant update (visited_on, meal_type, photo_url) on public.visits to authenticated;

-- visit_participants: Crew liest; Ersteller des Besuchs verwaltet, jeder darf sich selbst ein-/austragen
create policy participants_select on public.visit_participants for select to authenticated
  using (exists (select 1 from public.visits v where v.id = visit_id and v.crew_id = public.my_crew_id()));
create policy participants_insert on public.visit_participants for insert to authenticated
  with check (
    exists (select 1 from public.members m where m.id = member_id and m.crew_id = public.my_crew_id())
    and exists (
      select 1 from public.visits v
      where v.id = visit_id and v.crew_id = public.my_crew_id()
        and (v.created_by = public.my_member_id() or member_id = public.my_member_id())
    )
  );
create policy participants_delete on public.visit_participants for delete to authenticated
  using (
    exists (
      select 1 from public.visits v
      where v.id = visit_id and v.crew_id = public.my_crew_id()
        and (v.created_by = public.my_member_id() or member_id = public.my_member_id())
    )
  );

-- ratings: Crew liest alle; jede Person schreibt/ändert/löscht nur die eigenen
create policy ratings_select on public.ratings for select to authenticated
  using (exists (select 1 from public.visits v where v.id = visit_id and v.crew_id = public.my_crew_id()));
create policy ratings_insert on public.ratings for insert to authenticated
  with check (
    member_id = public.my_member_id()
    and exists (select 1 from public.visits v where v.id = visit_id and v.crew_id = public.my_crew_id())
  );
create policy ratings_update on public.ratings for update to authenticated
  using (member_id = public.my_member_id())
  with check (member_id = public.my_member_id());
create policy ratings_delete on public.ratings for delete to authenticated
  using (member_id = public.my_member_id());
revoke update on public.ratings from authenticated;
grant update (taste_score, comment, extra_scores) on public.ratings to authenticated;

-- ---------------------------------------------------------------------------
-- RPCs für Crew-Verwaltung
-- ---------------------------------------------------------------------------

create function public.create_crew(crew_name text, display_name text, avatar text, color text)
returns public.members
language plpgsql security definer set search_path = '' as $$
declare
  new_crew public.crews;
  new_member public.members;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from public.members where user_id = auth.uid()) then
    raise exception 'already_member';
  end if;
  insert into public.crews (name, invite_code)
  values (trim(crew_name), public.generate_invite_code())
  returning * into new_crew;
  insert into public.members (crew_id, user_id, display_name, avatar, color, role)
  values (new_crew.id, auth.uid(), trim(display_name), avatar, color, 'captain')
  returning * into new_member;
  return new_member;
end;
$$;

create function public.join_crew(code text, display_name text, avatar text, color text)
returns public.members
language plpgsql security definer set search_path = '' as $$
declare
  target uuid;
  new_member public.members;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from public.members where user_id = auth.uid()) then
    raise exception 'already_member';
  end if;
  select id into target from public.crews where invite_code = upper(trim(code));
  if target is null then raise exception 'invalid_code'; end if;
  insert into public.members (crew_id, user_id, display_name, avatar, color, role)
  values (target, auth.uid(), trim(display_name), avatar, color, 'pirate')
  returning * into new_member;
  return new_member;
end;
$$;

create function public.regenerate_invite_code() returns text
language plpgsql security definer set search_path = '' as $$
declare
  code text;
begin
  if not public.is_captain() then raise exception 'not_captain'; end if;
  code := public.generate_invite_code();
  update public.crews set invite_code = code where id = public.my_crew_id();
  return code;
end;
$$;

create function public.remove_member(target_member uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_captain() then raise exception 'not_captain'; end if;
  if target_member = public.my_member_id() then raise exception 'cannot_remove_self'; end if;
  delete from public.members where id = target_member and crew_id = public.my_crew_id();
end;
$$;

revoke execute on function public.create_crew, public.join_crew, public.regenerate_invite_code,
  public.remove_member, public.generate_invite_code from public, anon;
grant execute on function public.create_crew, public.join_crew, public.regenerate_invite_code,
  public.remove_member to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: neue Bewertungen/Besuche/Spots ohne manuelles Neuladen
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.spots, public.visits,
  public.visit_participants, public.ratings, public.members;
