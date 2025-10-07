import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

/**
 * Get the current session
 */
export const getSession = cache(async () => {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session;
});

/**
 * Get the current user
 */
export const getUser = cache(async () => {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
});
