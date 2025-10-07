/**
 * Edge Runtime compatible database client using Supabase
 * This replaces postgres-js for Cloudflare Pages deployment
 */
import { createClient } from '@/lib/supabase/server';

/**
 * Get Supabase client for database operations
 * Edge Runtime compatible
 */
export async function getSupabaseDb() {
  return await createClient();
}

/**
 * Helper type for Supabase tables
 */
export type Database = {
  public: {
    Tables: {
      payment: {
        Row: {
          id: string;
          userId: string;
          type: string;
          status: string;
          amount: number;
          currency: string;
          priceId: string;
          stripeCustomerId: string | null;
          stripeSubscriptionId: string | null;
          stripePaymentIntentId: string | null;
          periodStart: Date | null;
          periodEnd: Date | null;
          cancelAtPeriodEnd: boolean;
          createdAt: Date;
          updatedAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['payment']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['payment']['Insert']>;
      };
      creditTransaction: {
        Row: {
          id: string;
          userId: string;
          amount: number;
          type: string;
          description: string;
          createdAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['creditTransaction']['Row'], 'id' | 'createdAt'>;
        Update: Partial<Database['public']['Tables']['creditTransaction']['Insert']>;
      };
      generationHistory: {
        Row: {
          id: string;
          userId: string;
          type: string;
          prompt: string | null;
          imageUrl: string | null;
          resultUrl: string | null;
          status: string;
          error: string | null;
          creditsUsed: number;
          taskId: string | null;
          metadata: string | null;
          createdAt: Date;
          updatedAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['generationHistory']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['generationHistory']['Insert']>;
      };
    };
  };
};
