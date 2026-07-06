export type CountryCode = 'CR' | 'MX' | 'BR' | 'CO' | 'AR';
export type PaymentMethodId =
  | 'sinpe'
  | 'spei'
  | 'pix'
  | 'nequi'
  | 'pse'
  | 'daviplata'
  | 'mercado_pago'
  | 'bank_transfer';

export interface PaymentMethodDef {
  id: PaymentMethodId;
  label: string;
  kind: 'instant' | 'bank';
  detailLabel?: string;
  detailPlaceholder?: string;
}

export interface CountryPaymentConfig {
  country: CountryCode;
  countryName: string;
  currency: 'CRC' | 'MXN' | 'BRL' | 'COP' | 'ARS';
  methods: PaymentMethodId[];
  bankIdentifier: {
    key: 'iban' | 'clabe' | 'cbu_cvu' | 'account_number';
    label: string;
    placeholder: string;
  };
}

export const PAYMENT_METHODS: Record<PaymentMethodId, PaymentMethodDef> = {
  sinpe: {
    id: 'sinpe',
    label: 'SINPE Móvil',
    kind: 'instant',
    detailLabel: 'Phone Number',
    detailPlaceholder: '+506 1234 5678',
  },
  spei: {
    id: 'spei',
    label: 'SPEI',
    kind: 'instant',
    detailLabel: 'CLABE',
    detailPlaceholder: '18-digit CLABE',
  },
  pix: {
    id: 'pix',
    label: 'PIX',
    kind: 'instant',
    detailLabel: 'PIX Key',
    detailPlaceholder: 'CPF, email, phone, or random key',
  },
  nequi: {
    id: 'nequi',
    label: 'Nequi',
    kind: 'instant',
    detailLabel: 'Phone Number',
    detailPlaceholder: '+57 300 123 4567',
  },
  pse: {
    id: 'pse',
    label: 'PSE',
    kind: 'instant',
    detailLabel: 'Registered Email',
    detailPlaceholder: 'Email used for PSE payments',
  },
  daviplata: {
    id: 'daviplata',
    label: 'Daviplata',
    kind: 'instant',
    detailLabel: 'Phone Number',
    detailPlaceholder: '+57 300 123 4567',
  },
  mercado_pago: {
    id: 'mercado_pago',
    label: 'Mercado Pago',
    kind: 'instant',
    detailLabel: 'Alias/CVU',
    detailPlaceholder: 'Mercado Pago alias or CVU',
  },
  bank_transfer: {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    kind: 'bank',
  },
};

export const COUNTRY_PAYMENT_CONFIGS: Record<
  CountryCode,
  CountryPaymentConfig
> = {
  CR: {
    country: 'CR',
    countryName: 'Costa Rica',
    currency: 'CRC',
    methods: ['sinpe', 'bank_transfer'],
    bankIdentifier: {
      key: 'iban',
      label: 'IBAN',
      placeholder: 'CR05015202001026284066',
    },
  },
  MX: {
    country: 'MX',
    countryName: 'Mexico',
    currency: 'MXN',
    methods: ['spei', 'bank_transfer'],
    bankIdentifier: {
      key: 'clabe',
      label: 'CLABE',
      placeholder: '18-digit CLABE',
    },
  },
  BR: {
    country: 'BR',
    countryName: 'Brazil',
    currency: 'BRL',
    methods: ['pix', 'bank_transfer'],
    bankIdentifier: {
      key: 'account_number',
      label: 'Account Number',
      placeholder: 'Bank branch and account number',
    },
  },
  CO: {
    country: 'CO',
    countryName: 'Colombia',
    currency: 'COP',
    methods: ['nequi', 'pse', 'daviplata', 'bank_transfer'],
    bankIdentifier: {
      key: 'account_number',
      label: 'Account Number',
      placeholder: 'Bank account number',
    },
  },
  AR: {
    country: 'AR',
    countryName: 'Argentina',
    currency: 'ARS',
    methods: ['mercado_pago', 'bank_transfer'],
    bankIdentifier: {
      key: 'cbu_cvu',
      label: 'CBU/CVU',
      placeholder: '22-digit CBU or CVU',
    },
  },
};

const COUNTRY_LOOKUP = Object.values(COUNTRY_PAYMENT_CONFIGS).flatMap(
  (config) => [
    { key: config.country.toLowerCase(), config },
    { key: config.countryName.toLowerCase(), config },
  ]
);

export function getCountryConfig(
  countryInput: string
): CountryPaymentConfig | null {
  const normalized = countryInput.trim().toLowerCase();
  if (!normalized) return null;

  const match = COUNTRY_LOOKUP.find(({ key }) => key === normalized);
  return match?.config ?? null;
}

export function getConfigByCurrency(
  currency: string
): CountryPaymentConfig | null {
  const normalized = currency.trim().toUpperCase();
  return (
    Object.values(COUNTRY_PAYMENT_CONFIGS).find(
      (config) => config.currency === normalized
    ) ?? null
  );
}

export function getListingPaymentMethodOptions(
  currency: string
): PaymentMethodDef[] {
  const config = getConfigByCurrency(currency);
  if (!config) {
    return [PAYMENT_METHODS.bank_transfer];
  }

  return config.methods.map((methodId) => PAYMENT_METHODS[methodId]);
}
