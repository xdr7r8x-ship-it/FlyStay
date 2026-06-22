'use client';

import { Plane, Building2, Check, X, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

const comparisonItems = [
  {
    id: 1,
    type: 'flight',
    title: 'طيران السعودية',
    subtitle: 'الرياض - دبي',
    price: '1,250',
    departure: '08:00',
    arrival: '10:30',
    duration: '2h 30m',
    stops: 0,
    class: 'اقتصادية',
  },
  {
    id: 2,
    type: 'flight',
    title: 'طيران الإمارات',
    subtitle: 'الرياض - دبي',
    price: '1,850',
    departure: '14:00',
    arrival: '18:00',
    duration: '4h 00m',
    stops: 1,
    class: 'اقتصادية',
  },
];

const features = [
  { label: 'السعر', key: 'price' },
  { label: 'وقت المغادرة', key: 'departure' },
  { label: 'وقت الوصول', key: 'arrival' },
  { label: 'مدة الرحلة', key: 'duration' },
  { label: 'التوقفات', key: 'stops' },
  { label: 'درجة الطيران', key: 'class' },
];

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">مقارنة الرحلات</h1>
          <p className="font-cairo text-champagne">قارن بين الخيارات المختلفة</p>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparisonItems.map((item) => (
            <div key={item.id} className="bg-sand border border-mist rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-champagne/20 rounded-xl flex items-center justify-center">
                    {item.type === 'flight' ? (
                      <Plane className="w-6 h-6 text-champagne" />
                    ) : (
                      <Building2 className="w-6 h-6 text-champagne" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-cairo font-semibold text-charcoal">{item.title}</h3>
                    <p className="font-cairo text-sm text-secondary">{item.subtitle}</p>
                  </div>
                </div>
                <span className="font-cairo font-bold text-charcoal text-xl">{item.price} ر.س</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">المغادرة</span>
                  <span className="font-cairo text-charcoal">{item.departure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">الوصول</span>
                  <span className="font-cairo text-charcoal">{item.arrival}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">المدة</span>
                  <span className="font-cairo text-charcoal">{item.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">التوقفات</span>
                  <span className="font-cairo text-charcoal">
                    {item.stops === 0 ? (
                      <span className="text-success">مباشر</span>
                    ) : (
                      `${item.stops} توقف`
                    )}
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 py-3 bg-charcoal text-white rounded-xl font-cairo font-medium hover:opacity-90 transition-opacity">
                احجز هذه الرحلة
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">تفاصيل المقارنة</h2>
        <div className="bg-sand border border-mist rounded-2xl overflow-hidden">
          {features.map((feature, idx) => (
            <div
              key={feature.key}
              className={`flex px-5 py-4 ${idx !== features.length - 1 ? 'border-b border-mist' : ''}`}
            >
              <span className="font-cairo text-secondary w-32">{feature.label}</span>
              <div className="flex-1 flex justify-around">
                {comparisonItems.map((item) => (
                  <span key={item.id} className="font-cairo text-charcoal font-medium">
                    {feature.key === 'price' ? `${item[feature.key as keyof typeof item]} ر.س` : 
                     feature.key === 'stops' ? (item[feature.key as keyof typeof item] === 0 ? 'مباشر' : `${item[feature.key as keyof typeof item]} توقف`) :
                     item[feature.key as keyof typeof item]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
