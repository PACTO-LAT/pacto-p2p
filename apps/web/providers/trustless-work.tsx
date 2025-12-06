'use client'; // make sure this is a client component

import {
  development,
  mainNet,
  TrustlessWorkConfig,
} from '@trustless-work/escrow';
import type React from 'react';

interface TrustlessWorkProviderProps {
  children: React.ReactNode;
}

export function TrustlessWorkProvider({
  children,
}: TrustlessWorkProviderProps) {
  /**
   * Get the API key from the environment variables
   * Validate that it exists in production
   */
  const apiKey = process.env.NEXT_PUBLIC_TLW_API_KEY || '';

  // Determine which environment to use
  const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
  const baseURL = isProduction ? mainNet : development;

  // Warn in development if API key is missing
  if (!isProduction && !apiKey) {
    console.warn(
      'Trustless Work API key is missing. Set NEXT_PUBLIC_TLW_API_KEY environment variable.'
    );
  }

  // In production, require API key
  if (isProduction && !apiKey) {
    throw new Error(
      'NEXT_PUBLIC_TLW_API_KEY is required in production environment'
    );
  }

  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
