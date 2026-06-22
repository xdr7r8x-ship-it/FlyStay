'use client';

import { Bell, Calendar, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/ErrorEmpty';
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        if (response.status === 503) {
          setError('SERVICE_NOT_CONFIGURED');
          return;
        }
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch {
      setError('فشل في تحميل الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-cairo text-3xl font-bold mb-2">الإشعارات</h1>
            <p className="font-cairo text-champagne">
              {unreadCount > 0 ? `${unreadCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="px-4 py-2 bg-champagne text-charcoal rounded-lg font-cairo text-sm font-medium">
              قراءة الكل
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-champagne animate-spin" />
          </div>
        ) : error === 'SERVICE_NOT_CONFIGURED' ? (
          <EmptyState
            icon="bell"
            title="الخدمة غير مفعلة حاليًا"
            description="قاعدة البيانات غير مربوطة. سجّل الدخول للوصول للإشعارات."
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="bell"
            title="لا توجد إشعارات"
            description="ستظهر هنا الإشعارات المتعلقة بحجوزاتك وعروضنا."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-sand border rounded-2xl p-4 transition-all hover:shadow-md ${
                  notification.isRead ? 'border-mist' : 'border-champagne/30'
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'booking'
                        ? 'bg-success/10 text-success'
                        : notification.type === 'offer'
                        ? 'bg-champagne/20 text-champagne'
                        : 'bg-info/10 text-info'
                    }`}
                  >
                    {notification.type === 'booking' ? (
                      <Calendar className="w-6 h-6" />
                    ) : notification.type === 'offer' ? (
                      <MessageSquare className="w-6 h-6" />
                    ) : (
                      <AlertCircle className="w-6 h-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-cairo font-semibold text-charcoal">
                          {notification.title}
                        </h3>
                        <p className="font-cairo text-sm text-secondary mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="w-2.5 h-2.5 bg-champagne rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="font-cairo text-xs text-muted mt-2">
                      {new Date(notification.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
