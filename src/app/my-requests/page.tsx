'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Users, Calendar, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface TravelRequest {
  id: string;
  referenceNumber: string;
  serviceType: string;
  cityAr: string | null;
  status: string;
  paymentStatus: string;
  bookingStatus: string;
  guests: number | null;
  budgetLevel: string | null;
  createdAt: string;
  destination?: {
    cityAr: string;
    countryAr: string;
  } | null;
  template?: {
    titleAr: string;
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'جديد', color: 'bg-blue-100 text-blue-700' },
  REVIEWING: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
  OPTIONS_SENT: { label: 'تم إرسال الخيارات', color: 'bg-purple-100 text-purple-700' },
  USER_APPROVED: { label: 'موافق', color: 'bg-green-100 text-green-700' },
  BOOKING_PENDING: { label: 'انتظار الحجز', color: 'bg-orange-100 text-orange-700' },
  COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
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

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/travel-requests', {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('فشل في تحميل الطلبات');
        }
        
        setIsAuthenticated(true);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl p-8 border border-mist shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 bg-sand rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-charcoal/50" />
            </div>
            <h1 className="font-cairo text-2xl font-bold text-charcoal mb-4">تسجيل الدخول مطلوب</h1>
            <p className="font-cairo text-secondary mb-6">
              يلزم تسجيل الدخول لعرض طلباتك
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-4 bg-champagne text-charcoal rounded-xl font-cairo font-semibold hover:bg-champagne/90 transition-all"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-mist animate-pulse">
                <div className="h-6 bg-sand rounded w-1/3 mb-4" />
                <div className="h-4 bg-sand rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
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
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />
      
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className="font-cairo text-2xl font-bold">طلباتي</h1>
          <p className="font-cairo text-champagne text-sm mt-1">تتبع طلباتك السابقة</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-sand rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-charcoal/50" />
            </div>
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">لا توجد طلبات</h2>
            <p className="font-cairo text-secondary mb-6">لم تقم بأي طلبات بعد</p>
            <button
              onClick={() => router.push('/search')}
              className="px-6 py-3 bg-champagne text-charcoal rounded-xl font-cairo font-semibold"
            >
              استكشف الوجهات
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const statusInfo = STATUS_LABELS[request.status] || { label: request.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <div key={request.id} className="bg-white rounded-2xl p-5 border border-mist hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-cairo text-xs text-secondary mb-1">{request.referenceNumber}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-cairo ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="font-cairo text-xs text-secondary">{formatDate(request.createdAt)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-champagne" />
                      <p className="font-cairo text-sm text-charcoal">
                        {request.cityAr || request.destination?.cityAr || request.template?.titleAr || 'غير محدد'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-champagne rounded-full" />
                        <p className="font-cairo text-xs text-secondary">
                          {SERVICE_LABELS[request.serviceType] || request.serviceType}
                        </p>
                      </div>
                      
                      {request.guests && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-champagne" />
                          <p className="font-cairo text-xs text-secondary">
                            {request.guests} مسافر
                          </p>
                        </div>
                      )}
                      
                      {request.budgetLevel && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-champagne rounded-full" />
                          <p className="font-cairo text-xs text-secondary">
                            {BUDGET_LABELS[request.budgetLevel] || request.budgetLevel}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-mist">
                    <div className="flex items-center gap-2 text-charcoal/60">
                      <CheckCircle className="w-4 h-4" />
                      <p className="font-cairo text-xs">
                        هذا طلب للمراجعة فقط - ليس حجزا مؤكدًا
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-sand/50 rounded-xl border border-mist">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
            <p className="font-cairo text-sm text-charcoal">
              <strong>ملاحظة:</strong> جميع الطلبات يتم مراجعتها والتواصل معك قبل أي تأكيد. الأسعار والتوفر يتم تأكيدها عبر مزود الحجز الفعلي.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
