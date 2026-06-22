'use client';

import { useState, useEffect } from 'react';
import { Package, Filter, Search, Plane, Building2, Check, Clock, X, Calendar, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/ErrorEmpty';

type OrderStatus = 'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

interface Order {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  date: string;
  totalAmount: number;
  currency: string;
}

export default function ManageOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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
      setOrders(data.orders || []);
    } catch {
      setError('فشل في تحميل الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.serviceType?.toLowerCase().includes(searchQuery.toLowerCase());
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-champagne animate-spin" />
          </div>
        ) : error === 'SERVICE_NOT_CONFIGURED' ? (
          <EmptyState
            icon="package"
            title="الخدمة غير مفعلة حاليًا"
            description="قاعدة البيانات غير مربوطة. تواصل مع المسؤول."
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon="package"
            title="لا توجد طلبات"
            description={searchQuery ? "لم يتم العثور على طلبات مطابقة للبحث" : "لم يتم العثور على طلبات بعد"}
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
                      order.serviceType === 'FLIGHT' ? 'bg-champagne/20' : 'bg-purple-500/20'
                    }`}>
                      {order.serviceType === 'FLIGHT' ? (
                        <Plane className="w-6 h-6 text-champagne" />
                      ) : (
                        <Building2 className="w-6 h-6 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-cairo font-semibold text-charcoal">{order.serviceType}</p>
                      <p className="font-cairo text-sm text-muted">{order.orderNumber}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-cairo font-medium ${
                    order.status === 'PENDING'
                      ? 'bg-warning/10 text-warning'
                      : order.status === 'CONFIRMED'
                      ? 'bg-success/10 text-success'
                      : 'bg-error/10 text-error'
                  }`}>
                    {order.status === 'PENDING' && <Clock className="w-3 h-3 inline ml-1" />}
                    {order.status === 'CONFIRMED' && <Check className="w-3 h-3 inline ml-1" />}
                    {order.status === 'CANCELLED' && <X className="w-3 h-3 inline ml-1" />}
                    {order.status === 'PENDING' ? 'قيد المراجعة' : order.status === 'CONFIRMED' ? 'مؤكدة' : 'ملغاة'}
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
                    {order.totalAmount.toLocaleString()} <span className="text-sm font-normal">{order.currency}</span>
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
