'use client';

import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google';
import type { ReactNode } from 'react';

interface GoogleOAuthProviderProps {
  children: ReactNode;
}

/**
 * Google OAuth Provider Component
 * Wraps the application with Google OAuth context
 */
export const GoogleOAuthProvider = ({ children }: GoogleOAuthProviderProps) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // If no client ID is configured, just return children without provider
  if (!clientId) {
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
    return <>{children}</>;
  }

  return <GoogleProvider clientId={clientId}>{children}</GoogleProvider>;
};
