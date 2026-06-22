'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Users, ChevronRight, ArrowRight, Sparkles, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface Destination {
  id: string;
  slug: string;
  cityAr: string;
  cityEn?: string;
  countryAr: string;
  descriptionAr: string;
  shortSummaryAr?: string;
  travelStyles: string[];
  bestForAr: string[];
  popularAreasAr: string[];
  topActivitiesAr: string[];
  suggestedDurations: string[];
  budgetLevel: string;
  seasonNotesAr?: string;
  airportInfoAr?: string;
  familyNotesAr?: string;
  safetyNotesAr?: string;
}

interface Template {
  id: string;
  slug: string;
  titleAr: string;
  summaryAr: string;
  idealFor: string[];
  durationDays?: number;
  budgetLevel: string;
}

const travelStyleLabels: Record<string, string> = {
  FAMILY: 'عائلية',
  COUPLES: 'شهر عسل',
  FRIENDS: 'شباب',
  BUSINESS: 'أعمال',
  RELAX: 'استرخاء',
  LUXURY: 'فاخرة',
  ECONOMY: 'اقتصادية',
  ADVENTURE: 'مغامرات',
  SHOPPING: 'تسوق',
  CULTURE: 'ثقافة',
};

const budgetLabels: Record<string, string> = {
  ECONOMY: 'اقتصادي',
  MID: 'متوسط',
  LUXURY: 'فاخر',
  MIXED: 'مختلط',
};

