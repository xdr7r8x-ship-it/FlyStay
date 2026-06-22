'use client';

import { useState } from 'react';
import { Package, Filter, Search, Plane, Building2, Check, Clock, X, Calendar } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/ErrorEmpty';

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'cancelled';

const orders = [
  {
    id: 'ORD-001',
    type: 'flight',
    title: 'الرياض - دبي',
    status: 'pending',
    date: '2026-07-15',
    price: '1,250',
    createdAt: '2026-06-20',
  },
  {
    id: 'ORD-002',
    type: 'hotel',
    title: 'فندق أتلانتس',
    status: 'confirmed',
    date: '2026-08-01',
    price: '2,400',
    createdAt: '2026-06-18',
  },
  {
    id: 'ORD-003',
    type: 'flight',
    title: 'جدة - إسطنبول',
    status: 'cancelled',
    date: '2026-09-10',
    price: '1,800',
    createdAt: '2026-06-15',
  },
];

export default function ManageOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">إدارة الطلبات</h1>
          <p className="font-cairo text-champagne">عرض وتتبع جميع الطلبات</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الطلب..."
            className="w-full pr-12 pl-4 py-3 bg-sand border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'pending', label: 'قيد المراجعة' },
            { key: 'confirmed', label: 'مؤكدة' },
            { key: 'cancelled', label: 'ملغاة' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as OrderStatus)}
              className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap transition-all ${
                statusFilter === tab.key
                  ? 'bg-charcoal text-white'
                  : 'bg-sand text-charcoal border border-mist hover:border-champagne'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="package"
            title="لا توجد طلبات"
            description={searchQuery ? "لم يتم العثور على طلبات مطابقة للبحث" : "لم يتم العثور على طلبات بهذا الحالة"}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-sand border border-mist rounded-2xl p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      order.type === 'flight' ? 'bg-champagne/20' : 'bg-purple-500/20'
                    }`}>
                      {order.type === 'flight' ? (
                        <Plane className="w-6 h-6 text-champagne" />
                      ) : (
                        <Building2 className="w-6 h-6 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-cairo font-semibold text-charcoal">{order.title}</p>
                      <p className="font-cairo text-sm text-muted">{order.id}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-cairo font-medium ${
                    order.status === 'pending'
                      ? 'bg-warning/10 text-warning'
                      : order.status === 'confirmed'
                      ? 'bg-success/10 text-success'
                      : 'bg-error/10 text-error'
                  }`}>
                    {order.status === 'pending' && <Clock className="w-3 h-3 inline ml-1" />}
                    {order.status === 'confirmed' && <Check className="w-3 h-3 inline ml-1" />}
                    {order.status === 'cancelled' && <X className="w-3 h-3 inline ml-1" />}
                    {order.status === 'pending' ? 'قيد المراجعة' : order.status === 'confirmed' ? 'مؤكدة' : 'ملغاة'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-mist">
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-cairo">{order.date}</span>
                    </div>
                  </div>
                  <p className="font-cairo font-bold text-charcoal text-lg">
                    {order.price} <span className="text-sm font-normal">ر.س</span>
                  </p>
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
