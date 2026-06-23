'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Users, Calendar, CheckCircle, AlertCircle, Lock, Eye, RefreshCw } from 'lucide-react';
import Header from '@/components/layout/Header';

interface TravelRequest {
  id: string;
  referenceNumber: string;
  serviceType: string;
  cityAr: string | null;
  status: string;
  guests: number | null;
  rooms: number | null;
  budgetLevel: string | null;
  notes: string | null;
  createdAt: string;
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
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

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

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-yellow-100 text-yellow-700',
  OPTIONS_SENT: 'bg-purple-100 text-purple-700',
  USER_APPROVED: 'bg-green-100 text-green-700',
  BOOKING_PENDING: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setAuthState('loading');
    setError(null);

    try {
      const response = await fetch('/api/travel-requests', {
        credentials: 'include'
      });

      if (response.status === 401) {
        setAuthState('unauthenticated');
        return;
      }

      if (!response.ok) {
        throw new Error('فشل في تحميل الطلبات');
      }

      const data = await response.json();
      setRequests(data.data || []);
      setAuthState('authenticated');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const formatDate = (dateString: string) => {
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
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-sand rounded w-1/3" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-sand rounded-xl" />)}
            </div>
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
            <p className="font-cairo text-secondary mb-6">يرجى تسجيل الدخول لمشاهدة طلباتك</p>
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">خطأ في التحميل</h2>
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
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-2xl font-bold">طلباتي</h1>
          <p className="font-cairo text-champagne text-sm mt-1">
            {requests.length} طلب
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-charcoal/50" />
            </div>
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">لا توجد طلبات</h2>
            <p className="font-cairo text-secondary mb-6">لم تقم بأي طلبات بعد</p>
            <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              استكشف الوجهات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={'/my-requests/' + request.id}
                className="block bg-white rounded-2xl border border-mist p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-cairo text-sm text-secondary">{request.referenceNumber}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-cairo ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[request.status]?.label || request.status}
                      </span>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-secondary" />
                </div>

                <div className="flex items-center gap-4 flex-wrap text-sm text-secondary">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-champagne" />
                    <span className="font-cairo">
                      {request.cityAr || request.destination?.cityAr || request.template?.titleAr || 'غير محدد'}
                    </span>
                  </div>
                  <span className="font-cairo">
                    {SERVICE_LABELS[request.serviceType] || request.serviceType}
                  </span>
                  {request.guests && (
                    <span className="font-cairo flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {request.guests} مسافر
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-mist">
                  <span className="font-cairo text-xs text-muted">
                    {formatDate(request.createdAt)}
                  </span>
                  <span className="font-cairo text-xs text-secondary">
                    {STATUS_LABELS[request.status]?.description || ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
