'use client';

import { Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/ErrorEmpty';

export default function DetailsPage() {
  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">تفاصيل الرحلة</h1>
          <p className="font-cairo text-champagne">عرض تفاصيل الخدمة</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          icon="search"
          title="لا توجد تفاصيل متاحة"
          description="ابحث عن رحلة أولاً ثم اختر ما تريد عرض تفاصيله."
          action={{
            label: 'ابحث عن رحلة',
            onClick: () => window.location.href = '/search',
          }}
        />
      </div>

      <BottomNav />
    </main>
  );
}
