'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, Users, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface Template {
  id: string;
  slug: string;
  titleAr: string;
  cityAr?: string;
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
};

const budgetLabels: Record<string, string> = {
  ECONOMY: 'اقتصادي',
  MID: 'متوسط',
  LUXURY: 'فاخر',
  MIXED: 'مختلط',
};

export default function TripIdeasPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [budgetFilter, setBudgetFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (styleFilter) params.set('travelStyle', styleFilter);
      if (budgetFilter) params.set('budgetLevel', budgetFilter);

      const res = await fetch(`/api/discovery/search?${params}&serviceType=PACKAGE`);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [styleFilter, budgetFilter]);

  const handleCreateRequest = async (template: Template) => {
    try {
      const res = await fetch('/api/travel-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'PACKAGE',
          templateId: template.id,
          sourceType: 'TEMPLATE',
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
              <Sparkles className="w-7 h-7 text-champagne" />
            </div>
            <div>
              <h1 className="font-cairo text-3xl font-bold">أفكار رحلات</h1>
              <p className="font-cairo text-champagne/80 text-sm">اكتشف رحلات مصممة لك</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setStyleFilter(null)}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${!styleFilter ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}
          >
            الكل
          </button>
          {Object.entries(travelStyleLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStyleFilter(key)}
              className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${styleFilter === key ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}
            >
              {label}
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
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-champagne/30 mx-auto mb-4" />
            <p className="font-cairo text-muted">لا توجد أفكار رحلات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl border border-mist p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-cairo text-lg font-bold text-charcoal">{template.titleAr}</h3>
                    {template.cityAr && (
                      <p className="font-cairo text-sm text-champagne flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {template.cityAr}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-sand rounded-full font-cairo text-xs text-charcoal">
                    {budgetLabels[template.budgetLevel]}
                  </span>
                </div>
                <p className="font-cairo text-sm text-muted mb-4">{template.summaryAr}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.idealFor.map((ideal) => (
                    <span key={ideal} className="px-2 py-0.5 bg-champagne/10 rounded-full font-cairo text-xs text-charcoal/70">
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
                  onClick={() => handleCreateRequest(template)}
                  className="w-full py-3 bg-charcoal text-white rounded-xl font-cairo text-sm hover:opacity-90"
                >
                  جهز لي طلب
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <p className="font-cairo text-xs text-muted text-center">
          🔒 نحمي بياناتك. المعلومات المعروضة إرشادية. الأسعار والتوفر بعد المراجعة.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
