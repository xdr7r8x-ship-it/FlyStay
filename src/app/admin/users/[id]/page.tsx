'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, ArrowLeft, Users, Lock, CheckCircle, AlertCircle, FileText, MessageSquare, Bell, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    travelRequests: number;
    bookings: number;
    notifications: number;
  };
}

interface RecentRequest {
  id: string;
  status: string;
  cityAr: string | null;
  serviceType: string;
  createdAt: string;
  updatedAt: string;
  destination: {
    cityAr: string | null;
  } | null;
  _count: {
    options: number;
  };
}

interface RecentMessage {
  id: string;
  bodyAr: string;
  senderRole: string;
  createdAt: string;
  requestId: string;
}

interface RecentNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDetails() {
      setAuthState('loading');
      setError(null);

      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setAuthState('unauthorized');
            return;
          }
          if (response.status === 404) {
            setAuthState('error');
            setError('المستخدم غير موجود');
            return;
          }
          throw new Error('فشل في جلب البيانات');
        }

        const data = await response.json();
        setUser(data.user);
        setRecentRequests(data.recentRequests || []);
        setRecentMessages(data.recentMessages || []);
        setRecentNotifications(data.recentNotifications || []);
        setAuthState('authorized');
      } catch (err) {
        setAuthState('error');
        setError(err instanceof Error ? err.message : 'فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      USER: 'bg-blue-100 text-blue-700',
      GUEST: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-cairo ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
        {role === 'ADMIN' ? 'مدير' : role === 'USER' ? 'مستخدم' : role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      NEW: { bg: 'bg-blue-100', text: 'text-blue-700' },
      REVIEWING: { bg: 'bg-orange-100', text: 'text-orange-700' },
      OPTIONS_SENT: { bg: 'bg-purple-100', text: 'text-purple-700' },
      USER_APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
      BOOKING_PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const style = styles[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-cairo ${style.bg} ${style.text}`}>
        {status}
      </span>
    );
  };

  const getMessageRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      USER: 'bg-blue-100 text-blue-700',
      ADMIN: 'bg-purple-100 text-purple-700',
      SYSTEM: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-cairo ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
        {role === 'USER' ? 'مستخدم' : role === 'ADMIN' ? 'أدمن' : 'نظام'}
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
            <div className="h-32 bg-sand rounded-xl" />
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
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">خطأ في تحميل البيانات</h2>
            <p className="font-cairo text-secondary mb-4">{error}</p>
            <Link href="/admin/users" className="inline-flex items-center gap-2 px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo">
              العودة لقائمة الأعضاء
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />
      
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/users" className="text-champagne hover:text-champagne/80">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">إدارة الأعضاء</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">{user.name}</h1>
          <p className="font-cairo text-white/70 mt-1">{user.email}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="p-4 border-b border-mist flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-champagne/20 rounded-full flex items-center justify-center">
                <span className="font-cairo font-bold text-champagne text-xl">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="font-cairo font-bold text-charcoal">{user.name}</h2>
                <p className="font-cairo text-sm text-secondary">{user.email}</p>
              </div>
            </div>
            {getRoleBadge(user.role)}
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-sand/50 rounded-xl p-3 text-center">
              <p className="font-cairo text-2xl font-bold text-charcoal">{user._count.travelRequests}</p>
              <p className="font-cairo text-xs text-secondary">طلبات سفر</p>
            </div>
            <div className="bg-sand/50 rounded-xl p-3 text-center">
              <p className="font-cairo text-2xl font-bold text-charcoal">{user._count.orders}</p>
              <p className="font-cairo text-xs text-secondary">طلبات</p>
            </div>
            <div className="bg-sand/50 rounded-xl p-3 text-center">
              <p className="font-cairo text-2xl font-bold text-charcoal">{user._count.bookings}</p>
              <p className="font-cairo text-xs text-secondary">حجوزات</p>
            </div>
            <div className="bg-sand/50 rounded-xl p-3 text-center">
              <p className="font-cairo text-2xl font-bold text-charcoal">{user._count.notifications}</p>
              <p className="font-cairo text-xs text-secondary">إشعارات</p>
            </div>
          </div>
          <div className="p-4 border-t border-mist">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="font-cairo text-secondary">تاريخ التسجيل: {formatDate(user.createdAt)}</span>
            </div>
            {user.phone && (
              <p className="font-cairo text-sm text-secondary mt-2">{user.phone}</p>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="p-4 border-b border-mist flex items-center gap-3">
            <FileText className="w-5 h-5 text-charcoal" />
            <h2 className="font-cairo font-bold text-charcoal">آخر طلبات السفر</h2>
            <span className="px-2 py-1 bg-sand rounded-full text-xs font-cairo text-secondary">
              {recentRequests.length}
            </span>
          </div>
          {recentRequests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-cairo text-secondary">لا توجد طلبات سفر</p>
            </div>
          ) : (
            <div className="divide-y divide-mist">
              {recentRequests.map((req) => (
                <div key={req.id} className="p-4 hover:bg-sand/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-cairo font-semibold text-charcoal">
                        {req.destination?.cityAr || req.cityAr || req.serviceType}
                      </p>
                      <p className="font-cairo text-xs text-secondary">{formatDate(req.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(req.status)}
                      <Link 
                        href={`/admin/requests/${req.id}`}
                        className="p-2 hover:bg-sand rounded-lg transition-colors"
                        title="عرض الطلب"
                      >
                        <ArrowRight className="w-4 h-4 text-charcoal/60" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="p-4 border-b border-mist flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-charcoal" />
            <h2 className="font-cairo font-bold text-charcoal">آخر الرسائل</h2>
            <span className="px-2 py-1 bg-sand rounded-full text-xs font-cairo text-secondary">
              {recentMessages.length}
            </span>
          </div>
          {recentMessages.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-cairo text-secondary">لا توجد رسائل</p>
            </div>
          ) : (
            <div className="divide-y divide-mist">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="p-4 hover:bg-sand/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getMessageRoleBadge(msg.senderRole)}
                        <span className="font-cairo text-xs text-secondary">{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="font-cairo text-sm text-charcoal/80 line-clamp-2">{msg.bodyAr}</p>
                    </div>
                    <Link 
                      href={`/admin/requests/${msg.requestId}`}
                      className="p-2 hover:bg-sand rounded-lg transition-colors"
                      title="عرض الطلب"
                    >
                      <ArrowRight className="w-4 h-4 text-charcoal/60" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="p-4 border-b border-mist flex items-center gap-3">
            <Bell className="w-5 h-5 text-charcoal" />
            <h2 className="font-cairo font-bold text-charcoal">آخر الإشعارات</h2>
            <span className="px-2 py-1 bg-sand rounded-full text-xs font-cairo text-secondary">
              {recentNotifications.length}
            </span>
          </div>
          {recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-cairo text-secondary">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-mist">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className={`p-4 ${!notif.read ? 'bg-champagne/5' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {!notif.read && <span className="w-2 h-2 bg-champagne rounded-full mt-2" />}
                      <div>
                        <p className="font-cairo font-semibold text-charcoal">{notif.title}</p>
                        <p className="font-cairo text-sm text-charcoal/80">{notif.message}</p>
                        <p className="font-cairo text-xs text-secondary mt-1">{formatDate(notif.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-champagne/10 rounded-2xl border border-champagne/30">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo text-sm text-charcoal">
                <strong>ملاحظة:</strong> هذه الصفحة تعرض بيانات المستخدم الفعلية من قاعدة البيانات.
                لا تتضمن هذه الصفحة أي عمليات تعديل أو حذف.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
