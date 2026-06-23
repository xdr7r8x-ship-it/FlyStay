'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Users, Calendar, CheckCircle, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import Header from '@/components/layout/Header';

interface TravelRequest {
  id: string;
  referenceNumber: string;
  serviceType: string;
  sourceType: string;
  cityAr: string | null;
  startDate: string | null;
  endDate: string | null;
  guests: number | null;
  rooms: number | null;
  budgetLevel: string | null;
  notes: string | null;
  status: string;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
  updatedAt: string;
  destination?: {
    id: string;
    slug: string;
    cityAr: string;
    countryAr: string;
  } | null;
  template?: {
    id: string;
    slug: string;
    titleAr: string;
  } | null;
  stayGuide?: {
    id: string;
    titleAr: string;
    cityAr: string;
    type: string;
  } | null;
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'forbidden' | 'error';

const STATUS_LABELS: Record<string, { label: string; description: string }> = {
  NEW: { label: 'تم استلام الطلب', description: 'تم استلام طلبك وجاري مراجعته' },
  REVIEWING: { label: 'قيد المراجعة', description: 'الطلب قيد المراجعة من قبل فريقنا' },
  OPTIONS_SENT: { label: 'خيارات جاهزة', description: 'تم تجهيز خيارات للمراجعة' },
  USER_APPROVED: { label: 'تمت الموافقة', description: 'تمت موافقتك على الخيارات المختارة' },
  BOOKING_PENDING: { label: 'بانتظار الإجراء', description: 'بانتظار الإجراء اليدوي' },
  COMPLETED: { label: 'مكتمل إداريًا', description: 'تمت المعاملة إداريًا' },
  CANCELLED: { label: 'ملغي', description: 'تم إلغاء الطلب' },
};

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

export default function MyRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);

  const loadRequest = useCallback(async () => {
    setAuthState('loading');
    setError(null);

    try {
      const response = await fetch('/api/travel-requests/' + requestId, {
        credentials: 'include'
      });

      if (response.status === 401) {
        setAuthState('unauthenticated');
        return;
      }

      if (response.status === 403) {
        setAuthState('forbidden');
        return;
      }

      if (response.status === 404) {
        setError('الطلب غير موجود');
        setAuthState('error');
        return;
      }

      if (!response.ok) {
        throw new Error('فشل في تحميل الطلب');
      }

      const data = await response.json();
      setRequest(data.data);
      setAuthState('authenticated');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sand rounded w-1/3" />
            <div className="h-64 bg-sand rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  // Not authenticated
  if (authState === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-charcoal/50" />
            </div>
            <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">يلزم تسجيل الدخول</h2>
            <p className="font-cairo text-secondary mb-6">يرجى تسجيل الدخول لمشاهدة تفاصيل الطلب</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Forbidden - trying to access another user's request
  if (authState === 'forbidden') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">غير مصرح</h2>
            <p className="font-cairo text-secondary mb-6">لا يمكنك عرض هذا الطلب</p>
            <Link href="/my-requests" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              العودة لطلباتي
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (authState === 'error' || !request) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">{error || 'حدث خطأ'}</h2>
            <Link href="/my-requests" className="inline-flex items-center gap-2 px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo mt-4">
              العودة لطلباتي
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusInfo = STATUS_LABELS[request.status] || { label: request.status, description: '' };

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />

      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/my-requests" className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">طلباتي</span>
          </div>
          <h1 className="font-cairo text-2xl font-bold">تفاصيل الطلب</h1>
          <p className="font-cairo text-white/70 mt-1">{request.referenceNumber}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-6 ${STATUS_COLORS[request.status] || 'bg-gray-100'}`}>
          <div className="flex items-center gap-3">
            {request.status === 'NEW' && <Clock className="w-5 h-5" />}
            {request.status === 'REVIEWING' && <Clock className="w-5 h-5" />}
            {request.status === 'OPTIONS_SENT' && <CheckCircle className="w-5 h-5" />}
            {request.status === 'USER_APPROVED' && <CheckCircle className="w-5 h-5" />}
            {request.status === 'BOOKING_PENDING' && <Clock className="w-5 h-5" />}
            {request.status === 'COMPLETED' && <CheckCircle className="w-5 h-5" />}
            {request.status === 'CANCELLED' && <AlertCircle className="w-5 h-5" />}
            <div>
              <span className="font-cairo font-bold">{statusInfo.label}</span>
              <p className="font-cairo text-xs opacity-80">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Request Info */}
        <div className="bg-white rounded-xl border border-mist p-6 mb-6">
          <h2 className="font-cairo text-lg font-bold text-charcoal mb-4">معلومات الطلب</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">رقم المرجع</p>
              <p className="font-cairo text-sm font-bold">{request.referenceNumber}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">نوع الخدمة</p>
              <p className="font-cairo text-sm">{SERVICE_LABELS[request.serviceType] || request.serviceType}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الوجهة</p>
              <p className="font-cairo text-sm">
                {request.cityAr || request.destination?.cityAr || request.template?.titleAr || '-'}
              </p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الميزانية</p>
              <p className="font-cairo text-sm">{request.budgetLevel ? BUDGET_LABELS[request.budgetLevel] || '-' : '-'}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الضيوف</p>
              <p className="font-cairo text-sm">
                {request.guests || 0} مسافر{request.rooms ? ` / ${request.rooms} غرفة` : ''}
              </p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">تاريخ الإنشاء</p>
              <p className="font-cairo text-sm">{formatDate(request.createdAt)}</p>
            </div>
            {request.startDate && (
              <div>
                <p className="font-cairo text-xs text-secondary mb-1">تاريخ البدء</p>
                <p className="font-cairo text-sm">{formatDate(request.startDate)}</p>
              </div>
            )}
            {request.endDate && (
              <div>
                <p className="font-cairo text-xs text-secondary mb-1">تاريخ الانتهاء</p>
                <p className="font-cairo text-sm">{formatDate(request.endDate)}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="font-cairo text-xs text-secondary mb-1">ملاحظاتك</p>
              <p className="font-cairo text-sm bg-sand p-3 rounded-lg">
                {request.notes || 'لا توجد ملاحظات'}
              </p>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-sand/50 rounded-xl p-4 border border-mist mb-6">
          <p className="font-cairo text-xs text-secondary">
            <strong>ملاحظة:</strong> هذه صفحة لمتابعة حالة طلبك فقط.
            لا تُعتبر أي حالة هنا تأكيدًا للحجز أو الدفع.
            للتواصل أو الاستفسار، يرجى استخدام قنوات الدعم المتاحة.
          </p>
        </div>

        <div className="text-center">
          <Link href="/my-requests" className="font-cairo text-sm text-champagne hover:underline">
            العودة لطلباتي
          </Link>
        </div>
      </div>
    </main>
  );
}
