'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, MessageSquare, ChevronLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { LoadingSpinner } from '@/components/ui/Loading';

interface Order {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  details: {
    name: string;
    phone: string;
    email: string;
    date?: string;
    travelers?: number;
    notes?: string;
    destination?: string;
  };
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  NEW: 'جديد',
  REVIEWING: 'قيد المراجعة',
  WAITING_USER: 'في انتظار ردك',
  OFFER_SENT: 'تم إرسال العرض',
  CONFIRMED_MANUALLY: 'تم التأكيد',
  CANCELLED: 'ملغي',
  CLOSED: 'مغلق',
};

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-yellow-100 text-yellow-700',
  WAITING_USER: 'bg-orange-100 text-orange-700',
  OFFER_SENT: 'bg-purple-100 text-purple-700',
  CONFIRMED_MANUALLY: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-gray-100 text-gray-700',
};

const serviceTypeLabels: Record<string, string> = {
  FLIGHT: 'طيران',
  HOTEL: 'فندق',
  CHALET: 'شالية',
  PACKAGE: 'باقة سياحية',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
      } else if (response.status === 401) {
        // User not logged in - show empty state
        setOrders([]);
      } else if (response.status === 503) {
        // Database not configured
        setError('SERVICE_NOT_CONFIGURED');
      } else {
        setError(data.error || 'حدث خطأ');
      }
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="font-cairo text-charcoal mt-4">جاري تحميل الطلبات...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">طلباتي</h1>
          <p className="font-cairo text-champagne">تابع حالة طلباتك</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error === 'SERVICE_NOT_CONFIGURED' ? (
          <div className="bg-sand border border-mist rounded-2xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-charcoal/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-charcoal" />
            </div>
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">الخدمة غير مفعلة حاليًا</h2>
            <p className="font-cairo text-secondary mb-6">قاعدة البيانات غير مربوطة. تواصل مع المسؤول.</p>
            <Link href="/search" className="inline-block px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-medium">
              استكشف خدماتنا
            </Link>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-200 rounded-xl text-red-700 font-cairo mb-6">
            {error}
          </div>
        ) : null}

        {orders.length === 0 && error !== 'SERVICE_NOT_CONFIGURED' ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-sand rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-champagne" />
            </div>
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">لا توجد طلبات</h2>
            <p className="font-cairo text-secondary mb-6">لم تقم بأي طلبات بعد</p>
            <Link href="/booking" className="inline-block px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-medium">
              إرسال طلب جديد
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-sand border border-mist rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-cairo text-sm text-secondary">رقم الطلب</p>
                    <p className="font-cairo font-bold text-charcoal">{order.orderNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-cairo text-sm ${statusColors[order.status] || 'bg-gray-100'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-champagne" />
                    <span className="font-cairo text-sm">{serviceTypeLabels[order.serviceType] || order.serviceType}</span>
                  </div>
                  {order.details.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-champagne" />
                      <span className="font-cairo text-sm">{order.details.date}</span>
                    </div>
                  )}
                  {order.details.travelers && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-champagne" />
                      <span className="font-cairo text-sm">{order.details.travelers} مسافر</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-mist">
                  <div className="flex items-center gap-1 text-muted">
                    <Clock className="w-4 h-4" />
                    <span className="font-cairo text-xs">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <Link href={`/orders/${order.id}`} className="flex items-center gap-1 text-champagne font-cairo text-sm">
                    التفاصيل
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
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
