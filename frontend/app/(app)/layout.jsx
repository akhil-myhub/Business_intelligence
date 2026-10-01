import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/Shell';
import { getServerUser } from '@/server/currentUser';

// Everything inside (app) requires a session and shares one shell (rail, top bar, live feed, search).
export default async function AppLayout({ children }) {
  const user = await getServerUser();
  if (!user) redirect('/login');
  return (
    <Suspense fallback={null}>
      <AppShell user={user}>{children}</AppShell>
    </Suspense>
  );
}
