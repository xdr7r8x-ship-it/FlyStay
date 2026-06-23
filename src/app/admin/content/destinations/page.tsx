'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, ToggleLeft, ToggleRight, RefreshCw, MapPin, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';

interface Destination {
  id: string;
  slug: string;
  cityAr: string;
  countryAr: string;
  continentAr: string;
  budgetLevel: string;
  status: string;
  shortSummaryAr?: string;
  travelStyles: unknown[];
}

const BUDGET_LABELS: Record<string, string> = {
  ECONOMY: 'اقتصادية',
  MID: 'متوسطة',
  LUXURY: 'فاخرة',
  MIXED: 'مختلطة',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  DRAFT: 'مسودة',
  INACTIVE: 'غير نشط',
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('q', filter);
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/admin/content/destinations?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDestinations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const toggleStatus = async (dest: Destination) => {
    const newStatus = dest.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const response = await fetch(`/api/admin/content/destinations/${dest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />
      
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin" className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">لوحة التحكم</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">إدارة الوجهات</h1>
          <p className="font-cairo text-white/70 mt-1">عرض وتعديل الوجهات</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-mist mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="بحث بالمدينة أو الدولة..."
                className="w-full px-4 py-3 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
            >
              <option value="">كل الحالات</option>
              <option value="ACTIVE">ACTIVE - نشط</option>
              <option value="DRAFT">DRAFT - مسودة</option>
              <option value="INACTIVE">INACTIVE - غير نشط</option>
            </select>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo text-sm"
            >
              <Filter className="w-4 h-4" />
              تطبيق
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_100px_120px_120px] border-b border-mist bg-sand px-4 py-3 font-cairo text-sm font-bold text-charcoal">
            <span>الوجهة</span>
            <span>القارة</span>
            <span>الميزانية</span>
            <span>الحالة</span>
            <span>إجراءات</span>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-champagne border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-cairo text-secondary">جاري التحميل...</p>
            </div>
          ) : destinations.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="font-cairo text-secondary">لا توجد وجهات</p>
            </div>
          ) : (
            destinations.map((dest) => (
              <div key={dest.id} className="grid grid-cols-[1fr_100px_100px_120px_120px] items-center border-b border-mist px-4 py-3 last:border-b-0 hover:bg-sand/30">
                <div>
                  <p className="font-cairo font-bold text-charcoal">{dest.cityAr}</p>
                  <p className="font-cairo text-xs text-secondary">{dest.countryAr}</p>
                </div>
                <span className="font-cairo text-sm text-secondary">{dest.continentAr}</span>
                <span className="font-cairo text-sm text-secondary">{BUDGET_LABELS[dest.budgetLevel] || dest.budgetLevel}</span>
                <span className={`font-cairo text-xs px-2 py-1 rounded-full text-center ${
                  dest.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  dest.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {STATUS_LABELS[dest.status] || dest.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(dest)}
                    className={`p-2 rounded-lg ${
                      dest.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'
                    }`}
                    title={dest.status === 'ACTIVE' ? 'تعطيل' : 'تفعيل'}
                  >
                    {dest.status === 'ACTIVE' ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/admin" className="font-cairo text-sm text-champagne hover:underline">
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    </main>
  );
}
