import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { ToastProvider } from './_components/Toast';
import { AdminShell } from './_components/AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <ToastProvider>
      <AdminShell session={session}>{children}</AdminShell>
    </ToastProvider>
  );
}
