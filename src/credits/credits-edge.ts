/**
 * Edge Runtime compatible credit functions using Supabase
 * This replaces Drizzle ORM queries for Cloudflare Pages deployment
 */
import { getSupabaseDb } from '@/lib/supabase/database';
import { CREDIT_TRANSACTION_TYPE } from './types';

/**
 * Get user's current credit balance
 * @param userId - User ID
 * @returns User's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const supabase = await getSupabaseDb();

    const { data, error } = await supabase
      .from('userCredit')
      .select('currentCredits')
      .eq('userId', userId)
      .single();

    if (error || !data) {
      return 0;
    }

    return data.currentCredits || 0;
  } catch (error) {
    console.error('getUserCredits, error:', error);
    return 0;
  }
}

/**
 * Check if user has enough credits
 * @param params - Parameters
 * @returns True if user has enough credits
 */
export async function hasEnoughCredits(params: {
  userId: string;
  requiredCredits: number;
}): Promise<boolean> {
  const { userId, requiredCredits } = params;
  const currentCredits = await getUserCredits(userId);
  return currentCredits >= requiredCredits;
}

/**
 * Consume credits from user
 * @param params - Parameters
 */
export async function consumeCredits(params: {
  userId: string;
  amount: number;
  description: string;
}): Promise<void> {
  const { userId, amount, description } = params;

  try {
    const supabase = await getSupabaseDb();

    // Get current credits
    const currentCredits = await getUserCredits(userId);

    if (currentCredits < amount) {
      throw new Error(
        `Insufficient credits. Required: ${amount}, Available: ${currentCredits}`
      );
    }

    // Update user credits
    const newCredits = currentCredits - amount;
    const { error: updateError } = await supabase
      .from('userCredit')
      .update({ currentCredits: newCredits })
      .eq('userId', userId);

    if (updateError) {
      throw new Error(`Failed to update user credits: ${updateError.message}`);
    }

    // Create transaction record
    const { error: txError } = await supabase.from('creditTransaction').insert({
      userId,
      amount: -amount,
      type: CREDIT_TRANSACTION_TYPE.USAGE,
      description,
    });

    if (txError) {
      console.error('Failed to create transaction record:', txError);
      // Don't throw here, credits were already deducted
    }
  } catch (error) {
    console.error('consumeCredits, error:', error);
    throw error;
  }
}
