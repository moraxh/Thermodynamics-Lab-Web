import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Toaster } from '@/components/ui/sonner';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminUserMenu from '@/components/admin/AdminUserMenu';
import PageTransition from '@/components/common/PageTransition';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-lab-black">
      <div className="border-b border-lab-white/10 bg-lab-gray-100/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-lab-white">Panel Administrativo</h1>
              <p className="text-sm text-lab-gray-400">Sistema de Gestión de Contenido</p>
            </div>
            <AdminUserMenu />
          </div>
        </div>
      </div>
      
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
      <Toaster />
    </div>
  );
}
