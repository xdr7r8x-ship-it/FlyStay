'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Compass, MapPin, Calendar, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
interface Destination {
  id: string; slug: string; cityAr: string; countryAr: string;
  shortSummaryAr?: string; travelStyles: string[]; budgetLevel: string;
}
interface Template {
  id: string; titleAr: string; cityAr?: string; summaryAr: string;
  idealFor: string[]; durationDays?: number; budgetLevel: string; serviceType: string;
}
interface StayGuide {
  id: string; type: string; cityAr: string; titleAr: string;
  descriptionAr?: string; featuresAr: string[]; budgetLevel: string;
}
type TabType = 'destinations' | 'ideas' | 'stays';
const travelStyleLabels: Record<string, string> = {
  FAMILY: 'عائلية', COUPLES: 'شهر عسل', FRIENDS: 'شباب', BUSINESS: 'أعمال',
  RELAX: 'استرخاء', LUXURY: 'فاخرة', ECONOMY: 'اقتصادية', ADVENTURE: 'مغامرات',
  SHOPPING: 'تسوق', CULTURE: 'ثقافة',
};
const budgetLabels: Record<string, string> = {
  ECONOMY: 'اقتصادي', MID: 'متوسط', LUXURY: 'فاخر', MIXED: 'مختلط',
};
export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabType>('destinations');
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stayGuides, setStayGuides] = useState<StayGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [saudiOnly, setSaudiOnly] = useState(false);
  useEffect(() => { fetchDiscovery(); }, []);
  const fetchDiscovery = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedStyle) params.set('travelStyle', selectedStyle);
      if (selectedBudget) params.set('budgetLevel', selectedBudget);
      if (saudiOnly) params.set('country', 'المملكة العربية السعودية');
      const res = await fetch(`/api/discovery/search?${params}`);
      const data = await res.json();
      if (data.destinations) setDestinations(data.destinations);
      if (data.templates) setTemplates(data.templates);
      if (data.stayGuides) setStayGuides(data.stayGuides);
    } catch (error) { console.error('Discovery error:', error); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const timer = setTimeout(fetchDiscovery, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStyle, selectedBudget, saudiOnly]);
  const handleCreateRequest = async (type: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/travel-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: type, ...data }),
      });
      const result = await res.json();
      if (result.success) alert('تم إرسال طلبك للمراجعة. هذا ليس حجزًا مؤكدًا.');
      else if (res.status === 401) window.location.href = '/login';
    } catch { alert('حدث خطأ. حاول مرة أخرى.'); }
  };
  const clearFilters = () => {
    setSelectedStyle(null); setSelectedBudget(null); setSaudiOnly(false); setSearchQuery('');
  };
  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />
      <div className="bg-gradient-to-b from-charcoal to-charcoal/95 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-champagne/20 rounded-full flex items-center justify-center">
              <Compass className="w-7 h-7 text-champagne" />
            </div>
            <div>
              <h1 className="font-cairo text-3xl font-bold">استكشف وجهتك</h1>
              <p className="font-cairo text-champagne/80 text-sm">موسوعة السفر الذكية</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن وجهة، فكرة رحلة، أو نوع إقامة..."
              className="w-full pr-12 pl-4 py-4 bg-white/10 border border-white/20 rounded-2xl font-cairo text-white placeholder:text-white/50 focus:outline-none focus:border-champagne" />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('destinations')}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${activeTab === 'destinations' ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}>وجهات</button>
          <button onClick={() => setActiveTab('ideas')}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${activeTab === 'ideas' ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}>أفكار رحلات</button>
          <button onClick={() => setActiveTab('stays')}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap ${activeTab === 'stays' ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}>شاليهات وإستراحات</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-sand rounded-full cursor-pointer">
            <input type="checkbox" checked={saudiOnly} onChange={(e) => setSaudiOnly(e.target.checked)} className="accent-champagne" />
            <span className="font-cairo text-xs text-charcoal">داخل السعودية</span>
          </label>
          <select value={selectedStyle || ''} onChange={(e) => setSelectedStyle(e.target.value || null)}
            className="px-3 py-1.5 bg-sand rounded-full font-cairo text-xs text-charcoal focus:outline-none">
            <option value="">نوع الرحلة</option>
            {Object.entries(travelStyleLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
          </select>
          <select value={selectedBudget || ''} onChange={(e) => setSelectedBudget(e.target.value || null)}
            className="px-3 py-1.5 bg-sand rounded-full font-cairo text-xs text-charcoal focus:outline-none">
            <option value="">المستوى</option>
            {Object.entries(budgetLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
          </select>
          {(selectedStyle || selectedBudget || saudiOnly) && (
            <button onClick={clearFilters} className="px-3 py-1.5 text-champagne font-cairo text-xs hover:underline">مسح الفلاتر</button>)}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-champagne/30 border-t-champagne rounded-full animate-spin mx-auto mb-4" />
            <p className="font-cairo text-muted">جارٍ التحميل...</p>
          </div>
        ) : (
          <>
            {activeTab === 'destinations' && (
              <div className="space-y-4">
                {destinations.length === 0 ? (
                  <div className="text-center py-12"><MapPin className="w-12 h-12 text-champagne/30 mx-auto mb-4" /><p className="font-cairo text-muted">لا توجد وجهات</p></div>
                ) : destinations.map((dest) => (
                  <Link key={dest.id} href={`/destinations/${dest.slug}`} className="block bg-white rounded-2xl border border-mist overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-champagne" /><h3 className="font-cairo text-xl font-bold text-charcoal">{dest.cityAr}</h3></div>
                        <span className="px-2 py-1 bg-sand rounded-full font-cairo text-xs text-charcoal">{budgetLabels[dest.budgetLevel]}</span>
                      </div>
                      <p className="font-cairo text-sm text-muted mb-3">{dest.countryAr}</p>
                      {dest.shortSummaryAr && <p className="font-cairo text-sm text-charcoal/80 mb-3">{dest.shortSummaryAr}</p>}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {dest.travelStyles.slice(0, 3).map((style) => (<span key={style} className="px-2 py-0.5 bg-champagne/10 rounded-full font-cairo text-xs text-charcoal/70">{travelStyleLabels[style] || style}</span>))}
                      </div>
                      <div className="flex items-center text-champagne font-cairo text-sm"><span>استكشف الوجهة</span><ChevronRight className="w-4 h-4" /></div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {activeTab === 'ideas' && (
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <div className="text-center py-12"><Sparkles className="w-12 h-12 text-champagne/30 mx-auto mb-4" /><p className="font-cairo text-muted">لا توجد أفكار</p></div>
                ) : templates.map((template) => (
                  <div key={template.id} className="bg-white rounded-2xl border border-mist p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div><h3 className="font-cairo text-lg font-bold text-charcoal">{template.titleAr}</h3>
                        {template.cityAr && <p className="font-cairo text-sm text-champagne flex items-center gap-1"><MapPin className="w-3 h-3" />{template.cityAr}</p>}</div>
                      <span className="px-2 py-1 bg-sand rounded-full font-cairo text-xs text-charcoal">{budgetLabels[template.budgetLevel]}</span>
                    </div>
                    <p className="font-cairo text-sm text-muted mb-3">{template.summaryAr}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.idealFor.slice(0, 3).map((ideal) => (<span key={ideal} className="px-2 py-0.5 bg-champagne/10 rounded-full font-cairo text-xs text-charcoal/70">{travelStyleLabels[ideal] || ideal}</span>))}
                      {template.durationDays && <span className="px-2 py-0.5 bg-sand rounded-full font-cairo text-xs text-charcoal flex items-center gap-1"><Calendar className="w-3 h-3" />{template.durationDays} أيام</span>}
                    </div>
                    <button onClick={() => handleCreateRequest(template.serviceType, { templateId: template.id })}
                      className="w-full py-3 bg-charcoal text-white rounded-xl font-cairo text-sm hover:opacity-90">جهز لي طلب</button>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'stays' && (
              <div className="space-y-4">
                {stayGuides.length === 0 ? (
                  <div className="text-center py-12"><Compass className="w-12 h-12 text-champagne/30 mx-auto mb-4" /><p className="font-cairo text-muted">لا توجد شاليهات</p></div>
                ) : stayGuides.map((guide) => (
                  <div key={guide.id} className="bg-white rounded-2xl border border-mist p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div><span className="px-2 py-0.5 bg-champagne/20 rounded-full font-cairo text-xs text-champagne">{guide.type === 'CHALET' ? 'شاليه' : 'استراحة'}</span>
                        <h3 className="font-cairo text-lg font-bold text-charcoal mt-1">{guide.titleAr}</h3></div>
                      <span className="px-2 py-1 bg-sand rounded-full font-cairo text-xs text-charcoal">{budgetLabels[guide.budgetLevel]}</span>
                    </div>
                    {guide.descriptionAr && <p className="font-cairo text-sm text-muted mb-3">{guide.descriptionAr}</p>}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {guide.featuresAr.slice(0, 4).map((feature, idx) => (<span key={idx} className="px-2 py-0.5 bg-sand rounded-full font-cairo text-xs text-charcoal/70">{feature}</span>))}
                    </div>
                    <button onClick={() => handleCreateRequest(guide.type === 'CHALET' ? 'CHALET' : 'RESTHOUSE', { cityAr: guide.cityAr })}
                      className="w-full py-3 bg-charcoal text-white rounded-xl font-cairo text-sm hover:opacity-90">أرسل طلب المراجعة</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <p className="font-cairo text-xs text-muted text-center leading-relaxed">
          نحمي بياناتك. المعلومات المعروضة إرشادية. الأسعار والتوفر والتأكيد النهائي يتم بعد مراجعة الطلب.
        </p>
      </div>
      <BottomNav />
    </main>
  );
}
