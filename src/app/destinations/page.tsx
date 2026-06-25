'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Globe, ChevronRight, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface Destination {
  id: string;
  slug: string;
  cityAr: string;
  countryAr: string;
  shortSummaryAr?: string;
  travelStyles: string[];
  budgetLevel: string;
  heroImageUrl?: string;
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

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [styleFilter, setStyleFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (countryFilter) params.set('country', countryFilter);
      if (styleFilter) params.set('travelStyle', styleFilter);

      const res = await fetch(`/api/discovery/search?${params}`);
      const data = await res.json();
      setDestinations(data.destinations || []);
    } catch {
      // Silent failure - destinations will be empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchDestinations, 300);
    return () => clearTimeout(timer);
  }, [search, countryFilter, styleFilter]);

  const countries = Array.from(new Set(destinations.map((d) => d.countryAr)));

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Hero */}
      <div className="bg-charcoal text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-champagne/20 rounded-full flex items-center justify-center">
              <Globe className="w-7 h-7 text-champagne" />
            </div>
            <div>
              <h1 className="font-cairo text-3xl font-bold">الوجهات</h1>
              <p className="font-cairo text-champagne/80 text-sm">اكتشف أجمل الوجهات</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن وجهة..."
              className="w-full pr-12 pl-4 py-4 bg-white/10 border border-white/20 rounded-2xl font-cairo text-white placeholder:text-white/50 focus:outline-none focus:border-champagne"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setCountryFilter(null)}
            className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap transition-colors ${
              !countryFilter ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'
            }`}
          >
            الكل
          </button>
          {countries.map(c => (
            <button
              key={c}
              onClick={() => setCountryFilter(c)}
              className={`px-4 py-2 rounded-full font-cairo text-sm whitespace-nowrap transition-colors ${
                countryFilter === c ? 'bg-charcoal text-white' : 'bg-sand text-charcoal'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-champagne/30 border-t-champagne rounded-full animate-spin mx-auto mb-4" />
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-champagne/30 mx-auto mb-4" />
            <p className="font-cairo text-muted">لا توجد وجهات</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations/${dest.slug}`}
                className="bg-white rounded-2xl border border-mist overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-cairo text-xl font-bold text-charcoal">{dest.cityAr}</h3>
                      <p className="font-cairo text-sm text-champagne flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {dest.countryAr}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-sand rounded-full font-cairo text-xs text-charcoal">
                      {budgetLabels[dest.budgetLevel]}
                    </span>
                  </div>
                  {dest.shortSummaryAr && (
                    <p className="font-cairo text-sm text-muted mb-3 line-clamp-2">{dest.shortSummaryAr}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {dest.travelStyles.slice(0, 3).map((style) => (
                      <span
                        key={style}
                        className="px-2 py-0.5 bg-champagne/10 rounded-full font-cairo text-xs text-charcoal/70"
                      >
                        {travelStyleLabels[style] || style}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-champagne font-cairo text-sm">
                    <span>استكشف</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <p className="font-cairo text-xs text-muted text-center leading-relaxed">
          🔒 نحمي بياناتك. المعلومات المعروضة إرشادية.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
