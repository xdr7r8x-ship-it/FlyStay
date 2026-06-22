'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function PaymentSuccessPage() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-sand border border-mist rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-champagne/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-champagne" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-cairo text-2xl font-bold text-charcoal mb-4">
            {checking ? 'جارٍ التحقق...' : 'تم استلام إشعار الدفع'}
          </h1>

          <p className="font-cairo text-secondary mb-6">
            {checking 
              ? 'ننتظر تأكيد الدفع من بوابة Tap...'
              : 'وصلنا إشعار الدفع، وسنؤكد الحالة بعد معالجة بيانات الدفع.'
            }
          </p>

          <div className="bg-ivory rounded-xl p-4 mb-6">
            <p className="font-cairo text-sm text-secondary">
              💡 سيتم إرسال إشعار على بريدك الإلكتروني بمجرد تأكيد حالة الدفع.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/orders"
              className="block w-full py-4 bg-charcoal text-white rounded-xl font-cairo font-semibold hover:opacity-90 transition-opacity text-center"
            >
              عرض طلباتي
            </Link>
            <Link
              href="/"
              className="block w-full py-4 bg-mist text-charcoal rounded-xl font-cairo font-semibold hover:bg-mist/80 transition-opacity text-center"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
