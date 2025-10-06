'use client';

import { useGoogleOneTapLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface GoogleOneTapProps {
  /**
   * Callback URL to redirect after successful login
   * @default '/dashboard'
   */
  callbackUrl?: string;
  /**
   * Whether to auto-select the account if only one account is available
   * @default true
   */
  autoSelect?: boolean;
}

/**
 * Google One Tap Login Component
 * Displays Google's One Tap login prompt
 */
export const GoogleOneTap = ({
  callbackUrl = '/dashboard',
  autoSelect = true,
}: GoogleOneTapProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (!credentialResponse.credential) {
        toast.error('Login failed', {
          description: 'No credential received from Google',
        });
        return;
      }

      setIsLoading(true);

      try {
        // Call backend API to verify and create session
        const response = await fetch('/api/auth/google-one-tap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        });

        const data = (await response.json()) as {
          success?: boolean;
          error?: string;
          user?: { name: string };
        };

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Login failed');
        }

        // Show success message
        toast.success('Login successful', {
          description: `Welcome back, ${data.user?.name || 'User'}!`,
        });

        // Redirect to callback URL
        router.push(callbackUrl);
        router.refresh();
      } catch (error) {
        console.error('Google One Tap login error:', error);
        toast.error('Login failed', {
          description:
            error instanceof Error ? error.message : 'An error occurred',
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.error('Google One Tap login error');
      // Don't show error toast here as user might have just closed the prompt
    },
    auto_select: autoSelect,
    cancel_on_tap_outside: true,
  });

  // This component doesn't render anything visible
  // The One Tap prompt is shown by Google's script
  return null;
};
