'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Star, Heart, Share2, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function DetailsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleBooking = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    window.location.href = '/booking';
  };

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Hero Image */}
      <div className="relative bg-charcoal">
        <div className="w-full h-64 md:h-80 bg-gradient-to-br from-charcoal via-charcoal/90 to-charcoal/80 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-champagne mx-auto mb-4" />
            <p className="font-cairo text-white text-xl">صورة الرحلة</p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
              isFavorited ? 'bg-error text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-sand border border-mist rounded-3xl p-6">
          {/* Title */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-sm font-cairo text-champagne">رحلة طيران</span>
              <h1 className="font-cairo text-2xl font-bold text-charcoal mt-1">
                الرياض - دبي
              </h1>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-champagne fill-current" />
                <span className="font-cairo text-charcoal">4.8</span>
                <span className="font-cairo text-muted text-sm">(125 تقييم)</span>
              </div>
            </div>
            <div className="text-left">
              <p className="font-cairo text-3xl font-bold text-charcoal">1,250</p>
              <p className="font-cairo text-muted">ر.س</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 py-4 border-t border-b border-mist">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-champagne/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-champagne" />
              </div>
              <div>
                <p className="font-cairo text-charcoal font-medium">15 يوليو 2026</p>
                <p className="font-cairo text-sm text-muted">الثلاثاء</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-champagne/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-champagne" />
              </div>
              <div>
                <p className="font-cairo text-charcoal font-medium">طيران السعودية</p>
                <p className="font-cairo text-sm text-muted">مباشر • 2 ساعة 30 دقيقة</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-champagne/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-champagne" />
              </div>
              <div>
                <p className="font-cairo text-charcoal font-medium">شخص واحد</p>
                <p className="font-cairo text-sm text-muted">درجة اقتصادية</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="py-4">
            <h3 className="font-cairo text-lg font-semibold text-charcoal mb-2">الوصف</h3>
            <p className="font-cairo text-secondary leading-relaxed">
              رحلة مريحة من الرياض إلى دبي على متن طيران السعودية. استمتع بخدمات الضيافة aboard مع وجبات مجانية واختيار الوجبات الخاصة.
            </p>
          </div>

          {/* Include/Exclude */}
          <div className="py-4 border-t border-mist">
            <h3 className="font-cairo text-lg font-semibold text-charcoal mb-3">ما يشمله السعر</h3>
            <div className="space-y-2">
              {['وزن حقائب 23 كجم', 'وجبة مجانية', 'اختيار مقعد مسبق', 'تأمين سفر أساسي'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success" />
                  <span className="font-cairo text-charcoal">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleBooking}
            disabled={isLoading}
            className="w-full py-4 bg-charcoal text-white rounded-xl font-cairo font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                جاري التحميل...
              </>
            ) : (
              'احجز الآن'
            )}
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
