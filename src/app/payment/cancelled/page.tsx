'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function PaymentCancelledPage() {
  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-sand border border-mist rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-muted/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="font-cairo text-2xl font-bold text-charcoal mb-4">
            تم إلغاء الدفع
          </h1>

          <p className="font-cairo text-secondary mb-6">
            تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
          </p>

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
