'use client';

import { Gift, Plane, Building2, Percent, Clock, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

const offers = [
  {
    id: 1,
    title: 'خصم 20% على فنادق دبي',
    description: 'استمتع بخصم 20% على جميع فنادق دبي عند الحجز المبكر',
    type: 'hotel',
    discount: '20%',
    validUntil: '2026-08-31',
    code: 'DUB20',
    image: 'dubai',
  },
  {
    id: 2,
    title: 'عرض الصيف - طيران مجاني للأطفال',
    description: 'احصل على تذكرة طيران مجانية لكل طفل عند حجز عائلي',
    type: 'flight',
    discount: 'مجاني',
    validUntil: '2026-09-15',
    code: 'SUMMER24',
    image: 'summer',
  },
  {
    id: 3,
    title: 'باقة شهر العسل بخصم 30%',
    description: 'اختر باقتك المثالية لشهر العسل و احصل على خصم 30%',
    type: 'package',
    discount: '30%',
    validUntil: '2026-12-31',
    code: 'HONEY30',
    image: 'honeymoon',
  },
  {
    id: 4,
    title: 'عرض نهاية الأسبوع',
    description: 'خصم 15% على جميع الحجوزات نهاية الأسبوع',
    type: 'all',
    discount: '15%',
    validUntil: '2026-12-31',
    code: 'WEEKEND',
    image: 'weekend',
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'hotel':
      return Building2;
    case 'flight':
      return Plane;
    default:
      return Gift;
  }
};

export default function OffersPage() {
  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">العروض الحصرية</h1>
          <p className="font-cairo text-champagne">لا تفوتك أفضل العروض</p>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {offers.map((offer) => {
          const Icon = getIcon(offer.type);
          return (
            <div
              key={offer.id}
              className="bg-sand border border-mist rounded-2xl overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-champagne to-champagne/70 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-charcoal" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-cairo text-champagne uppercase">{offer.type}</span>
                        <h3 className="font-cairo font-bold text-charcoal text-lg mt-1">
                          {offer.title}
                        </h3>
                        <p className="font-cairo text-sm text-secondary mt-1">
                          {offer.description}
                        </p>
                      </div>
                      <div className="bg-charcoal text-white px-3 py-1 rounded-lg text-center">
                        <p className="font-cairo font-bold text-xl">{offer.discount}</p>
                        <p className="font-cairo text-xs text-champagne">خصم</p>
                      </div>
                    </div>

                    {/* Valid Until & Code */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-mist">
                      <div className="flex items-center gap-2 text-muted text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-cairo">ينتهي: {offer.validUntil}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1 bg-ivory border border-mist rounded-lg font-cairo text-charcoal font-medium">
                          {offer.code}
                        </code>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/search?offer=${offer.code}`}
                      className="block w-full mt-4 py-3 bg-charcoal text-white rounded-xl font-cairo font-medium text-center hover:opacity-90 transition-opacity"
                    >
                      استخدم العرض
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </main>
  );
}
