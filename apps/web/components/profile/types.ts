export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  phone: string;
  country: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
}

export interface ProfileStatsData {
  reputation_score: number;
  total_trades: number;
  total_volume: number;
  created_at: string;
}

export interface PaymentMethodsData {
  sinpe_number: string;
  preferred_method: 'sinpe' | 'bank_transfer';
  bank_accounts: Array<{
    bank_iban: string;
    bank_name: string;
    bank_account_holder: string;
  }>;
}

export interface NotificationSettingsData {
  email_trades: boolean;
  email_escrows: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export interface SecuritySettingsData {
  two_factor_enabled: boolean;
  login_notifications: boolean;
}

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  stellar_address: string;
  phone: string;
  country: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  reputation_score: number;
  total_trades: number;
  total_volume: number;
  created_at: string;
  notifications: NotificationSettingsData;
  security: SecuritySettingsData;
  payment_methods: PaymentMethodsData;
}