export default function DestinationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchDestination();
  }, [slug]);

  const fetchDestination = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch destination
      const res = await fetch(`/api/discovery/search?q=${encodeURIComponent(slug)}`);
      const data = await res.json();
      
      const dest = data.destinations?.find((d: Destination) => d.slug === slug);
      if (dest) {
        setDestination(dest);
        
        // Fetch templates for this destination
        const templateRes = await fetch(`/api/discovery/search?city=${encodeURIComponent(dest.cityAr)}&serviceType=PACKAGE`);
        const templateData = await templateRes.json();
        setTemplates(templateData.templates || []);
      } else {
        setError('الوجهة غير موجودة');
      }
    } catch {
      setError('حدث خطأ في التحميل');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const res = await fetch('/api/travel-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceType: 'PACKAGE', 
          destinationId: destination?.id,
          cityAr: destination?.cityAr,
          sourceType: 'ENCYCLOPEDIA'
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert('تم إرسال طلبك للمراجعة. هذا ليس حجزًا مؤكدًا.');
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch {
      alert('حدث خطأ. حاول مرة أخرى.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-champagne/30 border-t-champagne rounded-full animate-spin" />
        </div>
        <BottomNav />
      </main>
    );
  }

  if (error || !destination) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="text-center py-20">
          <p className="font-cairo text-xl text-charcoal">{error || 'الوجهة غير موجودة'}</p>
          <Link href="/destinations" className="font-cairo text-champagne mt-4 inline-block">
            العودة للوجهات
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-b from-charcoal to-charcoal/90 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-champagne/70 text-sm mb-4">
            <MapPin className="w-4 h-4" />
            <span className="font-cairo">{destination.countryAr}</span>
          </div>
          <h1 className="font-cairo text-4xl font-bold mb-4">{destination.cityAr}</h1>
          {destination.shortSummaryAr && (
            <p className="font-cairo text-lg text-white/80">{destination.shortSummaryAr}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Travel Styles */}
        <div className="mb-8">
          <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">تناسب</h2>
          <div className="flex flex-wrap gap-2">
            {destination.travelStyles.map((style) => (
              <span
                key={style}
                className="px-4 py-2 bg-champagne/10 rounded-full font-cairo text-sm text-charcoal"
              >
                {travelStyleLabels[style] || style}
              </span>
            ))}
          </div>
        </div>

        {/* Budget Level */}
        <div className="mb-8">
          <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">مستوى التكلفة التقريبي</h2>
          <div className="px-4 py-3 bg-sand rounded-xl inline-block">
            <span className="font-cairo text-charcoal">
              {budgetLabels[destination.budgetLevel] || destination.budgetLevel}
            </span>
          </div>
          <p className="font-cairo text-xs text-muted mt-2">
            مستوى تقريبي. يتم التحديد الدقيق بعد المراجعة.
          </p>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">عن الوجهة</h2>
          <p className="font-cairo text-charcoal/80 leading-relaxed">{destination.descriptionAr}</p>
        </div>

        {/* Best For */}
        {destination.bestForAr?.length > 0 && (
          <div className="mb-8">
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">مميزات</h2>
            <div className="space-y-2">
              {destination.bestForAr.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-champagne" />
                  <span className="font-cairo text-charcoal/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Areas */}
        {destination.popularAreasAr?.length > 0 && (
          <div className="mb-8">
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">المناطق المشهورة</h2>
            <div className="flex flex-wrap gap-2">
              {destination.popularAreasAr.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-white border border-mist rounded-full font-cairo text-sm text-charcoal"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {destination.topActivitiesAr?.length > 0 && (
          <div className="mb-8">
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">أنشطة مقترحة</h2>
            <div className="space-y-2">
              {destination.topActivitiesAr.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <ArrowRight className="w-4 h-4 text-champagne" />
                  <span className="font-cairo text-charcoal/80">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Duration */}
        {destination.suggestedDurations?.length > 0 && (
          <div className="mb-8">
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              المدة المقترحة
            </h2>
            <div className="flex flex-wrap gap-2">
              {destination.suggestedDurations.map((duration, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-sand rounded-xl font-cairo text-sm text-charcoal flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {duration}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Season Notes */}
        {destination.seasonNotesAr && (
          <div className="mb-8 p-4 bg-champagne/10 rounded-xl">
            <h2 className="font-cairo text-lg font-bold text-charcoal mb-2">أفضل وقت للزيارة</h2>
            <p className="font-cairo text-charcoal/80">{destination.seasonNotesAr}</p>
          </div>
        )}

        {/* Airport */}
        {destination.airportInfoAr && (
          <div className="mb-8">
            <h2 className="font-cairo text-lg font-bold text-charcoal mb-2">معلومات المطار</h2>
            <p className="font-cairo text-charcoal/80">{destination.airportInfoAr}</p>
          </div>
        )}

        {/* Family Notes */}
        {destination.familyNotesAr && (
          <div className="mb-8">
            <h2 className="font-cairo text-lg font-bold text-charcoal mb-2">ملاحظات للعوائل</h2>
            <p className="font-cairo text-charcoal/80">{destination.familyNotesAr}</p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-white border border-mist rounded-2xl p-6 mb-8">
          <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">جهز طلب لهذه الوجهة</h2>
          <p className="font-cairo text-sm text-muted mb-4">
            أرسل طلبك للمراجعة. سيتم التواصل معك لإكمال التفاصيل.
          </p>
          <button
            onClick={handleCreateRequest}
            className="w-full py-4 bg-charcoal text-white rounded-xl font-cairo text-lg hover:opacity-90 transition-opacity"
          >
            أرسل طلب المراجعة
          </button>
        </div>

        {/* Trip Templates */}
        {templates.length > 0 && (
          <div className="mb-8">
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">قوالب رحلات</h2>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white border border-mist rounded-xl p-5">
                  <h3 className="font-cairo text-lg font-bold text-charcoal mb-2">{template.titleAr}</h3>
                  <p className="font-cairo text-sm text-muted mb-3">{template.summaryAr}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.idealFor.slice(0, 3).map((ideal) => (
                      <span key={ideal} className="px-2 py-0.5 bg-sand rounded-full font-cairo text-xs text-charcoal">
                        {travelStyleLabels[ideal] || ideal}
                      </span>
                    ))}
                    {template.durationDays && (
                      <span className="px-2 py-0.5 bg-sand rounded-full font-cairo text-xs text-charcoal flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {template.durationDays} أيام
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCreateRequest()}
                    className="w-full py-3 bg-sand text-charcoal rounded-xl font-cairo text-sm hover:bg-champagne/20 transition-colors"
                  >
                    جهز لي طلب
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <p className="font-cairo text-xs text-muted text-center leading-relaxed bg-sand p-4 rounded-xl">
          🔒 نحمي بياناتك. المعلومات المعروضة إرشادية لمساعدتك في اختيار الرحلة. الأسعار والتوفر والتأكيد النهائي يتم بعد مراجعة الطلب أو الربط مع مزود الحجز.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
