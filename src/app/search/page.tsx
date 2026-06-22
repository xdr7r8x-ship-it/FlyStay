'use client';

import { useState } from 'react';
import { Plane, Building2, Package, Search, MapPin, Calendar, Users, ChevronLeft, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { EmptyState, ErrorState } from '@/components/ui/ErrorEmpty';
import { LoadingSpinner } from '@/components/ui/Loading';

type TabType = 'flights' | 'hotels' | 'packages';
type TripType = 'roundtrip' | 'oneway' | 'multi';

const tabs = [
  { key: 'flights' as TabType, label: 'رحلات', icon: Plane },
  { key: 'hotels' as TabType, label: 'فنادق', icon: Building2 },
  { key: 'packages' as TabType, label: 'باقات', icon: Package },
];

const tripTypes = [
  { key: 'roundtrip' as TripType, label: 'ذهاب وعودة' },
  { key: 'oneway' as TripType, label: 'ذهاب فقط' },
  { key: 'multi' as TripType, label: 'وجهات متعددة' },
];

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<TabType>('flights');
  const [tripType, setTripType] = useState<TripType>('roundtrip');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const handleSearch = async () => {
    if (!from || !to || !departDate) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const endpoint = activeTab === 'flights' ? '/api/flights/search' : 
                       activeTab === 'hotels' ? '/api/hotels/search' : 
                       '/api/packages/search';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: from,
          destination: to,
          departDate,
          returnDate: tripType !== 'oneway' ? returnDate : undefined,
          passengers,
        }),
      });

      if (response.status === 503) {
        setError('الخدمة غير مفعلة حاليًا. موفري الخدمة غير مربوطين.');
      } else if (!response.ok) {
        setError('حدث خطأ أثناء البحث. حاول مرة أخرى.');
      }
      // Results will be shown if successful
    } catch {
      setError('فشل في الاتصال. تأكد من اتصالك بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">ابحث عن رحلتك</h1>
          <p className="font-cairo text-champagne">اعثر على أفضل العروض</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Tabs */}
        <div className="bg-sand rounded-2xl p-2 mb-4 border border-mist">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-cairo font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-charcoal text-white shadow-md'
                      : 'text-charcoal hover:bg-mist'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trip Type */}
        <div className="bg-sand rounded-2xl p-4 mb-4 border border-mist">
          <div className="flex flex-wrap gap-2">
            {tripTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setTripType(type.key)}
                className={`px-4 py-2 rounded-full font-cairo text-sm transition-all ${
                  tripType === type.key
                    ? 'bg-champagne text-charcoal'
                    : 'bg-transparent text-charcoal border border-charcoal/20 hover:border-charcoal'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Fields */}
        <div className="bg-sand rounded-2xl p-6 border border-mist">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* From */}
            <div className="relative">
              <label className="block font-cairo text-sm text-secondary mb-2">
                من
              </label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="مدينة المغادرة"
                  className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
                />
              </div>
            </div>

            {/* To */}
            <div className="relative">
              <label className="block font-cairo text-sm text-secondary mb-2">
                إلى
              </label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="مدينة الوصول"
                  className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div className="relative">
              <label className="block font-cairo text-sm text-secondary mb-2">
                تاريخ الذهاب
              </label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne"
                />
              </div>
            </div>

            {/* Return Date */}
            {tripType !== 'oneway' && (
              <div className="relative">
                <label className="block font-cairo text-sm text-secondary mb-2">
                  تاريخ العودة
                </label>
                <div className="relative">
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne"
                  />
                </div>
              </div>
            )}

            {/* Passengers */}
            <div className="relative">
              <label className="block font-cairo text-sm text-secondary mb-2">
                المسافرون
              </label>
              <div className="relative">
                <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} مسافر{n > 1 ? 'ين' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error font-cairo text-sm">
              {error}
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full py-4 bg-charcoal text-white rounded-xl font-cairo font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                جاري البحث...
              </>
            ) : (
              <>
                <Search size={20} />
                ابحث عن رحلات
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {hasSearched && !isLoading && (
          <div className="mt-6">
            <EmptyState
              icon="search"
              title="لا توجد نتائج"
              description="لم يتم العثور على رحلات مطابقة. حاول تعديل البحث."
              action={{
                label: 'تعديل البحث',
                onClick: () => setHasSearched(false),
              }}
            />
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
