'use client';

import { useSession } from './use-session';

export function useCurrentUser() {
	const { user, loading } = useSession();
	return { user, loading };
}
