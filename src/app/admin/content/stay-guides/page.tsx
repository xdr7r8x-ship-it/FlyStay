'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ToggleLeft, ToggleRight, Filter, Building2 } from 'lucide-react';
import Header from '@/components/layout/Header';

interface StayGuide {
  id: string;
  titleAr: string;
  cityAr: string;
  type: string;
  budgetLevel: string;
  status: string;
}

const TYPE_LABELS: Record<string, string> = {
  HOTEL: 'فندق',
  CHALET: 'شاليه',
  RESTHOUSE: 'استراحة',
};

const BUDGET_LABELS: Record<string, string> = {
  ECONOMY: 'اقتصادية',
  MID: 'متوسطة',
  LUXURY: 'فاخرة',
  MIXED: 'مختلطة',
};

export default function StayGuidesPage() {
  const [guides, setGuides] = useState<StayGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('q', filter);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      
      const response = await fetch(`/api/admin/content/stay-guides?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setGuides(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load stay guides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  const toggleStatus = async (guide: StayGuide) => {
    const newStatus = guide.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const response = await fetch(`/api/admin/content/stay-guides/${guide.id}`, {
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
          <h1 className="font-cairo text-3xl font-bold">إدارة أدلة الإقامة</h1>
          <p className="font-cairo text-white/70 mt-1">عرض وتعديل أدلة الإقامة</p>
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
                placeholder="بحث بالعنوان أو المدينة..."
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
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
            >
              <option value="">كل الأنواع</option>
              <option value="HOTEL">فندق</option>
              <option value="CHALET">شاليه</option>
              <option value="RESTHOUSE">استراحة</option>
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
          <div className="grid grid-cols-[1fr_100px_100px_120px] border-b border-mist bg-sand px-4 py-3 font-cairo text-sm font-bold text-charcoal">
            <span>العنوان</span>
            <span>المدينة</span>
            <span>النوع</span>
            <span>إجراءات</span>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-champagne border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-cairo text-secondary">جاري التحميل...</p>
            </div>
          ) : guides.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="font-cairo text-secondary">لا توجد أدلة إقامة</p>
            </div>
          ) : (
            guides.map((guide) => (
              <div key={guide.id} className="grid grid-cols-[1fr_100px_100px_120px] items-center border-b border-mist px-4 py-3 last:border-b-0 hover:bg-sand/30">
                <div>
                  <p className="font-cairo font-bold text-charcoal">{guide.titleAr}</p>
                  <p className="font-cairo text-xs text-secondary">{guide.cityAr}</p>
                </div>
                <span className="font-cairo text-sm text-secondary">{guide.cityAr || '-'}</span>
                <span className="font-cairo text-sm text-secondary">{TYPE_LABELS[guide.type] || guide.type}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(guide)}
                    className={`p-2 rounded-lg ${
                      guide.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'
                    }`}
                    title={guide.status === 'ACTIVE' ? 'تعطيل' : 'تفعيل'}
                  >
                    {guide.status === 'ACTIVE' ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
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
