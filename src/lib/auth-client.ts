// Temporary bridge file for Supabase migration
// This file provides compatibility with old Better Auth imports
// TODO: Remove this file after all components are migrated

'use client';

import { createClient } from './supabase/client';
import { useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export const authClient = {
	signOut: async () => {
		const supabase = createClient();
		return await supabase.auth.signOut();
	},

	forgetPassword: async (
		{ email, redirectTo }: { email: string; redirectTo: string },
		callbacks?: {
			onRequest?: (ctx: any) => void;
			onResponse?: (ctx: any) => void;
			onSuccess?: (ctx: any) => void;
			onError?: (ctx: any) => void;
		}
	) => {
		callbacks?.onRequest?.({});
		const supabase = createClient();
		const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: window.location.origin + redirectTo,
		});
		callbacks?.onResponse?.({ response: { data, error } });
		if (error) {
			callbacks?.onError?.({ error });
		} else {
			callbacks?.onSuccess?.({ data });
		}
		return { data, error };
	},

	signUp: {
		email: async (
			{ email, password, name, callbackURL }: { email: string; password: string; name?: string; callbackURL?: string },
			callbacks?: {
				onRequest?: (ctx: any) => void;
				onResponse?: (ctx: any) => void;
				onSuccess?: (ctx: any) => void;
				onError?: (ctx: any) => void;
			}
		) => {
			callbacks?.onRequest?.({});
			const supabase = createClient();
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: { name },
					emailRedirectTo: callbackURL ? window.location.origin + callbackURL : undefined,
				},
			});
			callbacks?.onResponse?.({ response: { data, error } });
			if (error) {
				callbacks?.onError?.({ error });
			} else {
				callbacks?.onSuccess?.({ data });
			}
			return { data, error };
		},
	},

	signIn: {
		social: async (
			{ provider, callbackURL }: { provider: 'google' | 'github'; callbackURL?: string },
			callbacks?: {
				onRequest?: (ctx: any) => void;
				onResponse?: (ctx: any) => void;
				onSuccess?: (ctx: any) => void;
				onError?: (ctx: any) => void;
			}
		) => {
			callbacks?.onRequest?.({});
			const supabase = createClient();
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: callbackURL ? window.location.origin + callbackURL : window.location.origin + '/auth/callback',
				},
			});
			callbacks?.onResponse?.({ response: { data, error } });
			if (error) {
				callbacks?.onError?.({ error });
			} else {
				callbacks?.onSuccess?.({ data });
			}
			return { data, error };
		},
	},

	resetPassword: async (
		{ password }: { password: string },
		callbacks?: {
			onRequest?: (ctx: any) => void;
			onResponse?: (ctx: any) => void;
			onSuccess?: (ctx: any) => void;
			onError?: (ctx: any) => void;
		}
	) => {
		callbacks?.onRequest?.({});
		const supabase = createClient();
		const { data, error } = await supabase.auth.updateUser({ password });
		callbacks?.onResponse?.({ response: { data, error } });
		if (error) {
			callbacks?.onError?.({ error });
		} else {
			callbacks?.onSuccess?.({ data });
		}
		return { data, error };
	},

	updateUser: async (
		{ name, image }: { name?: string; image?: string },
		callbacks?: {
			onRequest?: (ctx: any) => void;
			onResponse?: (ctx: any) => void;
			onSuccess?: (ctx: any) => void;
			onError?: (ctx: any) => void;
		}
	) => {
		callbacks?.onRequest?.({});
		const supabase = createClient();
		const updateData: any = {};
		if (name !== undefined) updateData.name = name;
		if (image !== undefined) updateData.avatar_url = image;

		const { data, error } = await supabase.auth.updateUser({
			data: updateData,
		});
		callbacks?.onResponse?.({ response: { data, error } });
		if (error) {
			callbacks?.onError?.({ error });
		} else {
			callbacks?.onSuccess?.({ data });
		}
		return { data, error };
	},

	changePassword: async (
		{ currentPassword, newPassword, revokeOtherSessions }: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean },
		callbacks?: {
			onRequest?: (ctx: any) => void;
			onResponse?: (ctx: any) => void;
			onSuccess?: (ctx: any) => void;
			onError?: (ctx: any) => void;
		}
	) => {
		callbacks?.onRequest?.({});
		// TODO: Implement password change with current password verification
		// Supabase doesn't have built-in current password verification
		// This should be implemented as a server action that:
		// 1. Verifies current password via signInWithPassword
		// 2. Updates password via updateUser
		// For now, just update password without verification (security risk)
		const supabase = createClient();
		const { data, error } = await supabase.auth.updateUser({
			password: newPassword,
		});
		callbacks?.onResponse?.({ response: { data, error } });
		if (error) {
			callbacks?.onError?.({ error });
		} else {
			callbacks?.onSuccess?.({ data });
		}
		return { data, error };
	},

	listAccounts: async () => {
		const supabase = createClient();
		const { data: { user }, error } = await supabase.auth.getUser();

		if (error || !user) {
			return { data: [], error };
		}

		// Map Supabase identities to Better Auth account format
		const accounts = user.identities?.map((identity) => ({
			provider: identity.provider === 'email' ? 'credential' : identity.provider,
			providerId: identity.id,
			userId: user.id,
		})) || [];

		return { data: accounts, error: null };
	},

	admin: {
		banUser: async ({ userId, banReason, banExpiresIn }: { userId: string; banReason: string; banExpiresIn?: number }) => {
			// TODO: Implement user banning via server action
			// This should update user_metadata with banned flag and reason
			const error = {
				message: 'User banning is not yet implemented for Supabase',
				status: 501,
				statusText: 'NOT_IMPLEMENTED',
			};
			return { data: null, error };
		},

		unbanUser: async ({ userId }: { userId: string }) => {
			// TODO: Implement user unbanning via server action
			// This should remove banned flag from user_metadata
			const error = {
				message: 'User unbanning is not yet implemented for Supabase',
				status: 501,
				statusText: 'NOT_IMPLEMENTED',
			};
			return { data: null, error };
		},
	},

	deleteUser: async (
		{}: {},
		callbacks?: {
			onRequest?: (ctx: any) => void;
			onResponse?: (ctx: any) => void;
			onSuccess?: (ctx: any) => void;
			onError?: (ctx: any) => void;
		}
	) => {
		callbacks?.onRequest?.({});
		// TODO: Implement user deletion via Admin API
		// Supabase requires Admin API to delete users
		// This should be implemented as a server action or API route
		const error = {
			message: 'User deletion is not yet implemented for Supabase',
			status: 501,
			statusText: 'NOT_IMPLEMENTED',
		};
		callbacks?.onResponse?.({ response: { data: null, error } });
		callbacks?.onError?.({ error });
		return { data: null, error };
	},

	useSession: () => {
		const [session, setSession] = useState<Session | null>(null);
		const [isPending, setIsPending] = useState(true);
		const [refetchTrigger, setRefetchTrigger] = useState(0);

		useEffect(() => {
			const supabase = createClient();

			// Get initial session
			supabase.auth.getSession().then(({ data: { session } }) => {
				setSession(session);
				setIsPending(false);
			});

			// Listen for auth changes
			const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
				setSession(session);
				setIsPending(false);
			});

			return () => subscription.unsubscribe();
		}, [refetchTrigger]);

		const refetch = () => {
			setRefetchTrigger(prev => prev + 1);
		};

		return {
			data: session,
			isPending,
			refetch,
		};
	},
};
