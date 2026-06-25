'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

interface AdminLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

type AuthState = 'loading' | 'authorized' | 'unauthorized';

export default function AdminLayout({ children, requireAuth = true }: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    if (!requireAuth) {
      setAuthState('authorized');
      return;
    }

    checkAuth();
  }, [requireAuth]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN')) {
          setAuthState('authorized');
        } else {
          setAuthState('unauthorized');
        }
      } else {
        setAuthState('unauthorized');
      }
    } catch {
      setAuthState('unauthorized');
    }
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-champagne border-t-transparent rounded-full animate-spin" />
          <p className="font-cairo text-secondary">جارٍ التحقق...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-mist max-w-md">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="font-cairo text-2xl font-bold text-charcoal mb-3">غير مصرح</h2>
          <p className="font-cairo text-secondary mb-6">
            لا تملك صلاحية الوصول إلى لوحة التحكم
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-semibold hover:opacity-90 transition-opacity"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Mobile sidebar overlay */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:mr-72">
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
