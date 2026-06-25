'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Users, Search, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count?: {
    orders: number;
    travelRequests: number;
  };
}

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setAuthState('loading');
      setError(null);

      try {
        const response = await fetch('/api/admin/users', {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setAuthState('unauthorized');
            return;
          }
          throw new Error('فشل في جلب البيانات');
        }

        const data = await response.json();
        setUsers(data.users || data.data || []);
        setAuthState('authorized');
      } catch (err) {
        setAuthState('error');
        setError(err instanceof Error ? err.message : 'فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.includes(search))
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      USER: 'bg-blue-100 text-blue-700',
      GUEST: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-cairo ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
        {role === 'ADMIN' ? 'مدير' : role === 'USER' ? 'مستخدم' : role}
      </span>
    );
  };

  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-sand rounded w-1/4" />
            <div className="h-12 bg-sand rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-sand rounded-xl" />)}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (authState === 'unauthorized') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">غير مصرح لك بالدخول</h2>
            <p className="font-cairo text-secondary mb-6">هذه الصفحة مخصصة للمسؤول فقط.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (authState === 'error') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">خطأ في الخادم</h2>
            <p className="font-cairo text-secondary mb-4">{error}</p>
            <p className="font-cairo text-sm text-charcoal/60">قد لا يكون جدول المستخدمين متوفرًا في قاعدة البيانات.</p>
            <Link href="/admin" className="inline-flex items-center gap-2 px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo mt-4">
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />
      
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin" className="text-champagne hover:text-champagne/80">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">لوحة التحكم</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">إدارة الأعضاء</h1>
          <p className="font-cairo text-white/70 mt-1">عرض وإدارة حسابات المستخدمين</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="p-4 border-b border-mist flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-charcoal" />
              <h2 className="font-cairo font-bold text-charcoal">قائمة الأعضاء</h2>
              <span className="px-2 py-1 bg-sand rounded-full text-xs font-cairo text-secondary">
                {filteredUsers.length} عضو
              </span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو البريد..."
                className="pr-10 pl-4 py-2 border border-mist rounded-lg font-cairo text-sm w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-sand rounded" />)}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-charcoal/50" />
              </div>
              <p className="font-cairo text-secondary">
                {search ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد أعضاء مسجلين'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-mist">
              {filteredUsers.map((user) => (
                <Link key={user.id} href={`/admin/users/${user.id}`} className="block p-4 hover:bg-sand/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center">
                        <span className="font-cairo font-bold text-champagne">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-cairo font-semibold text-charcoal">{user.name}</p>
                        <p className="font-cairo text-sm text-secondary">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getRoleBadge(user.role)}
                      <div className="text-left">
                        <p className="font-cairo text-xs text-secondary">
                          التسجيل: {formatDate(user.createdAt)}
                        </p>
                        {user._count && (
                          <p className="font-cairo text-xs text-secondary">
                            {user._count.travelRequests || 0} طلب • {user._count.orders || 0} حجز
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-secondary" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-champagne/10 rounded-2xl border border-champagne/30">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo text-sm text-charcoal">
                <strong>ملاحظة:</strong> إدارة الأعضاء تعرض البيانات الحقيقية من قاعدة البيانات.
                لا تتضمن هذه الصفحة أي عمليات حذف أو تعديل للصلاحيات.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
