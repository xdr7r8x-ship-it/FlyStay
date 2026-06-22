'use client';

import { Plane, Building2, Package, TrendingUp, Calendar, Users, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

const stats = [
  { label: 'إجمالي الحجوزات', value: '24', icon: Package, color: 'text-champagne' },
  { label: 'رحلات الطيران', value: '12', icon: Plane, color: 'text-blue-500' },
  { label: 'فنادق محجوزة', value: '8', icon: Building2, color: 'text-purple-500' },
  { label: 'هذا الشهر', value: '3', icon: TrendingUp, color: 'text-success' },
];

const recentOrders = [
  { id: 'ORD-001', type: 'flight', destination: 'دبي', status: 'pending', date: '2026-07-15' },
  { id: 'ORD-002', type: 'hotel', destination: 'جدة', status: 'confirmed', date: '2026-08-01' },
];

export default function DashboardPage() {
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

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-sand border border-mist rounded-2xl p-4">
                <Icon className={`w-8 h-8 mb-3 ${stat.color}`} />
                <p className="font-cairo text-2xl font-bold text-charcoal">{stat.value}</p>
                <p className="font-cairo text-sm text-secondary">{stat.label}</p>
              </div>
            );
          })}
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
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="bg-sand border border-mist rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-champagne/20 rounded-lg flex items-center justify-center">
                  {order.type === 'flight' ? (
                    <Plane className="w-5 h-5 text-champagne" />
                  ) : (
                    <Building2 className="w-5 h-5 text-champagne" />
                  )}
                </div>
                <div>
                  <p className="font-cairo font-medium text-charcoal">{order.id}</p>
                  <p className="font-cairo text-sm text-secondary">{order.destination}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-cairo ${
                order.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
              }`}>
                {order.status === 'pending' ? 'قيد المراجعة' : 'تم التأكيد'}
              </span>
            </div>
          ))}
        </div>
      </div>

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
