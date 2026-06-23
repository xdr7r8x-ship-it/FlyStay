'use client';

import { Plane, Building2, Package, Gift, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

const services = [
  {
    id: 1,
    icon: Plane,
    title: 'حجز طيران',
    description: 'نوفر لك أفضل أسعار تذاكر الطيران لجميع الوجهات مع مجموعة واسعة من شركات الطيران.',
    features: ['رحلات داخلية', 'رحلات دولية', 'رحلات طيران charters', 'تأمين سفر'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 2,
    icon: Building2,
    title: 'فنادق',
    description: 'نختار لك أفضل الفنادق والشقق الفندقية المناسبة لاحتياجاتك وميزانيتك.',
    features: ['فنادق 5 نجوم', 'شقق فندقية', 'استراحات', 'بيوت ضيافة'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 3,
    icon: Package,
    title: 'باقات سياحية',
    description: 'باقات متكاملة تشمل الطيران والفنادق والجولات لاستقبال بدون عناء.',
    features: ['باقات شهر العسل', 'باقات عائلية', 'باقات سياحة', 'رحلات جماعية'],
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 4,
    icon: Gift,
    title: 'عروض حصرية',
    description: 'عروض وخصومات حصرية على مدار السنة لرحلات لا تُنسى بأسعار مناسبة.',
    features: ['خصومات الصيف', 'عروض رمضان', 'عروض نهاية الأسبوع', 'عروض مفاجئة'],
    color: 'from-amber-500 to-amber-600',
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">خدماتنا</h1>
          <p className="font-cairo text-champagne">نقدم لك تجربة سفر متكاملة</p>
        </div>
      </div>

      {/* Services List */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-sand border border-mist rounded-3xl p-6 transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-cairo text-xl font-bold text-charcoal mb-2">
                    {service.title}
                  </h3>
                  <p className="font-cairo text-secondary mb-4">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {service.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-charcoal/80"
                      >
                        <span className="w-1.5 h-1.5 bg-champagne rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/search?type=${service.id === 1 ? 'flights' : service.id === 2 ? 'hotels' : service.id === 3 ? 'packages' : 'offers'}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-charcoal text-white rounded-xl font-cairo font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    ابدأ التخطيط
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
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
