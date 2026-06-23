'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Users, Calendar, CheckCircle, AlertCircle, Lock, ChevronDown, Save, X } from 'lucide-react';
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

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'جديد' },
  { value: 'REVIEWING', label: 'قيد المراجعة' },
  { value: 'OPTIONS_SENT', label: 'تم إرسال الخيارات' },
  { value: 'USER_APPROVED', label: 'موافق' },
  { value: 'BOOKING_PENDING', label: 'انتظار الحجز' },
  { value: 'COMPLETED', label: 'مكتمل' },
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
  const router = useRouter();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchRequests() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/admin/travel-requests', {
          credentials: 'include',
        });
        
        if (response.status === 401 || response.status === 403) {
          setIsAuthorized(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('فشل في تحميل الطلبات');
        }
        
        setIsAuthorized(true);
        const data = await response.json();
        setRequests(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRequests();
  }, []);

  const handleExpand = (request: TravelRequest) => {
    setExpandedId(expandedId === request.id ? null : request.id);
    setUpdateStatus(request.status);
    setUpdateNotes(request.notes || '');
  };

  const handleUpdate = async (requestId: string) => {
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
        throw new Error('فشل في تحديث الطلب');
      }
      
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: updateStatus, notes: updateNotes } : r
      ));
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isAuthorized === false) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl p-8 border border-mist shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="font-cairo text-2xl font-bold text-charcoal mb-4">غير مصرح</h1>
            <p className="font-cairo text-secondary mb-6">
              يلزم صلاحيات المسؤول للوصول لهذه الصفحة
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-semibold"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-6 border border-mist animate-pulse">
            <div className="h-8 bg-sand rounded w-1/4 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-sand rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl p-8 border border-mist shadow-lg">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="font-cairo text-xl font-bold text-charcoal mb-4">حدث خطأ</h1>
            <p className="font-cairo text-secondary mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-semibold"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />
      
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-2xl font-bold">إدارة الطلبات</h1>
          <p className="font-cairo text-champagne text-sm mt-1">
            {requests.length} طلب في الانتظار
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-sand rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-charcoal/50" />
            </div>
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">لا توجد طلبات</h2>
            <p className="font-cairo text-secondary">لم يتم استلام أي طلبات جديدة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl border border-mist overflow-hidden">
                <div 
                  className="p-5 cursor-pointer hover:bg-sand/30 transition-colors"
                  onClick={() => handleExpand(request)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-cairo text-sm text-secondary">{request.referenceNumber}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-cairo ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_OPTIONS.find(s => s.value === request.status)?.label || request.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-champagne" />
                          <span className="font-cairo text-charcoal">
                            {request.cityAr || request.destination?.cityAr || request.template?.titleAr || 'غير محدد'}
                          </span>
                        </div>
                        <span className="font-cairo text-secondary">
                          {SERVICE_LABELS[request.serviceType] || request.serviceType}
                        </span>
                        {request.guests && (
                          <span className="font-cairo text-secondary flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {request.guests} مسافر
                          </span>
                        )}
                        {request.budgetLevel && (
                          <span className="font-cairo text-secondary">
                            {BUDGET_LABELS[request.budgetLevel] || request.budgetLevel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-cairo text-xs text-secondary hidden sm:block">
                        {formatDate(request.createdAt)}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${expandedId === request.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {expandedId === request.id && (
                  <div className="border-t border-mist p-5 bg-sand/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="font-cairo text-xs text-secondary mb-1">المسافرون</p>
                        <p className="font-cairo text-sm">{request.guests || 0} مسافر{request.rooms ? ` / ${request.rooms} غرفة` : ''}</p>
                      </div>
                      <div>
                        <p className="font-cairo text-xs text-secondary mb-1">تاريخ الإنشاء</p>
                        <p className="font-cairo text-sm">{formatDate(request.createdAt)}</p>
                      </div>
                      {request.notes && (
                        <div className="md:col-span-2">
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
                        <label className="block font-cairo text-sm text-secondary mb-2">ملاحظات داخلية</label>
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
                          {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="flex items-center gap-2 px-4 py-2 bg-sand text-charcoal rounded-lg font-cairo"
                        >
                          <X className="w-4 h-4" />
                          إلغاء
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <p className="font-cairo text-xs text-secondary">
                        <strong>ملاحظة:</strong> تحديث الحالة لا يعني تأكيد الحجز. يجب التأكد من توفر السعر والخدمة قبل أي تأكيد.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
