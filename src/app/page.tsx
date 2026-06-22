'use client';

import { useState } from 'react';
import { Plane, Building2, Package, Gift, MapPin, ChevronLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { LoadingOverlay } from '@/components/ui/Loading';
import { BRAND_TAGLINE, serviceCards } from '@/lib/brand/flystayBrand';
import Link from 'next/link';

const services = [
  { ...serviceCards[0], icon: Plane },
  { ...serviceCards[1], icon: Building2 },
  { ...serviceCards[2], icon: Package },
  { ...serviceCards[3], icon: Gift },
];

const featuredDestinations = [
  { id: 1, name: 'دبي', country: 'الإمارات', image: 'dubai' },
  { id: 2, name: 'جدة', country: 'السعودية', image: 'jeddah' },
  { id: 3, name: 'الرياض', country: 'السعودية', image: 'riyadh' },
  { id: 4, name: 'المنامة', country: 'البحرين', image: 'manama' },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <LoadingOverlay />;
  }

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

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[450px] px-4 py-16 text-center">
          {/* Logo Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-champagne/20 border border-champagne/30 rounded-full">
              <span className="font-playfair text-champagne text-sm">Luxury Travel</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="font-cairo text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {BRAND_TAGLINE}
          </h1>

          {/* English Subtitle */}
          <p className="font-playfair text-champagne text-lg md:text-xl mb-10">
            Your Next Journey Begins Here
          </p>

          {/* CTA Button */}
          <Link
            href="/search"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-champagne text-charcoal rounded-full font-cairo font-semibold text-lg hover:bg-champagne/90 transition-all hover:scale-105 shadow-lg"
          >
            استكشف الوجهات
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </Link>

          {/* Gold Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-champagne via-champagne/50 to-transparent" />
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
                className="group bg-sand border border-mist rounded-3xl p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-champagne rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-charcoal" />
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

      {/* Featured Destinations */}
      <section className="py-12 px-4 bg-sand/50">
        <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <h2 className="font-cairo text-2xl font-bold text-charcoal">
            وجهات مميزة
          </h2>
          <Link
            href="/search"
            className="font-cairo text-champagne hover:text-charcoal transition-colors flex items-center gap-1"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {featuredDestinations.map((destination) => (
            <Link
              key={destination.id}
              href={`/search?destination=${destination.name}`}
              className="group relative bg-sand border border-mist rounded-2xl p-4 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {/* Placeholder Image */}
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-charcoal/20 to-charcoal/10 rounded-xl mb-4 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-champagne" />
              </div>
              <h3 className="font-cairo font-semibold text-charcoal text-lg">
                {destination.name}
              </h3>
              <p className="font-cairo text-sm text-secondary">
                {destination.country}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Agent CTA */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-charcoal to-charcoal/90 rounded-3xl p-8 text-center text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 border border-champagne/20 rounded-full" />
            <div className="absolute bottom-4 left-4 w-32 h-32 border border-champagne/10 rounded-full" />

            <div className="relative z-10">
              <h2 className="font-cairo text-2xl md:text-3xl font-bold mb-4">
                هل تحتاج مساعدة؟
              </h2>
              <p className="font-cairo text-champagne mb-6 max-w-md mx-auto">
                تحدث مع وكيلنا الذكي واحصل على توصيات مخصصة لرحلتك
              </p>
              <Link
                href="/ai-agent"
                className="inline-flex items-center gap-2 px-6 py-3 bg-champagne text-charcoal rounded-xl font-cairo font-semibold hover:bg-champagne/90 transition-colors"
              >
                تحدث مع الوكيل الذكي
              </Link>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppButton />
      <BottomNav />
    </main>
  );
}
