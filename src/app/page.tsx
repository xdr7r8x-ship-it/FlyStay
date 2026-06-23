'use client';

import { useState, useEffect } from 'react';
import { 
  Plane, Building2, Package, Gift, MapPin, ChevronLeft, Search, 
  Users, Heart, Sparkles, TreePine, ShoppingBag, Briefcase, Flag,
  CheckCircle, Shield, AlertCircle, ArrowRight
} from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { BRAND_TAGLINE, serviceCards } from '@/lib/brand/flystayBrand';
import Link from 'next/link';

const services = [
  { ...serviceCards[0], icon: Plane },
  { ...serviceCards[1], icon: Building2 },
  { ...serviceCards[2], icon: Package },
  { ...serviceCards[3], icon: Gift },
];

const quickFilters = [
  { id: 'family', label: 'عائلية', icon: Users, param: 'familyFriendly=true' },
  { id: 'honeymoon', label: 'شهر عسل', icon: Heart, param: 'honeymoon=true' },
  { id: 'economy', label: 'اقتصادية', icon: Sparkles, param: 'budgetLevel=ECONOMY' },
  { id: 'luxury', label: 'فاخرة', icon: Diamond, param: 'budgetLevel=LUXURY' },
  { id: 'saudi', label: 'داخل السعودية', icon: Flag, param: 'saudiOnly=true' },
  { id: 'europe', label: 'أوروبا', icon: MapPin, param: 'continent=أوروبا' },
  { id: 'asia', label: 'آسيا', icon: MapPin, param: 'continent=آسيا' },
  { id: 'nature', label: 'طبيعة', icon: TreePine, param: 'travelStyle=NATURE' },
];

const travelStyles = [
  { id: 'family', label: 'عائلات', icon: Users, description: 'رحلات تجمع العائلة' },
  { id: 'honeymoon', label: 'شهر عسل', icon: Heart, description: 'رومانسية لا تُنسى' },
  { id: 'luxury', label: 'رفاهية', icon: Sparkles, description: 'تجارب فاخرة' },
  { id: 'nature', label: 'طبيعة', icon: TreePine, description: 'هروب للطبيعة' },
  { id: 'shopping', label: 'تسوق', icon: ShoppingBag, description: 'وجهات تسوق مميزة' },
  { id: 'business', label: 'عمل', icon: Briefcase, description: 'راحة رجال الأعمال' },
];

const howItWorksSteps = [
  { 
    number: '1', 
    title: 'اكتب طلبك', 
    description: 'حدد وجهتك المفضلة ومتطلبات رحلتك' 
  },
  { 
    number: '2', 
    title: 'نستعرض الخيارات', 
    description: 'نبحث في موسوعتنا ونقارن الوجهات والخطط' 
  },
  { 
    number: '3', 
    title: 'ترسل للمراجعة', 
    description: 'نرسل طلبك للمراجعة المتخصصة' 
  },
  { 
    number: '4', 
    title: 'تصلك الخيارات', 
    description: 'تحصل على أفضل العروض المناسبة لك' 
  },
];

const trustItems = [
  { icon: AlertCircle, title: 'بدون وعود وهمية', description: 'لا نعرض أسعارًا نهائية أو توفرً ا وهمية' },
  { icon: Shield, title: 'بياناتك محمية', description: 'طلباتك محفوظة بأمان في قاعدة بياناتنا' },
  { icon: CheckCircle, title: 'مراجعة بشرية', description: 'كل طلب يتم مراجعته والتواصل معك قبل أي تأكيد' },
];

// Simple Diamond icon component
function Diamond({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.5L18.5 12 12 18.5 5.5 12 12 5.5z" />
    </svg>
  );
}

interface Destination {
  id: string;
  slug: string;
  cityAr: string;
  countryAr: string;
  shortSummaryAr: string | null;
  budgetLevel: string;
  travelStyles: string[];
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const response = await fetch('/api/discovery/search?limit=8');
        const data = await response.json();
        if (data.destinations && data.destinations.length > 0) {
          setFeaturedDestinations(data.destinations.slice(0, 8));
        }
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleQuickFilter = (param: string) => {
    window.location.href = `/search?${param}`;
  };

