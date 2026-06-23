'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Users, Calendar, CheckCircle, AlertCircle, Lock, ChevronDown, Save, X, ArrowLeft, Eye, Search, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';

interface TravelRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  serviceType: string;
  cityAr: string | null;
  status: string;
  paymentStatus: string;
  bookingStatus: string;
  guests: number | null;
  rooms: number | null;
  budgetLevel: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  destination?: {
    cityAr: string;
    countryAr: string;
  } | null;
  template?: {
    titleAr: string;
  } | null;
}

interface Stats {
  total: number;
  NEW: number;
  REVIEWING: number;
  OPTIONS_SENT: number;
  USER_APPROVED: number;
  BOOKING_PENDING: number;
  COMPLETED: number;
  CANCELLED: number;
}

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'جديد' },
  { value: 'REVIEWING', label: 'قيد المراجعة' },
  { value: 'OPTIONS_SENT', label: 'تم إرسال الخيارات' },
  { value: 'USER_APPROVED', label: 'موافق' },
  { value: 'BOOKING_PENDING', label: 'بانتظار الإجراء' },
  { value: 'COMPLETED', label: 'مكتمل إداريًا' },
  { value: 'CANCELLED', label: 'ملغي' },
];

const SERVICE_LABELS: Record<string, string> = {
  FLIGHT: 'رحلات طيران',
  HOTEL: 'فنادق',
  PACKAGE: 'باقات',
  CHALET: 'شاليهات',
  RESTHOUSE: 'استراحات',
  MIXED: 'مختلطة',
};

