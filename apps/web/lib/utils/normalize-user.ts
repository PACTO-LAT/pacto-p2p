import type { User } from '@/lib/types';

/**
 * Normalizes raw DB user row to User type.
 * Handles legacy/variant JSONB structures from seed or migrations.
 */
export function normalizeUserFromDb(
  raw: Record<string, unknown> | null
): User | null {
  if (!raw || typeof raw !== 'object') return null;

  const payment_methods = normalizePaymentMethods(raw.payment_methods);

  return {
    id: String(raw.id ?? ''),
    email: String(raw.email ?? ''),
    stellar_address: raw.stellar_address
      ? String(raw.stellar_address)
      : undefined,
    reputation_score: Number(raw.reputation_score ?? 0),
    total_trades: Number(raw.total_trades ?? 0),
    total_volume:
      raw.total_volume != null ? Number(raw.total_volume) : undefined,
    full_name: raw.full_name ? String(raw.full_name) : undefined,
    username: raw.username ? String(raw.username) : undefined,
    bio: raw.bio ? String(raw.bio) : undefined,
    avatar_url: raw.avatar_url ? String(raw.avatar_url) : undefined,
    phone: raw.phone ? String(raw.phone) : undefined,
    country: raw.country ? String(raw.country) : undefined,
    kyc_status: normalizeKycStatus(raw.kyc_status),
    user_type: normalizeUserType(raw.user_type),
    payment_methods,
    created_at: raw.created_at
      ? String(raw.created_at)
      : new Date().toISOString(),
    updated_at: raw.updated_at
      ? String(raw.updated_at)
      : new Date().toISOString(),
  };
}

function normalizePaymentMethods(v: unknown): User['payment_methods'] {
  if (!v || typeof v !== 'object') {
    return {
      sinpe_number: '',
      preferred_method: 'sinpe',
      bank_accounts: [],
    };
  }
  const o = v as Record<string, unknown>;
  const methods = (o.methods ?? o.bank_accounts ?? []) as Array<
    Record<string, unknown>
  >;
  const bank_accounts = Array.isArray(methods)
    ? methods.map((m) => ({
        bank_iban: String(m.bank_iban ?? m.account ?? ''),
        bank_name: String(m.bank_name ?? m.type ?? ''),
        bank_account_holder: String(m.bank_account_holder ?? ''),
      }))
    : [];

  const sinpe = methods?.find(
    (m) => String(m.type ?? '').toUpperCase() === 'SINPE'
  );
  const sinpe_number = sinpe
    ? String(sinpe.account ?? '')
    : String(o.sinpe_number ?? '');

  return {
    sinpe_number,
    preferred_method:
      (o.preferred_method as 'sinpe' | 'bank_transfer') ?? 'sinpe',
    bank_accounts,
  };
}

function normalizeUserType(v: unknown): 'user' | 'merchant' | 'admin' {
  const s = String(v ?? 'user').toLowerCase();
  if (s === 'admin' || s === 'merchant') return s;
  return 'user';
}

function normalizeKycStatus(v: unknown): 'pending' | 'verified' | 'rejected' {
  const s = String(v ?? 'pending').toLowerCase();
  if (s === 'verified' || s === 'rejected') return s;
  return 'pending';
}
