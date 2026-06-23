'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw, Search, ToggleLeft, ToggleRight } from 'lucide-react';

type Tab = 'destinations' | 'templates' | 'stay-guides' | 'travel-requests';
type Row = Record<string, unknown> & { id: string; status?: string; titleAr?: string; cityAr?: string; slug?: string; referenceNumber?: string };

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
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const active = tabs.find((tab) => tab.key === activeTab)!;

  const counts = useMemo(() => ({
    total: rows.length,
    active: rows.filter((row) => row.status === 'ACTIVE').length,
    draft: rows.filter((row) => row.status === 'DRAFT').length,
    inactive: rows.filter((row) => row.status === 'INACTIVE').length,
  }), [rows]);

  async function loadRows() {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    const response = await fetch(`${active.endpoint}?${params.toString()}`);
    if (response.ok) {
      const payload = await response.json();
      setRows(payload.data || []);
    } else {
      setRows([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRows();
  }, [activeTab, status]);

  async function updateStatus(row: Row, nextStatus: string) {
    if (activeTab === 'travel-requests') return;
    const response = await fetch(`${active.endpoint}/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) await loadRows();
  }

  async function updateTravelRequest(row: Row, nextStatus: string) {
    const response = await fetch(`/api/admin/travel-requests/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) await loadRows();
  }

  return (
    <main className="min-h-screen bg-ivory p-4" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-3 border-b border-sand pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-cairo text-sm text-champagne">FlyStay Admin</p>
            <h1 className="font-cairo text-3xl font-bold text-charcoal">إدارة محتوى موسوعة السفر</h1>
          </div>
          <button onClick={loadRows} className="inline-flex items-center justify-center gap-2 rounded-md bg-charcoal px-4 py-2 font-cairo text-sm text-white">
            <RefreshCw size={16} />
            تحديث
          </button>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-md border border-sand bg-white p-4"><p className="font-cairo text-xs text-muted">الإجمالي</p><strong className="font-cairo text-2xl text-charcoal">{counts.total}</strong></div>
          <div className="rounded-md border border-sand bg-white p-4"><p className="font-cairo text-xs text-muted">نشط</p><strong className="font-cairo text-2xl text-charcoal">{counts.active}</strong></div>
          <div className="rounded-md border border-sand bg-white p-4"><p className="font-cairo text-xs text-muted">مسودة</p><strong className="font-cairo text-2xl text-charcoal">{counts.draft}</strong></div>
          <div className="rounded-md border border-sand bg-white p-4"><p className="font-cairo text-xs text-muted">غير نشط</p><strong className="font-cairo text-2xl text-charcoal">{counts.inactive}</strong></div>
        </section>

        <section className="space-y-4">
          <div className="flex gap-2 overflow-x-auto border-b border-sand">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSelected(null); }}
                className={`px-4 py-3 font-cairo text-sm ${activeTab === tab.key ? 'border-b-2 border-champagne text-charcoal' : 'text-muted'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') loadRows(); }}
                className="w-full rounded-md border border-sand bg-white py-3 pl-3 pr-10 font-cairo text-sm text-charcoal outline-none focus:border-champagne"
                placeholder="بحث"
              />
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-sand bg-white px-3 py-3 font-cairo text-sm text-charcoal">
              <option value="">كل الحالات</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="NEW">NEW</option>
              <option value="REVIEWING">REVIEWING</option>
              <option value="OFFER_SENT">OFFER_SENT</option>
            </select>
            <button onClick={loadRows} className="rounded-md bg-champagne px-5 py-3 font-cairo text-sm text-charcoal">تطبيق</button>
          </div>

          <div className="overflow-hidden rounded-md border border-sand bg-white">
            <div className="grid grid-cols-[1fr_120px_150px] border-b border-sand bg-mist px-4 py-3 font-cairo text-xs font-bold text-charcoal">
              <span>العنصر</span>
              <span>الحالة</span>
              <span>إجراءات</span>
            </div>
            {loading ? (
              <div className="p-6 text-center font-cairo text-muted">جاري التحميل...</div>
            ) : rows.length === 0 ? (
              <div className="p-6 text-center font-cairo text-muted">لا توجد نتائج</div>
            ) : rows.map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_120px_150px] items-center border-b border-sand px-4 py-3 last:border-b-0">
                <div>
                  <p className="font-cairo text-sm font-bold text-charcoal">{String(titleFor(row))}</p>
                  <p className="font-cairo text-xs text-muted">{row.slug ? String(row.slug) : row.cityAr ? String(row.cityAr) : row.id}</p>
                </div>
                <span className="font-cairo text-xs text-muted">{String(row.status || '-')}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(row)} className="rounded-md border border-sand p-2 text-charcoal" title="عرض التفاصيل"><Eye size={16} /></button>
                  {activeTab === 'travel-requests' ? (
                    <button onClick={() => updateTravelRequest(row, 'REVIEWING')} className="rounded-md border border-sand p-2 text-charcoal" title="قيد المراجعة"><ToggleRight size={16} /></button>
                  ) : row.status === 'ACTIVE' ? (
                    <button onClick={() => updateStatus(row, 'INACTIVE')} className="rounded-md border border-sand p-2 text-charcoal" title="تعطيل"><ToggleLeft size={16} /></button>
                  ) : (
                    <button onClick={() => updateStatus(row, 'ACTIVE')} className="rounded-md border border-sand p-2 text-charcoal" title="تفعيل"><ToggleRight size={16} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {selected && (
          <section className="rounded-md border border-sand bg-white p-4">
            <h2 className="mb-3 font-cairo text-lg font-bold text-charcoal">تفاصيل</h2>
            <pre className="max-h-96 overflow-auto rounded-md bg-mist p-4 text-left text-xs text-charcoal" dir="ltr">
              {JSON.stringify(selected, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}
