'use client';

import { Heart, MapPin, Star, Plane } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/ErrorEmpty';

const mockFavorites = [
  {
    id: 1,
    type: 'flight',
    title: 'طيران إلى دبي',
    subtitle: 'الرياض - دبي',
    price: '1,250',
    currency: 'ر.س',
    rating: 4.8,
    image: 'dubai',
  },
  {
    id: 2,
    type: 'hotel',
    title: 'فندق أتلانتس',
    subtitle: 'دبي - نخلة جميرا',
    price: '2,400',
    currency: 'ر.س',
    rating: 4.9,
    image: 'atlantis',
  },
];

export default function FavoritesPage() {
  const favorites = mockFavorites;

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl font-bold mb-2">المفضلة</h1>
          <p className="font-cairo text-champagne">رحلاتك المحفوظة</p>
        </div>
      </div>

      {/* Favorites List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <EmptyState
            icon="heart"
            title="لا توجد مفضلات"
            description="لم تقم بحفظ أي رحلات أو فنادق. استكشف واجعلها في قائمة مفضلاتك."
            action={{
              label: 'استكشف الآن',
              onClick: () => window.location.href = '/search',
            }}
          />
        ) : (
          <div className="space-y-4">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="bg-sand border border-mist rounded-2xl p-4 flex gap-4 transition-all hover:shadow-md"
              >
                {/* Image placeholder */}
                <div className="w-24 h-24 bg-charcoal/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.type === 'flight' ? (
                    <Plane className="w-10 h-10 text-champagne" />
                  ) : (
                    <Star className="w-10 h-10 text-champagne" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-cairo text-champagne capitalize">{item.type}</span>
                      <h3 className="font-cairo font-semibold text-charcoal text-lg">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1 text-muted text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        {item.subtitle}
                      </div>
                    </div>
                    <button className="p-2 text-error hover:bg-error/10 rounded-full transition-colors">
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-champagne fill-current" />
                      <span className="font-cairo text-sm text-charcoal">{item.rating}</span>
                    </div>
                    <div>
                      <span className="font-cairo font-bold text-charcoal text-lg">
                        {item.price}
                      </span>
                      <span className="font-cairo text-muted text-sm"> {item.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
