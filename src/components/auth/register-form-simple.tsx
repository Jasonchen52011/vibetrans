'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthCard } from '@/components/auth/auth-card';
import { Routes } from '@/routes';

export function RegisterForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError('');

		const { error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { name },
			},
		});

		if (signUpError) {
			setError(signUpError.message);
			setLoading(false);
			return;
		}

		// Success - show verification message
		alert('Please check your email to verify your account!');
		router.push(Routes.Login);
	}

	return (
		<AuthCard
			headerLabel="Create Account"
			bottomButtonLabel="Already have an account?"
			bottomButtonHref={Routes.Login}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					type="text"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
				<Input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<Input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={6}
				/>
				{error && <p className="text-sm text-red-500">{error}</p>}
				<Button type="submit" disabled={loading} className="w-full">
					{loading ? 'Creating account...' : 'Sign Up'}
				</Button>
			</form>
		</AuthCard>
	);
}