  return (
    <main className="min-h-screen bg-ivory">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-charcoal via-charcoal/90 to-charcoal/80 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23CDB68B' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[500px] px-4 py-16 text-center">
          {/* Logo Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-champagne/20 border border-champagne/30 rounded-full">
              <span className="font-playfair text-champagne text-sm">Luxury Travel</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="font-cairo text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {BRAND_TAGLINE}
          </h1>

          {/* Tagline */}
          <p className="font-cairo text-champagne text-lg md:text-xl mb-6 max-w-2xl">
            خطط رحلتك بذكاء، قارن الوجهات، احصل على خيارات مناسبة بدون وعود حجز وهمية
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full max-w-xl mb-8">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن وجهة..."
                className="w-full px-6 py-4 pr-12 bg-white text-charcoal rounded-full font-cairo text-lg rtl:text-right placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-champagne shadow-lg"
              />
              <button 
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-champagne text-charcoal rounded-full font-cairo font-semibold hover:bg-champagne/90 transition-colors"
              >
                بحث
              </button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => handleQuickFilter(filter.param)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-cairo text-sm hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-champagne" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/search"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-champagne text-charcoal rounded-full font-cairo font-semibold hover:bg-champagne/90 transition-all hover:scale-105 shadow-lg"
            >
              استكشف الوجهات
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/compare"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full font-cairo font-semibold hover:bg-white/20 transition-all"
            >
              قارن الوجهات
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Gold Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-champagne via-champagne/50 to-transparent" />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 bg-sand/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cairo text-2xl font-bold text-charcoal text-center mb-8">
            كيف يعمل FlyStay؟
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {howItWorksSteps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-champagne text-charcoal rounded-full flex items-center justify-center font-cairo font-bold text-xl">
                  {step.number}
                </div>
                <h3 className="font-cairo font-semibold text-charcoal mb-2">{step.title}</h3>
                <p className="font-cairo text-sm text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
          <p className="font-cairo text-sm text-charcoal/60 text-center mt-6 max-w-2xl mx-auto">
            هذا ليس حجزًا مؤكدًا. الأسعار والتوفر يتم تأكيدها بعد المراجعة أو عبر مزود حجز فعلي.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 px-4">
        <h2 className="font-cairo text-2xl font-bold text-charcoal text-center mb-8">
          خدماتنا
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.key}
                href={service.href}
                className="group bg-white border border-mist rounded-3xl p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-champagne/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-champagne" />
                </div>
                <h3 className="font-cairo font-semibold text-charcoal text-lg mb-1">
                  {service.title}
                </h3>
                <p className="font-cairo text-sm text-secondary">
                  {service.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Destinations from DB */}
      <section className="py-12 px-4 bg-sand/50">
        <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <h2 className="font-cairo text-2xl font-bold text-charcoal">
            وجهات مميزة
          </h2>
          <Link
            href="/destinations"
            className="font-cairo text-champagne hover:text-charcoal transition-colors flex items-center gap-1"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white border border-mist rounded-2xl p-4 animate-pulse">
                <div className="w-full aspect-[4/3] bg-sand rounded-xl mb-4" />
                <div className="h-5 bg-sand rounded w-3/4 mb-2" />
                <div className="h-4 bg-sand rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredDestinations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {featuredDestinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.slug}`}
                className="group bg-white border border-mist rounded-2xl p-4 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-charcoal/10 to-champagne/10 rounded-xl mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-champagne" />
                </div>
                <h3 className="font-cairo font-semibold text-charcoal text-lg">
                  {destination.cityAr}
                </h3>
                <p className="font-cairo text-sm text-secondary mb-2">
                  {destination.countryAr}
                </p>
                {destination.travelStyles && destination.travelStyles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {destination.travelStyles.slice(0, 2).map((style, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-champagne/20 text-charcoal rounded-full">
                        {style}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary">
            <p className="font-cairo">جاري تحميل الوجهات...</p>
          </div>
        )}
      </section>

      {/* Travel Styles */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cairo text-2xl font-bold text-charcoal text-center mb-8">
            اختر أسلوب رحلتك
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {travelStyles.map((style) => {
              const Icon = style.icon;
              return (
                <Link
                  key={style.id}
                  href={`/search?${style.id === 'family' ? 'familyFriendly=true' : style.id === 'honeymoon' ? 'honeymoon=true' : style.id === 'nature' ? 'travelStyle=NATURE' : style.id === 'shopping' ? 'travelStyle=SHOPPING' : style.id === 'business' ? 'travelStyle=BUSINESS' : 'budgetLevel=LUXURY'}`}
                  className="group bg-white border border-mist rounded-2xl p-4 text-center transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-champagne/20 rounded-xl flex items-center justify-center group-hover:bg-champagne/30 transition-colors">
                    <Icon className="w-6 h-6 text-champagne" />
                  </div>
                  <h3 className="font-cairo font-semibold text-charcoal mb-1">{style.label}</h3>
                  <p className="font-cairo text-xs text-secondary">{style.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-12 px-4 bg-charcoal text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cairo text-2xl font-bold text-center mb-8">
            لماذا تختار FlyStay؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-champagne/20 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-champagne" />
                  </div>
                  <h3 className="font-cairo font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="font-cairo text-sm text-white/70">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-cairo text-3xl font-bold text-charcoal mb-4">
            مستعد لرحلتك القادمة؟
          </h2>
          <p className="font-cairo text-secondary mb-8 max-w-xl mx-auto">
            ابدأ التخطيط الآن واحصل على أفضل الخيارات المناسبة لاحتياجاتك
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/search"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-champagne text-charcoal rounded-full font-cairo font-semibold hover:bg-champagne/90 transition-all hover:scale-105 shadow-lg"
            >
              ابدأ طلب رحلة
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/compare"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-charcoal text-white rounded-full font-cairo font-semibold hover:bg-charcoal/90 transition-all"
            >
              قارن بين الوجهات
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <WhatsAppButton />
      <BottomNav />
    </main>
  );
}
