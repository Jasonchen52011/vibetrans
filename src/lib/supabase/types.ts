import type { User as SupabaseUser } from '@supabase/supabase-js';

// Database User type (from legacy Better Auth user table)
// TODO: Migrate to use Supabase auth.users table only
export interface DatabaseUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
	role: string | null;
	banned: boolean | null;
	banReason: string | null;
	banExpires: Date | null;
	customerId: string | null;
}

// Extended User type with custom fields from user_metadata
export interface User extends SupabaseUser {
	name?: string;
	customerId?: string;
	image?: string;
	banned?: boolean;
	banReason?: string;
	banExpires?: number;
	emailVerified?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface Session {
	user: User;
}

// Helper to get name from user metadata
export function getUserName(user: SupabaseUser): string | undefined {
	return user.user_metadata?.name || user.email?.split('@')[0];
}

// Helper to convert Supabase user to our User type
export function toUser(supabaseUser: SupabaseUser): User {
	return {
		...supabaseUser,
		name: getUserName(supabaseUser),
		customerId: supabaseUser.user_metadata?.customerId,
		image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
		banned: supabaseUser.user_metadata?.banned || false,
		banReason: supabaseUser.user_metadata?.banReason,
		banExpires: supabaseUser.user_metadata?.banExpires,
		emailVerified: !!supabaseUser.email_confirmed_at,
		createdAt: supabaseUser.created_at,
		updatedAt: supabaseUser.updated_at,
	};
}
