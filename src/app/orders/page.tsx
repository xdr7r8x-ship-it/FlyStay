'use client';

import { Calendar, MapPin, Users, Clock, Inbox } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/ErrorEmpty';
import Link from 'next/link';

const mockOrders = [
  {
    id: 'ORD-001',
    type: 'flight',
    status: 'pending',
    statusText: 'قيد المراجعة',
    destination: 'دبي - الإمارات',
    date: '2026-07-15',
    travelers: 2,
    createdAt: 'منذ ساعة',
  },
  {
    id: 'ORD-002',
    type: 'hotel',
    status: 'confirmed',
    statusText: 'تم التأكيد',
    destination: 'جدة - السعودية',
    date: '2026-08-01',
    travelers: 1,
    createdAt: 'منذ يوم',
  },
];

export default function OrdersPage() {
  const orders = mockOrders;

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">طلباتي</h1>
          <p className="font-cairo text-champagne">تتبع حالة طلباتك</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <EmptyState
            icon="orders"
            title="لا توجد طلبات"
            description="لم تقم بأي طلب حجز بعد. ابدأ بالبحث عن رحلتك المثالية."
            action={{
              label: 'ابحث عن رحلة',
              onClick: () => window.location.href = '/search',
            }}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-sand border border-mist rounded-2xl p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-cairo text-xs text-muted">رقم الطلب</span>
                    <p className="font-cairo font-semibold text-charcoal">{order.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-cairo font-medium ${
                      order.status === 'pending'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-success/10 text-success'
                    }`}
                  >
                    {order.statusText}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-champagne" />
                    <span className="font-cairo text-charcoal">{order.destination}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-champagne" />
                    <span className="font-cairo text-charcoal">{order.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-champagne" />
                    <span className="font-cairo text-charcoal">
                      {order.travelers} مسافر{order.travelers > 1 ? 'ين' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-champagne" />
                    <span className="font-cairo text-muted text-sm">{order.createdAt}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-mist flex gap-3">
                  <button className="flex-1 py-2 bg-charcoal text-white rounded-xl font-cairo font-medium text-sm hover:opacity-90 transition-opacity">
                    عرض التفاصيل
                  </button>
                  <button className="flex-1 py-2 border border-charcoal text-charcoal rounded-xl font-cairo font-medium text-sm hover:bg-charcoal hover:text-white transition-colors">
                    تواصل معنا
                  </button>
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
