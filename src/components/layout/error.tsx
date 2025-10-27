'use client';

import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * Simplified error component without translation dependencies
 */
export default function Error({ reset }: { reset: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="text-4xl">🌐</div>

      <h1 className="text-2xl text-center">Something went wrong</h1>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          variant="default"
          className="cursor-pointer"
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              router.refresh();
              reset();
            });
          }}
        >
          {isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
          Try again
        </Button>

        <Button
          type="submit"
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push('/')}
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}
