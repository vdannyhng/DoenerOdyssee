// Prüft die Zugriffsregeln (RLS) gegen die lokale Supabase: `npm run db:start`, dann `npm run test:rls`.
// Legt Wegwerf-Konten an (zufällige E-Mails) – nur lokal ausführen.
import { readFileSync } from 'node:fs';

import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => l.trim().split(/=(.*)/s).slice(0, 2)),
);
const URL = env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!/127\.0\.0\.1|localhost/.test(URL)) throw new Error('Nur gegen die lokale Datenbank ausführen!');

let failed = 0;
const check = (label, ok) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed++;
};

async function user(name) {
  const client = createClient(URL, KEY, { auth: { persistSession: false } });
  const email = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
  const { error } = await client.auth.signUp({ email, password: 'passwort123' });
  if (error) throw error;
  return client;
}

const anna = await user('anna');
const ben = await user('ben');
const outsider = await user('cem');

const { data: captain, error: crewError } = await anna.rpc('create_crew', {
  crew_name: 'Testcrew',
  display_name: 'Anna',
  avatar: 'captain',
  color: '#1D4E89',
});
if (crewError) throw crewError;
const { data: crew } = await anna.from('crews').select('*').single();
check('Captain sieht eigene Crew mit Code', crew?.invite_code?.length === 6);

const { error: badJoin } = await ben.rpc('join_crew', {
  code: 'XXXXXX',
  display_name: 'Ben',
  avatar: 'cook',
  color: '#A8261D',
});
check('Falscher Einladungscode wird abgelehnt', badJoin?.message === 'invalid_code');

const { data: benMember, error: joinError } = await ben.rpc('join_crew', {
  code: crew.invite_code.toLowerCase(),
  display_name: 'Ben',
  avatar: 'cook',
  color: '#A8261D',
});
check('Beitritt per Code (Gross-/Kleinschreibung egal)', !joinError && benMember?.role === 'pirate');

const { error: twice } = await ben.rpc('create_crew', {
  crew_name: 'Zweite',
  display_name: 'Ben',
  avatar: 'cook',
  color: '#A8261D',
});
check('Nur eine Crew pro Person', twice?.message === 'already_member');

const { data: spot, error: spotError } = await anna
  .from('spots')
  .insert({ name: 'Bosporus Grill', lat: 47.37, lng: 8.54, address: 'Hauptstrasse 1' })
  .select()
  .single();
check('Spot anlegen (crew_id/created_by aus Sitzung)', !spotError && spot.crew_id === crew.id);

const { data: visit, error: visitError } = await anna
  .from('visits')
  .insert({ spot_id: spot.id })
  .select()
  .single();
check('Besuch anlegen', !visitError && visit.crew_id === crew.id);

const { error: pError } = await anna.from('visit_participants').insert([
  { visit_id: visit.id, member_id: captain.id },
  { visit_id: visit.id, member_id: benMember.id },
]);
check('Teilnehmer eintragen', !pError);

const { data: annaRating, error: rError } = await anna
  .from('ratings')
  .insert({ visit_id: visit.id, taste_score: 8.5 })
  .select()
  .single();
check('Eigene Note abgeben', !rError && annaRating.member_id === captain.id);

const { error: forged } = await ben
  .from('ratings')
  .insert({ visit_id: visit.id, member_id: captain.id, taste_score: 1 });
check('Note im Namen anderer wird abgelehnt', !!forged);

const { error: badScore } = await ben.from('ratings').insert({ visit_id: visit.id, taste_score: 10.5 });
check('Noten über 10 werden abgelehnt', !!badScore);

const { error: benRateError } = await ben.from('ratings').insert({ visit_id: visit.id, taste_score: 8.7 });
check('Ben bewertet selbst (0.1er-Schritt)', !benRateError);

const { data: benUpdate } = await ben
  .from('ratings')
  .update({ taste_score: 0 })
  .eq('id', annaRating.id)
  .select();
const { data: annaAfter } = await anna.from('ratings').select('taste_score').eq('id', annaRating.id).single();
check('Fremde Note lässt sich nicht ändern', benUpdate?.length === 0 && annaAfter.taste_score === 8.5);

const { data: benDelete } = await ben.from('ratings').delete().eq('id', annaRating.id).select();
check('Fremde Note lässt sich nicht löschen', benDelete?.length === 0);

const { data: allRatings } = await ben.from('ratings').select('*');
check('Crew sieht alle Noten', allRatings?.length === 2);

const { data: roleHack, error: roleError } = await ben
  .from('members')
  .update({ role: 'captain' })
  .eq('id', benMember.id)
  .select();
check('Rolle lässt sich nicht selbst ändern', !!roleError || roleHack?.length === 0);

const { data: benSpotDelete } = await ben.from('spots').delete().eq('id', spot.id).select();
check('Nur Captain löscht Spots', benSpotDelete?.length === 0);

const { error: notCaptain } = await ben.rpc('regenerate_invite_code');
check('Nur Captain erneuert den Code', notCaptain?.message === 'not_captain');

const [os, ov, or, om] = await Promise.all([
  outsider.from('spots').select('*'),
  outsider.from('visits').select('*'),
  outsider.from('ratings').select('*'),
  outsider.from('members').select('*'),
]);
check(
  'Aussenstehende sehen nichts',
  [os, ov, or, om].every((r) => (r.data?.length ?? 0) === 0),
);

const { error: outsiderInsert } = await outsider
  .from('ratings')
  .insert({ visit_id: visit.id, taste_score: 10 });
check('Aussenstehende können nicht bewerten', !!outsiderInsert);

// Fotos: privater Bucket, je Crew ein Ordner
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const photoPath = `${crew.id}/rls-test.jpg`;
const { error: upError } = await ben.storage
  .from('photos')
  .upload(photoPath, jpeg, { contentType: 'image/jpeg' });
check('Foto in den eigenen Crew-Ordner hochladen', !upError);

const { error: foreignUp } = await outsider.storage
  .from('photos')
  .upload(photoPath.replace('rls-test', 'fremd'), jpeg, { contentType: 'image/jpeg' });
check('Fremde laden nicht in den Crew-Ordner', !!foreignUp);

const { data: annaSigned } = await anna.storage.from('photos').createSignedUrl(photoPath, 60);
const { data: outsiderSigned } = await outsider.storage.from('photos').createSignedUrl(photoPath, 60);
check('Crew sieht Fotos, Aussenstehende nicht', !!annaSigned?.signedUrl && !outsiderSigned?.signedUrl);

const { data: outsiderRemoved } = await outsider.storage.from('photos').remove([photoPath]);
check('Aussenstehende löschen keine Fotos', (outsiderRemoved?.length ?? 0) === 0);

const { error: removeError } = await anna.rpc('remove_member', { target_member: benMember.id });
const { data: benGone } = await ben.from('spots').select('*');
check('Captain entfernt Mitglied, danach kein Zugriff', !removeError && benGone?.length === 0);

console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : '\nAlle RLS-Prüfungen bestanden');
process.exit(failed ? 1 : 0);
