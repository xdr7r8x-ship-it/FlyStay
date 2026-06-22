'use client';

import { useState, useEffect } from 'react';
import { Gift, MapPin, Calendar, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface Template {
  id: string;
  slug: string;
  titleAr: string;
  cityAr?: string;
  summaryAr: string;
  includesAr: string[];
  idealFor: string[];
  durationDays?: number;
  budgetLevel: string;
  disclaimersAr: string[];
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

export default function PackagesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/discovery/search?serviceType=PACKAGE');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <Gift className="w-7 h-7 text-champagne" />
            </div>
            <div>
              <h1 className="font-cairo text-3xl font-bold">الباقات</h1>
              <p className="font-cairo text-champagne/80 text-sm">قوالب باقات جاهزة بدون سعر نهائي</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-champagne/10 border border-champagne/30 rounded-xl p-4">
          <p className="font-cairo text-sm text-charcoal text-center">
            الباقات المعروضة قوالب تقريبية. المستوى التقريبي للتكلفة: 
            <span className="font-bold">اقتصادي / متوسط / فاخر</span>. 
            يتم التحديد الدقيق بعد مراجعة الطلب.
          </p>
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
            <Gift className="w-12 h-12 text-champagne/30 mx-auto mb-4" />
            <p className="font-cairo text-muted">لا توجد باقات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl border border-mist overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-cairo text-xl font-bold text-charcoal">{pkg.titleAr}</h3>
                      {pkg.cityAr && (
                        <p className="font-cairo text-sm text-champagne flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {pkg.cityAr}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-sand rounded-full font-cairo text-xs text-charcoal">
                      {budgetLabels[pkg.budgetLevel]}
                    </span>
                  </div>
                  
                  <p className="font-cairo text-sm text-muted mb-4">{pkg.summaryAr}</p>

                  {/* Includes */}
                  {pkg.includesAr?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-cairo text-sm font-bold text-charcoal mb-2">تشمل (كمثال)</h4>
                      <div className="space-y-1">
                        {pkg.includesAr.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-champagne rounded-full" />
                            <span className="font-cairo text-sm text-charcoal/70">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.idealFor.map((ideal) => (
                      <span key={ideal} className="px-2 py-0.5 bg-champagne/10 rounded-full font-cairo text-xs text-charcoal/70">
                        {travelStyleLabels[ideal] || ideal}
                      </span>
                    ))}
                    {pkg.durationDays && (
                      <span className="px-2 py-0.5 bg-sand rounded-full font-cairo text-xs text-charcoal flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {pkg.durationDays} أيام
                      </span>
                    )}
                  </div>

                  {/* Disclaimer */}
                  {pkg.disclaimersAr?.length > 0 && (
                    <div className="bg-sand/50 rounded-lg p-3 mb-4">
                      {pkg.disclaimersAr.map((disc, idx) => (
                        <p key={idx} className="font-cairo text-xs text-muted">{disc}</p>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleCreateRequest(pkg)}
                    className="w-full py-3 bg-charcoal text-white rounded-xl font-cairo text-sm hover:opacity-90"
                  >
                    جهز لي طلب
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
          🔒 نحمي بياناتك. الباقات المعروضة قوالب تقريبية. الأسعار والتوفر والتأكيد النهائي بعد المراجعة.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