const BUDGET_LABELS: Record<string, string> = {
  ECONOMY: 'اقتصادية',
  MID: 'متوسطة',
  LUXURY: 'فاخرة',
  MIXED: 'مختلطة',
};

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-yellow-100 text-yellow-700',
  OPTIONS_SENT: 'bg-purple-100 text-purple-700',
  USER_APPROVED: 'bg-green-100 text-green-700',
  BOOKING_PENDING: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRequests = useCallback(async () => {
    setAuthState('loading');
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('q', searchQuery);
      
      const response = await fetch('/api/admin/travel-requests?' + params.toString(), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          return;
        }
        throw new Error('فشل في تحميل الطلبات');
      }
      
      const data = await response.json();
      let filtered = data.data || [];
      
      if (serviceFilter) filtered = filtered.filter((r: TravelRequest) => r.serviceType === serviceFilter);
      if (budgetFilter) filtered = filtered.filter((r: TravelRequest) => r.budgetLevel === budgetFilter);
      
      setRequests(filtered);
      setAuthState('authorized');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    }
  }, [statusFilter, serviceFilter, budgetFilter, searchQuery]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const stats: Stats = {
    total: requests.length,
    NEW: requests.filter(r => r.status === 'NEW').length,
    REVIEWING: requests.filter(r => r.status === 'REVIEWING').length,
    OPTIONS_SENT: requests.filter(r => r.status === 'OPTIONS_SENT').length,
    USER_APPROVED: requests.filter(r => r.status === 'USER_APPROVED').length,
    BOOKING_PENDING: requests.filter(r => r.status === 'BOOKING_PENDING').length,
    COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
    CANCELLED: requests.filter(r => r.status === 'CANCELLED').length,
  };

  const handleExpand = (request: TravelRequest) => {
    setExpandedId(expandedId === request.id ? null : request.id);
    setUpdateStatus(request.status);
    setUpdateNotes(request.notes || '');
  };

  const handleUpdate = async (requestId: string) => {
    if (authState !== 'authorized') return;
    setIsUpdating(true);

    try {
      const response = await fetch('/api/admin/travel-requests/' + requestId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: updateStatus,
          notes: updateNotes,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          return;
        }
        throw new Error('فشل في تحديث الطلب');
      }

      loadRequests();
      setExpandedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-sand rounded-xl" />)}
            </div>
            <div className="h-64 bg-sand rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

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
            <p className="font-cairo text-secondary mb-6">هذه الصفحة مخصصة للمسؤول فقط.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (authState === 'error') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">خطأ في الخادم</h2>
            <p className="font-cairo text-secondary mb-4">{error}</p>
            <button onClick={loadRequests} className="px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>
    );
  }

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
          <h1 className="font-cairo text-3xl font-bold">إدارة طلبات السفر</h1>
          <p className="font-cairo text-white/70 mt-1">عرض وتعديل حالة الطلبات</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
          <div className="rounded-xl border border-sand bg-white p-3 text-center">
            <p className="font-cairo text-xs text-muted">الإجمالي</p>
            <strong className="font-cairo text-xl text-charcoal">{stats.total}</strong>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
            <p className="font-cairo text-xs text-blue-600">جديد</p>
            <strong className="font-cairo text-xl text-blue-600">{stats.NEW}</strong>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-center">
            <p className="font-cairo text-xs text-yellow-600">قيد المراجعة</p>
            <strong className="font-cairo text-xl text-yellow-600">{stats.REVIEWING}</strong>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-center">
            <p className="font-cairo text-xs text-purple-600">خيارات</p>
            <strong className="font-cairo text-xl text-purple-600">{stats.OPTIONS_SENT}</strong>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
            <p className="font-cairo text-xs text-green-600">موافق</p>
            <strong className="font-cairo text-xl text-green-600">{stats.USER_APPROVED}</strong>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-center">
            <p className="font-cairo text-xs text-orange-600">بانتظار</p>
            <strong className="font-cairo text-xl text-orange-600">{stats.BOOKING_PENDING}</strong>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-100 p-3 text-center">
            <p className="font-cairo text-xs text-green-700">مكتمل</p>
            <strong className="font-cairo text-xl text-green-700">{stats.COMPLETED}</strong>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
            <p className="font-cairo text-xs text-red-600">ملغي</p>
            <strong className="font-cairo text-xl text-red-600">{stats.CANCELLED}</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-mist mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadRequests()}
                placeholder="بحث..."
                className="w-full rounded-md border border-sand bg-white py-3 pl-3 pr-10 font-cairo text-sm outline-none focus:border-champagne"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-sand bg-white px-3 py-3 font-cairo text-sm">
              <option value="">كل الحالات</option>
              <option value="NEW">جديد</option>
              <option value="REVIEWING">قيد المراجعة</option>
              <option value="OPTIONS_SENT">خيارات مرسلة</option>
              <option value="USER_APPROVED">موافق</option>
              <option value="BOOKING_PENDING">بانتظار الإجراء</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="CANCELLED">ملغي</option>
            </select>
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="rounded-md border border-sand bg-white px-3 py-3 font-cairo text-sm">
              <option value="">كل الأنواع</option>
              <option value="FLIGHT">رحلات طيران</option>
              <option value="HOTEL">فنادق</option>
              <option value="PACKAGE">باقات</option>
              <option value="CHALET">شاليهات</option>
              <option value="RESTHOUSE">استراحات</option>
              <option value="MIXED">مختلطة</option>
            </select>
            <button onClick={loadRequests} className="rounded-md bg-champagne px-5 py-3 font-cairo text-sm text-charcoal">
              تطبيق
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-mist overflow-hidden">
          <div className="grid grid-cols-[100px_100px_1fr_80px_80px_100px_100px_60px] border-b border-sand bg-sand px-4 py-3 font-cairo text-xs font-bold text-charcoal">
            <span>المرجع</span>
            <span>النوع</span>
            <span>الوجهة</span>
            <span>ضيوف</span>
            <span>الميزانية</span>
            <span>الحالة</span>
            <span>التاريخ</span>
            <span></span>
          </div>
          
          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="font-cairo text-secondary">لا توجد طلبات</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id}>
                <div className="grid grid-cols-[100px_100px_1fr_80px_80px_100px_100px_60px] items-center border-b border-sand px-4 py-3 last:border-b-0 hover:bg-sand/30">
                  <span className="font-cairo text-xs text-charcoal">{request.referenceNumber}</span>
                  <span className="font-cairo text-xs text-secondary">{SERVICE_LABELS[request.serviceType] || request.serviceType}</span>
                  <span className="font-cairo text-sm text-charcoal truncate">
                    {request.cityAr || request.destination?.cityAr || request.template?.titleAr || '-'}
                  </span>
                  <span className="font-cairo text-xs text-secondary">{request.guests || '-'}</span>
                  <span className="font-cairo text-xs text-secondary">{request.budgetLevel ? BUDGET_LABELS[request.budgetLevel] || '-' : '-'}</span>
                  <span className={`font-cairo text-xs px-2 py-1 rounded-full text-center ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_OPTIONS.find(s => s.value === request.status)?.label || request.status}
                  </span>
                  <span className="font-cairo text-xs text-secondary">{formatDate(request.createdAt)}</span>
                  <button onClick={() => handleExpand(request)} className="rounded-md border border-sand p-2" title="عرض/تعديل">
                    <Eye size={16} className="text-charcoal" />
                  </button>
                </div>

                {expandedId === request.id && (
                  <div className="border-t border-mist p-5 bg-sand/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="font-cairo text-xs text-secondary mb-1">رقم المرجع</p>
                        <p className="font-cairo text-sm font-bold">{request.referenceNumber}</p>
                      </div>
                      <div>
                        <p className="font-cairo text-xs text-secondary mb-1">الضيوف</p>
                        <p className="font-cairo text-sm">{request.guests || 0} مسافر{request.rooms ? ` / ${request.rooms} غرفة` : ''}</p>
                      </div>
                      <div>
                        <p className="font-cairo text-xs text-secondary mb-1">الإنشاء</p>
                        <p className="font-cairo text-sm">{formatDate(request.createdAt)}</p>
                      </div>
                      <div>
                        <p className="font-cairo text-xs text-secondary mb-1">التحديث</p>
                        <p className="font-cairo text-sm">{formatDate(request.updatedAt)}</p>
                      </div>
                      {request.notes && (
                        <div className="md:col-span-4">
                          <p className="font-cairo text-xs text-secondary mb-1">ملاحظات المستخدم</p>
                          <p className="font-cairo text-sm bg-white p-3 rounded-lg">{request.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block font-cairo text-sm text-secondary mb-2">تحديث الحالة</label>
                        <select
                          value={updateStatus}
                          onChange={(e) => setUpdateStatus(e.target.value)}
                          className="w-full px-4 py-2 border border-mist rounded-lg font-cairo bg-white"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-cairo text-sm text-secondary mb-2">ملاحظات</label>
                        <textarea
                          value={updateNotes}
                          onChange={(e) => setUpdateNotes(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-mist rounded-lg font-cairo bg-white resize-none"
                          placeholder="أضف ملاحظات..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdate(request.id)}
                          disabled={isUpdating}
                          className="flex items-center gap-2 px-4 py-2 bg-champagne text-charcoal rounded-lg font-cairo font-semibold disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {isUpdating ? 'جاري...' : 'حفظ'}
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="flex items-center gap-2 px-4 py-2 bg-sand text-charcoal rounded-lg font-cairo"
                        >
                          إلغاء
                        </button>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-mist">
                        <Link
                          href={'/admin/requests/' + request.id}
                          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg font-cairo text-sm"
                        >
                          تفاصيل الطلب
                        </Link>
                        <Link
                          href={'/admin/requests/' + request.id + '/options'}
                          className="flex items-center gap-2 px-4 py-2 border border-champagne text-champagne rounded-lg font-cairo text-sm"
                        >
                          إدارة الخيارات
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <p className="font-cairo text-xs text-secondary">
                        <strong>تنبيه:</strong> تحديث الحالة لا يعني تأكيد الحجز. يتطلب إجراء يدوي.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/admin" className="font-cairo text-sm text-champagne hover:underline">
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    </main>
  );
}
