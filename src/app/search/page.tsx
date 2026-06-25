'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Link from 'next/link';

interface Destination {
  id: string;
  slug: string;
  cityAr: string;
  countryAr: string;
  shortSummaryAr: string | null;
  budgetLevel: string;
  travelStyles: string[];
}

interface TripTemplate {
  id: string;
  slug: string;
  titleAr: string;
  serviceType: string;
  cityAr: string | null;
  summaryAr: string;
  budgetLevel: string;
  durationDays: number | null;
  idealFor: string[];
}

interface SearchFilters {
  q: string;
  budgetLevel: string;
  serviceType: string;
  familyFriendly: boolean;
  honeymoon: boolean;
  saudiOnly: boolean;
}

const budgetLevels = [
  { value: '', label: 'الكل' },
  { value: 'ECONOMY', label: 'اقتصادية' },
  { value: 'MID', label: 'متوسطة' },
  { value: 'LUXURY', label: 'فاخرة' },
];

const serviceTypes = [
  { value: '', label: 'الكل' },
  { value: 'FLIGHT', label: 'رحلات طيران' },
  { value: 'HOTEL', label: 'فنادق' },
  { value: 'PACKAGE', label: 'باقات' },
  { value: 'CHALET', label: 'شاليهات' },
  { value: 'MIXED', label: 'مختلطة' },
];

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<'destinations' | 'templates'>('destinations');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [templates, setTemplates] = useState<TripTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    budgetLevel: '',
    serviceType: '',
    familyFriendly: false,
    honeymoon: false,
    saudiOnly: false,
  });

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.budgetLevel) params.set('budgetLevel', filters.budgetLevel);
      if (filters.serviceType) params.set('serviceType', filters.serviceType);
      if (filters.familyFriendly) params.set('familyFriendly', 'true');
      if (filters.honeymoon) params.set('honeymoon', 'true');
      if (filters.saudiOnly) params.set('saudiOnly', 'true');
      const response = await fetch('/api/discovery/search?' + params.toString());
      const data = await response.json();
      if (data.destinations) setDestinations(data.destinations);
      if (data.tripTemplates) setTemplates(data.tripTemplates);
    } catch {
      // Silent failure - results will be empty
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { handleSearch(); }, []);

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ q: '', budgetLevel: '', serviceType: '', familyFriendly: false, honeymoon: false, saudiOnly: false });
  };

  const activeFiltersCount = [filters.budgetLevel, filters.serviceType, filters.familyFriendly, filters.honeymoon, filters.saudiOnly].filter(Boolean).length;

  const getBudgetLabel = (level: string) => {
    if (level === 'LUXURY') return 'فاخرة';
    if (level === 'ECONOMY') return 'اقتصادية';
    return 'متوسطة';
  };

  const getBudgetClass = (level: string) => {
    if (level === 'LUXURY') return 'bg-champagne/20 text-champagne';
    if (level === 'ECONOMY') return 'bg-green-100 text-green-700';
    return 'bg-sand';
  };

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">استكشف الوجهات</h1>
          <p className="font-cairo text-champagne">ابحث في موسوعتنا الكاملة</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-sand rounded-2xl p-4 border border-mist shadow-lg">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/50" />
              <input 
                type="text" 
                value={filters.q} 
                onChange={(e) => handleFilterChange('q', e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                placeholder="ابحث عن وجهة..." 
                className="w-full pr-12 pl-4 py-3 bg-white border border-mist rounded-xl font-cairo text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-champagne" 
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`relative px-4 py-3 rounded-xl border transition-all ${showFilters || activeFiltersCount > 0 ? 'bg-champagne text-charcoal border-champagne' : 'bg-white text-charcoal border-mist'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFiltersCount > 0 && <span className="absolute -top-1 -left-1 w-5 h-5 bg-charcoal text-white text-xs rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
            </button>
            <button 
              onClick={handleSearch} 
              disabled={isLoading} 
              className="px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-semibold hover:opacity-90 transition-all disabled:opacity-60"
            >
              {isLoading ? '...' : 'بحث'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button 
              onClick={() => handleFilterChange('saudiOnly', !filters.saudiOnly)} 
              className={`px-3 py-1.5 rounded-full text-sm font-cairo transition-all ${filters.saudiOnly ? 'bg-champagne text-charcoal' : 'bg-white text-charcoal/70 border border-mist'}`}
            >
              داخل السعودية
            </button>
            <button 
              onClick={() => handleFilterChange('familyFriendly', !filters.familyFriendly)} 
              className={`px-3 py-1.5 rounded-full text-sm font-cairo transition-all ${filters.familyFriendly ? 'bg-champagne text-charcoal' : 'bg-white text-charcoal/70 border border-mist'}`}
            >
              عائلية
            </button>
            <button 
              onClick={() => handleFilterChange('honeymoon', !filters.honeymoon)} 
              className={`px-3 py-1.5 rounded-full text-sm font-cairo transition-all ${filters.honeymoon ? 'bg-champagne text-charcoal' : 'bg-white text-charcoal/70 border border-mist'}`}
            >
              شهر عسل
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="bg-sand rounded-2xl p-6 border border-mist mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-cairo text-sm text-secondary mb-2">الميزانية</label>
                <select 
                  value={filters.budgetLevel} 
                  onChange={(e) => handleFilterChange('budgetLevel', e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-mist rounded-xl font-cairo text-charcoal"
                >
                  {budgetLevels.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-cairo text-sm text-secondary mb-2">نوع الرحلة</label>
                <select 
                  value={filters.serviceType} 
                  onChange={(e) => handleFilterChange('serviceType', e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-mist rounded-xl font-cairo text-charcoal"
                >
                  {serviceTypes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            {activeFiltersCount > 0 && <button onClick={clearFilters} className="mt-4 text-sm text-champagne font-cairo">مسح الفلاتر</button>}
          </div>
        )}
      </div>
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('destinations')} 
            className={`px-4 py-2 rounded-xl font-cairo font-semibold transition-all ${activeTab === 'destinations' ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}
          >
            وجهات ({destinations.length})
          </button>
          <button 
            onClick={() => setActiveTab('templates')} 
            className={`px-4 py-2 rounded-xl font-cairo font-semibold transition-all ${activeTab === 'templates' ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'}`}
          >
            افكار الرحلات ({templates.length})
          </button>
        </div>
        {activeTab === 'destinations' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-4 border border-mist animate-pulse"><div className="h-32 bg-sand rounded-xl mb-4" /></div>)}
              </div>
            ) : destinations.length > 0 ? destinations.map(dest => (
              <div key={dest.id} className="bg-white rounded-2xl p-4 border border-mist hover:shadow-lg transition-all">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-charcoal/10 to-champagne/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-8 h-8 text-champagne" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-cairo font-bold text-lg text-charcoal">{dest.cityAr}</h3>
                        <p className="font-cairo text-sm text-secondary">{dest.countryAr}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-cairo ${getBudgetClass(dest.budgetLevel)}`}>
                        {getBudgetLabel(dest.budgetLevel)}
                      </span>
                    </div>
                    <p className="font-cairo text-sm text-secondary mt-2 line-clamp-2">{dest.shortSummaryAr || 'وجهة سياحية مميزة'}</p>
                    {dest.travelStyles && dest.travelStyles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dest.travelStyles.slice(0, 3).map((style, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-sand rounded-full">{style}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={'/destinations/' + dest.slug} className="flex-1 py-2 bg-sand text-charcoal rounded-xl font-cairo text-sm text-center">عرض التفاصيل</Link>
                  <button className="flex-1 py-2 bg-champagne text-charcoal rounded-xl font-cairo text-sm font-semibold">ارسل طلب للمراجعة</button>
                </div>
              </div>
            )) : hasSearched && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
                <p className="font-cairo text-secondary">لم يتم العثور على وجهات</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-4 border border-mist animate-pulse"><div className="h-5 bg-sand rounded w-3/4" /></div>)}
              </div>
            ) : templates.length > 0 ? templates.map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-4 border border-mist hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-cairo font-bold text-lg text-charcoal">{t.titleAr}</h3>
                    {t.cityAr && <p className="font-cairo text-sm text-secondary flex items-center gap-1"><MapPin className="w-3 h-3" />{t.cityAr}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-cairo ${getBudgetClass(t.budgetLevel)}`}>
                    {getBudgetLabel(t.budgetLevel)}
                  </span>
                </div>
                <p className="font-cairo text-sm text-secondary mt-2 line-clamp-2">{t.summaryAr}</p>
                {t.idealFor && t.idealFor.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.idealFor.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-sand rounded-full">{item}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Link href={'/trip-ideas/' + t.slug} className="flex-1 py-2 bg-sand text-charcoal rounded-xl font-cairo text-sm text-center">عرض التفاصيل</Link>
                  <button className="flex-1 py-2 bg-champagne text-charcoal rounded-xl font-cairo text-sm font-semibold">ارسل طلب للمراجعة</button>
                </div>
              </div>
            )) : hasSearched && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
                <p className="font-cairo text-secondary">لم يتم العثور على افكار</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-8 p-4 bg-sand/50 rounded-2xl border border-mist">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
            <p className="font-cairo text-sm text-charcoal">
              <strong>ملاحظة:</strong> الاسعار والتوفر المعروضة ارشادية فقط. يتم تأكيد التفاصيل بعد المراجعة او التواصل مع مزود الحجز.
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
