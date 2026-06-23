'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Eye, RefreshCw, Search, ToggleLeft, ToggleRight, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';

type Tab = 'destinations' | 'templates' | 'stay-guides' | 'travel-requests';
type Row = Record<string, unknown> & { id: string; status?: string; titleAr?: string; cityAr?: string; slug?: string; referenceNumber?: string };
type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

const tabs: { key: Tab; label: string; endpoint: string }[] = [
  { key: 'destinations', label: 'الوجهات', endpoint: '/api/admin/content/destinations' },
  { key: 'templates', label: 'قوالب الرحلات', endpoint: '/api/admin/content/templates' },
  { key: 'stay-guides', label: 'أدلة الإقامة', endpoint: '/api/admin/content/stay-guides' },
  { key: 'travel-requests', label: 'طلبات السفر', endpoint: '/api/admin/travel-requests' },
];

function titleFor(row: Row) {
  return row.titleAr || row.cityAr || row.referenceNumber || row.slug || row.id;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('destinations');
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const active = tabs.find((tab) => tab.key === activeTab)!;

  const loadRows = useCallback(async () => {
    setLoading(true);
    setAuthState('loading');
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (status) params.set('status', status);
      
      const response = await fetch(`${active.endpoint}?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          setRows([]);
          return;
        }
        throw new Error('فشل في جلب البيانات');
      }
      
      const payload = await response.json();
      setRows(payload.data || []);
      setAuthState('authorized');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [active.endpoint, query, status]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const updateStatus = async (row: Row, nextStatus: string) => {
    if (authState !== 'authorized') return;
    if (activeTab === 'travel-requests') return;
    
    try {
      const response = await fetch(`${active.endpoint}/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          return;
        }
        throw new Error('فشل في التحديث');
      }
      
      await loadRows();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const updateTravelRequest = async (row: Row, nextStatus: string) => {
    if (authState !== 'authorized') return;
    
    try {
      const response = await fetch(`/api/admin/travel-requests/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          return;
        }
        throw new Error('فشل في التحديث');
      }
      
      await loadRows();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  // Loading state
  if (authState === 'loading' && loading) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-sand rounded w-1/3" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-sand rounded-xl" />)}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Unauthorized state
  if (authState === 'unauthorized') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">غير مصرح لك بالدخول</h2>
            <p className="font-cairo text-secondary mb-6">هذه الصفحة مخصصة للمسؤول فقط. يرجى تسجيل الدخول بحساب له صلاحية الأدمن.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (authState === 'error') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">خطأ في الخادم</h2>
            <p className="font-cairo text-secondary mb-4">{error}</p>
            <button onClick={loadRows} className="px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>
    );
  }

  const counts = {
    total: rows.length,
    active: rows.filter((row) => row.status === 'ACTIVE').length,
    draft: rows.filter((row) => row.status === 'DRAFT').length,
    inactive: rows.filter((row) => row.status === 'INACTIVE').length,
  };

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />
      
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin" className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">لوحة التحكم</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">إدارة محتوى موسوعة السفر</h1>
          <p className="font-cairo text-white/70 mt-1">عرض وتعديل المحتوى</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
          <div className="rounded-xl border border-sand bg-white p-4"><p className="font-cairo text-xs text-muted">الإجمالي</p><strong className="font-cairo text-2xl text-charcoal">{counts.total}</strong></div>
          <div className="rounded-xl border border-sand bg-white p-4"><p className="font-cairo text-xs text-muted">نشط</p><strong className="font-cairo text-2xl text-charcoal">{counts.active}</strong></div>
          <div className="rounded-xl border border-sand bg-white p-4"><p className="font-cairo text-xs text-muted">مسودة</p><strong className="font-cairo text-2xl text-charcoal">{counts.draft}</strong></div>
          <div className="rounded-xl border border-sand bg-white p-4"><p className="font-cairo text-xs text-muted">غير نشط</p><strong className="font-cairo text-2xl text-charcoal">{counts.inactive}</strong></div>
        </section>

        {/* Tabs */}
        <section className="space-y-4">
          <div className="flex gap-2 overflow-x-auto border-b border-sand bg-white rounded-t-xl px-4 pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSelected(null); }}
                className={`px-4 py-2 font-cairo text-sm whitespace-nowrap border-b-2 ${
                  activeTab === tab.key ? 'border-champagne text-charcoal' : 'border-transparent text-secondary hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row bg-white p-4 rounded-b-xl border border-t-0 border-mist">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') loadRows(); }}
                className="w-full rounded-md border border-sand bg-white py-3 pl-3 pr-10 font-cairo text-sm text-charcoal outline-none focus:border-champagne"
                placeholder="بحث"
              />
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-sand bg-white px-3 py-3 font-cairo text-sm text-charcoal">
              <option value="">كل الحالات</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="NEW">NEW</option>
              <option value="REVIEWING">REVIEWING</option>
            </select>
            <button onClick={loadRows} className="rounded-md bg-champagne px-5 py-3 font-cairo text-sm text-charcoal">تطبيق</button>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-mist bg-white">
            <div className="grid grid-cols-[1fr_120px_150px] border-b border-sand bg-sand px-4 py-3 font-cairo text-xs font-bold text-charcoal">
              <span>العنصر</span>
              <span>الحالة</span>
              <span>إجراءات</span>
            </div>
            {rows.length === 0 ? (
              <div className="p-8 text-center font-cairo text-muted">لا توجد نتائج</div>
            ) : rows.map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_120px_150px] items-center border-b border-sand px-4 py-3 last:border-b-0 hover:bg-sand/30">
                <div>
                  <p className="font-cairo text-sm font-bold text-charcoal">{String(titleFor(row))}</p>
                  <p className="font-cairo text-xs text-muted">{row.slug ? String(row.slug) : row.cityAr ? String(row.cityAr) : row.id}</p>
                </div>
                <span className="font-cairo text-xs text-muted">{String(row.status || '-')}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(row)} className="rounded-md border border-sand p-2 text-charcoal" title="عرض التفاصيل"><Eye size={16} /></button>
                  {activeTab === 'travel-requests' ? (
                    <select
                      onChange={(e) => e.target.value && updateTravelRequest(row, e.target.value)}
                      className="rounded-md border border-sand bg-white px-2 py-1 font-cairo text-xs"
                      defaultValue=""
                    >
                      <option value="">تغيير...</option>
                      <option value="NEW">NEW</option>
                      <option value="REVIEWING">REVIEWING</option>
                      <option value="OPTIONS_SENT">OPTIONS_SENT</option>
                      <option value="USER_APPROVED">USER_APPROVED</option>
                      <option value="BOOKING_PENDING">BOOKING_PENDING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  ) : (
                    <button onClick={() => updateStatus(row, row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')} className="rounded-md border border-sand p-2" title={row.status === 'ACTIVE' ? 'تعطيل' : 'تفعيل'}>
                      {row.status === 'ACTIVE' ? <ToggleLeft size={16} className="text-red-500" /> : <ToggleRight size={16} className="text-green-500" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
