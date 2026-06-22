'use client';

import { useState, useEffect } from 'react';
import { Home, MapPin, Users, Waves, Coffee, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface StayGuide {
  id: string;
  type: string;
  cityAr: string;
  titleAr: string;
  descriptionAr?: string;
  capacityHintAr?: string;
  featuresAr: string[];
  idealFor: string[];
  hasPoolHint?: boolean;
  hasOutdoorSeatingHint?: boolean;
  budgetLevel: string;
}

const typeLabels: Record<string, string> = {
  CHALET: 'شاليه',
  RESTHOUSE: 'استراحة',
};

const idealLabels: Record<string, string> = {
  FAMILY: 'عائلية',
  COUPLES: 'للس lovers',
  FRIENDS: 'شباب',
  ADVENTURE: 'مغامرات',
  RELAX: 'استرخاء',
};

const budgetLabels: Record<string, string> = {
  ECONOMY: 'اقتصادي',
  MID: 'متوسط',
  LUXURY: 'فاخر',
};

export default function ChaletsPage() {
  const [guides, setGuides] = useState<StayGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/discovery/search');
      const data = await res.json();
      setGuides(data.stayGuides || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = guides.filter((g) => {
    if (typeFilter && g.type !== typeFilter) return false;
    if (cityFilter && g.cityAr !== cityFilter) return false;
    return true;
  });

  const cities = Array.from(new Set(guides.map((g) => g.cityAr)));

  const handleCreateRequest = async (guide: StayGuide) => {
    try {
      const res = await fetch('/api/travel-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: guide.type === 'CHALET' ? 'CHALET' : 'RESTHOUSE',
          cityAr: guide.cityAr,
          sourceType: 'ENCYCLOPEDIA',
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

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Hero */}
      <div className="bg-charcoal text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-champagne/20 rounded-full flex items-center justify-center">
              <Home className="w-7 h-7 text-champagne" />
            </div>
            <div>
              <h1 className="font-cairo text-3xl font-bold">الشاليهات والإستراحات</h1>
              <p className="font-cairo text-champagne/80 text-sm">دليل تصنيفات وليس توفرًا حقيقيًا</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-champagne/10 border border-champagne/30 rounded-xl p-4">
          <p className="font-cairo text-sm text-charcoal text-center">
            هذا دليل تصنيفات وإرشادات. لا يعرض توفرًا حقيقيًا. 
            أرسل طلب المراجعة ونحن نتواصل معك.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${!typeFilter ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}
          >
            الكل
          </button>
          <button
            onClick={() => setTypeFilter('CHALET')}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${typeFilter === 'CHALET' ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}
          >
            شاليهات
          </button>
          <button
            onClick={() => setTypeFilter('RESTHOUSE')}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${typeFilter === 'RESTHOUSE' ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}
          >
            استراحات
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setCityFilter(null)}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${!cityFilter ? 'bg-sand text-charcoal' : 'bg-white text-charcoal border border-mist'}`}
          >
            جميع المدن
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${cityFilter === city ? 'bg-sand text-charcoal' : 'bg-white text-charcoal border border-mist'}`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-champagne/30 border-t-champagne rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-champagne/30 mx-auto mb-4" />
            <p className="font-cairo text-muted">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGuides.map((guide) => (
              <div key={guide.id} className="bg-white rounded-2xl border border-mist overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="px-2 py-0.5 bg-champagne/20 rounded-full font-cairo text-xs text-champagne">
                        {typeLabels[guide.type] || guide.type}
                      </span>
                      <h3 className="font-cairo text-lg font-bold text-charcoal mt-1">{guide.titleAr}</h3>
                      <p className="font-cairo text-sm text-champagne flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {guide.cityAr}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-sand rounded-full font-cairo text-xs text-charcoal">
                      {budgetLabels[guide.budgetLevel]}
                    </span>
                  </div>

                  {guide.descriptionAr && (
                    <p className="font-cairo text-sm text-muted mb-4">{guide.descriptionAr}</p>
                  )}

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.featuresAr.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 bg-sand rounded-full font-cairo text-xs text-charcoal/70 flex items-center gap-1">
                        {feature.includes('مسبح') && <Waves className="w-3 h-3" />}
                        {feature.includes('جلسة') && <Coffee className="w-3 h-3" />}
                        {feature}
                      </span>
                    ))}
                    {guide.hasPoolHint && (
                      <span className="px-2 py-1 bg-champagne/10 rounded-full font-cairo text-xs text-champagne flex items-center gap-1">
                        <Waves className="w-3 h-3" />
                        مسبح
                      </span>
                    )}
                  </div>

                  {/* Ideal For */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.idealFor.map((ideal) => (
                      <span key={ideal} className="px-2 py-0.5 bg-champagne/10 rounded-full font-cairo text-xs text-charcoal/70">
                        {idealLabels[ideal] || ideal}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCreateRequest(guide)}
                    className="w-full py-3 bg-charcoal text-white rounded-xl font-cairo text-sm hover:opacity-90"
                  >
                    أرسل طلب المراجعة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <p className="font-cairo text-xs text-muted text-center">
          🔒 نحمي بياناتك. الدليل تصنيفات وإرشادات. الأسعار والتوفر والتأكيد بعد المراجعة.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
