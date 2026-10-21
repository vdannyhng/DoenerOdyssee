import { t } from '@/i18n/de';

type ErrorLike = { code?: string; message?: string; name?: string; status?: number };

/** Ausnahmen aus den RPCs (raise exception '…') → Anzeige-Text */
const RPC_MESSAGES: Record<string, string> = {
  invalid_code: t.errors.invalidCode,
  already_member: t.errors.alreadyMember,
  not_captain: t.errors.notAllowed,
  cannot_remove_self: t.errors.notAllowed,
};

/** Datenbank-, Auth- und Netzwerkfehler → verständliche deutsche Meldung */
export function errorMessage(error: unknown): string {
  const e = (error ?? {}) as ErrorLike;
  const message = e.message ?? '';
  if (message in RPC_MESSAGES) return RPC_MESSAGES[message]!;
  if (e.code === 'invalid_credentials' || /invalid login credentials/i.test(message))
    return t.errors.invalidLogin;
  if (e.code === 'user_already_exists' || /already registered/i.test(message)) return t.errors.emailTaken;
  if (e.code === 'weak_password' || /password should be/i.test(message)) return t.errors.weakPassword;
  if (e.code === '42501' || e.code === 'PGRST301') return t.errors.notAllowed;
  if (e.name === 'AuthRetryableFetchError' || /network request failed|failed to fetch/i.test(message)) {
    return t.errors.network;
  }
  return t.errors.generic;
}
