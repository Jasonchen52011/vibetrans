'use server';

import { getUserCredits } from '@/credits/credits';
import { userActionClient } from '@/lib/safe-action';
import type { User } from '@/lib/supabase/types';

/**
 * Get current user's credits
 */
export const getCreditBalanceAction = userActionClient.action(
  async ({ ctx }) => {
    try {
      const currentUser = (ctx as { user: User }).user;
      const credits = await getUserCredits(currentUser.id);
      return { success: true, credits };
    } catch (error) {
      console.error('get credit balance error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch credit balance',
      };
    }
  }
);
