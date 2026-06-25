'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Bell, CheckCircle, AlertCircle, Lock, Search, Check, X } from 'lucide-react';
import Header from '@/components/layout/Header';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  userName?: string;
}

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    async function fetchNotifications() {
      setAuthState('loading');
      setError(null);

      try {
        const response = await fetch('/api/notifications', {
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
        setNotifications(data.notifications || data.data || []);
        setAuthState('authorized');
      } catch (err) {
        setAuthState('error');
        setError(err instanceof Error ? err.message : 'فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      REQUEST: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'طلب' },
      OPTION: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'خيار' },
      MESSAGE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'رسالة' },
      SYSTEM: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'نظام' },
    };
    const style = styles[type] || styles.SYSTEM;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-cairo ${style.bg} ${style.text}`}>
        {style.label}
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
          <h1 className="font-cairo text-3xl font-bold">الإشعارات</h1>
          <p className="font-cairo text-white/70 mt-1">عرض إشعارات النظام والمستخدمين</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="p-4 border-b border-mist flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-charcoal" />
              <h2 className="font-cairo font-bold text-charcoal">الإشعارات</h2>
              <span className="px-2 py-1 bg-sand rounded-full text-xs font-cairo text-secondary">
                {filteredNotifications.length} إشعار
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'unread', 'read'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg font-cairo text-xs transition-colors ${
                    filter === f 
                      ? 'bg-champagne text-charcoal' 
                      : 'bg-sand text-charcoal/60 hover:bg-sand/80'
                  }`}
                >
                  {f === 'all' ? 'الكل' : f === 'unread' ? 'غير مقروء' : 'مقروء'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-sand rounded" />)}
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-charcoal/50" />
              </div>
              <p className="font-cairo text-secondary">
                {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-mist">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 transition-colors ${!notification.isRead ? 'bg-champagne/5' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.isRead ? 'bg-champagne/20' : 'bg-sand'
                      }`}>
                        <Bell className={`w-5 h-5 ${!notification.isRead ? 'text-champagne' : 'text-charcoal/40'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-cairo font-semibold text-charcoal">{notification.title}</p>
                          {getTypeBadge(notification.type)}
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-champagne rounded-full" />
                          )}
                        </div>
                        <p className="font-cairo text-sm text-charcoal/80">{notification.message}</p>
                        <p className="font-cairo text-xs text-secondary mt-2">{formatDate(notification.createdAt)}</p>
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
                <strong>ملاحظة:</strong> هذا القسم يعرض إشعارات النظام والمستخدمين.
                لا تعني هذه الإشعارات أي تأكيد لحجز أو دفع أو توفر خدمة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
