'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, AlertCircle, Lock, Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';

interface Option {
  id: string;
  requestId: string;
  titleAr: string;
  descriptionAr: string;
  optionType: string;
  priceHintAr: string | null;
  status: string;
  createdAt: string;
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'forbidden' | 'error';

const OPTION_TYPE_LABELS: Record<string, string> = {
  SUGGESTION: 'اقتراح',
  UPGRADE: 'ترقية',
  ALTERNATIVE: 'بديل',
};

export default function UserRequestOptionsPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [options, setOptions] = useState<Option[]>([]);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    setAuthState('loading');
    setError(null);

    try {
      const res = await fetch('/api/travel-requests/' + requestId + '/options', {
        credentials: 'include'
      });

      if (res.status === 401) {
        setAuthState('unauthenticated');
        return;
      }

      if (res.status === 403) {
        setAuthState('forbidden');
        return;
      }

      if (!res.ok) {
        throw new Error('فشل في تحميل الخيارات');
      }

      const data = await res.json();
      setOptions(data.data || []);
      setAuthState('authenticated');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    }
  }, [requestId]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleSelect = async (optionId: string) => {
    if (!confirm('هل أنت متأكد من اختيار هذا الخيار؟')) return;

    setActionLoading(optionId);
    try {
      const res = await fetch('/api/travel-requests/' + requestId + '/options/' + optionId + '/select', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error?.message || 'فشل في اختيار الخيار');
        return;
      }

      alert('تم اختيار الخيار. بانتظار الإجراء اليدوي من فريق FlyStay.');
      loadOptions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!confirm('هل تريد رفض جميع الخيارات؟ سنتواصل معك لمزيد من التفاصيل.')) return;

    setActionLoading('reject');
    try {
      const res = await fetch('/api/travel-requests/' + requestId + '/options/reject', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error?.message || 'فشل في رفض الخيارات');
        return;
      }

      alert('تم رفض الخيارات. سيتواصل معك فريقنا.');
      loadOptions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-champagne" />
        </div>
      </main>
    );
  }

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
            <p className="font-cairo text-secondary mb-6">يرجى تسجيل الدخول لمشاهدة الخيارات</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
            <p className="font-cairo text-secondary mb-6">لا يمكنك عرض خيارات هذا الطلب</p>
            <Link href="/my-requests" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              العودة لطلباتي
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="font-cairo text-secondary mb-4">{error}</p>
            <button onClick={loadOptions} className="px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>
    );
  }

  const selectedOption = options.find(o => o.status === 'SELECTED');
  const sentOptions = options.filter(o => o.status === 'SENT');

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />

      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href={'/my-requests/' + requestId} className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">طلباتي</span>
          </div>
          <h1 className="font-cairo text-2xl font-bold">الخيارات المتاحة</h1>
          <p className="font-cairo text-white/70 mt-1">راجع الخيارات واختر ما يناسبك</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Notice */}
        <div className="bg-sand/50 rounded-xl p-4 border border-mist mb-6">
          <p className="font-cairo text-xs text-secondary">
            <strong>تنبيه:</strong> هذه خيارات أولية للمراجعة وليست حجزًا مؤكدًا.
            سيتم تأكيد السعر والتوفر يدويًا قبل أي إجراء.
            اختيارك للخيار يعني الموافقة على المتابعة، وليس إتمام الحجز.
          </p>
        </div>

        {options.length === 0 ? (
          <div className="bg-white rounded-xl border border-mist p-8 text-center">
            <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-charcoal/50" />
            </div>
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">لا توجد خيارات</h2>
            <p className="font-cairo text-secondary mb-6">لم يتم إرسال خيارات بعد. يرجى الانتظار.</p>
            <Link href={'/my-requests/' + requestId} className="inline-flex items-center gap-2 px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo">
              العودة للطلب
            </Link>
          </div>
        ) : (
          <>
            {/* Options List */}
            <div className="space-y-4 mb-6">
              {options.map((opt) => (
                <div key={opt.id} className="bg-white rounded-xl border border-mist p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-cairo font-bold text-charcoal">{opt.titleAr}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-cairo bg-sand text-secondary">
                          {OPTION_TYPE_LABELS[opt.optionType] || opt.optionType}
                        </span>
                      </div>
                      <p className="font-cairo text-sm text-secondary mb-2">{opt.descriptionAr}</p>
                      {opt.priceHintAr && (
                        <p className="font-cairo text-xs text-charcoal bg-sand/50 px-3 py-1 rounded-full inline-block">
                          {opt.priceHintAr}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {opt.status === 'SELECTED' && (
                    <div className="mt-3 pt-3 border-t border-mist">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-cairo font-semibold">هذا هو اختيارك</span>
                      </div>
                    </div>
                  )}

                  {/* Select button for sent options */}
                  {opt.status === 'SENT' && !selectedOption && (
                    <div className="mt-3 pt-3 border-t border-mist">
                      <button
                        onClick={() => handleSelect(opt.id)}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-champagne text-charcoal rounded-lg font-cairo font-semibold disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {actionLoading === opt.id ? 'جاري...' : 'اختر هذا الخيار'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reject all button */}
            {sentOptions.length > 0 && !selectedOption && (
              <div className="bg-white rounded-xl border border-mist p-5 mb-6">
                <p className="font-cairo text-sm text-secondary mb-4">
                  هل لا يوجد خيار مناسب؟ يمكنك رفض جميع الخيارات وطلب بدائل.
                </p>
                <button
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-cairo disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  {actionLoading === 'reject' ? 'جاري...' : 'رفض جميع الخيارات'}
                </button>
              </div>
            )}

            {/* Selected confirmation */}
            {selectedOption && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-cairo font-bold text-green-700">تم اختيار الخيار</h3>
                </div>
                <p className="font-cairo text-sm text-green-600 mb-2">
                  لقد اخترت: <strong>{selectedOption.titleAr}</strong>
                </p>
                <p className="font-cairo text-xs text-green-600">
                  بانتظار الإجراء اليدوي من فريق FlyStay.
                </p>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <Link href={'/my-requests/' + requestId} className="font-cairo text-sm text-champagne hover:underline">
            العودة لتفاصيل الطلب
          </Link>
        </div>
      </div>
    </main>
  );
}
