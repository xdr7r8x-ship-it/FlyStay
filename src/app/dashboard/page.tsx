'use client';

import { Plane, Building2, Package, Users, ArrowLeft, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Order {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, flights: 0, hotels: 0, thisMonth: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        if (response.status === 503) {
          setError('SERVICE_NOT_CONFIGURED');
          setOrders([]);
          return;
        }
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      const fetchedOrders = data.orders || [];
      setOrders(fetchedOrders);
      
      // Calculate real stats
      const now = new Date();
      const thisMonth = fetchedOrders.filter((o: Order) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }).length;
      
      setStats({
        total: fetchedOrders.length,
        flights: fetchedOrders.filter((o: Order) => o.serviceType === 'FLIGHT').length,
        hotels: fetchedOrders.filter((o: Order) => o.serviceType === 'HOTEL').length,
        thisMonth,
      });
    } catch {
      setError('فشل في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ivory pb-24">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-champagne animate-spin" />
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">لوحة التحكم</h1>
          <p className="font-cairo text-champagne">مرحباً بك في حسابك</p>
        </div>
      </div>

      {error === 'SERVICE_NOT_CONFIGURED' ? (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-sand rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-champagne" />
          </div>
          <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">الخدمة غير مفعلة حاليًا</h2>
          <p className="font-cairo text-secondary mb-6">قاعدة البيانات غير مربوطة. تواصل مع المسؤول.</p>
          <Link href="/search" className="inline-block px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-medium">
            استكشف خدماتنا
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-sand border border-mist rounded-2xl p-4">
                <Package className="w-8 h-8 mb-3 text-champagne" />
                <p className="font-cairo text-2xl font-bold text-charcoal">{stats.total}</p>
                <p className="font-cairo text-sm text-secondary">إجمالي الطلبات</p>
              </div>
              <div className="bg-sand border border-mist rounded-2xl p-4">
                <Plane className="w-8 h-8 mb-3 text-blue-500" />
                <p className="font-cairo text-2xl font-bold text-charcoal">{stats.flights}</p>
                <p className="font-cairo text-sm text-secondary">رحلات الطيران</p>
              </div>
              <div className="bg-sand border border-mist rounded-2xl p-4">
                <Building2 className="w-8 h-8 mb-3 text-purple-500" />
                <p className="font-cairo text-2xl font-bold text-charcoal">{stats.hotels}</p>
                <p className="font-cairo text-sm text-secondary">فنادق</p>
              </div>
              <div className="bg-sand border border-mist rounded-2xl p-4">
                <Plane className="w-8 h-8 mb-3 text-success" />
                <p className="font-cairo text-2xl font-bold text-charcoal">{stats.thisMonth}</p>
                <p className="font-cairo text-sm text-secondary">هذا الشهر</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cairo text-xl font-bold text-charcoal">الطلبات الأخيرة</h2>
              <Link href="/orders" className="font-cairo text-champagne text-sm flex items-center gap-1">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="bg-sand border border-mist rounded-xl p-6 text-center">
                <p className="font-cairo text-secondary">لا توجد طلبات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="bg-sand border border-mist rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-champagne/20 rounded-lg flex items-center justify-center">
                        {order.serviceType === 'FLIGHT' ? (
                          <Plane className="w-5 h-5 text-champagne" />
                        ) : (
                          <Building2 className="w-5 h-5 text-champagne" />
                        )}
                      </div>
                      <div>
                        <p className="font-cairo font-medium text-charcoal">{order.orderNumber}</p>
                        <p className="font-cairo text-sm text-secondary">{order.serviceType}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-cairo ${
                      order.status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {order.status === 'PENDING' ? 'قيد المراجعة' : 'تم التأكيد'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/search" className="bg-charcoal text-white rounded-2xl p-6 text-center hover:opacity-90 transition-opacity">
            <Plane className="w-8 h-8 mx-auto mb-2 text-champagne" />
            <p className="font-cairo font-semibold">ابحث عن رحلة</p>
          </Link>
          <Link href="/ai-agent" className="bg-sand border border-mist rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 mx-auto mb-2 text-champagne" />
            <p className="font-cairo font-semibold text-charcoal">الوكيل الذكي</p>
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
