import type { PropsWithChildren } from 'react';

/**
 * Protected layout for authenticated pages (settings, payment, etc.)
 */
export default function ProtectedLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
