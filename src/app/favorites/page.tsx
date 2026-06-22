'use client';

import { Heart, MapPin, Star, Plane, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/ErrorEmpty';
import { useState, useEffect } from 'react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        if (response.status === 503) {
          setError('SERVICE_NOT_CONFIGURED');
          return;
        }
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch {
      setError('فشل في تحميل المفضلات');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ivory pb-24">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-champagne animate-spin" />
        </div>
        <BottomNav />
      </main>
    );
  }

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
        {error === 'SERVICE_NOT_CONFIGURED' ? (
          <EmptyState
            icon="heart"
            title="الخدمة غير مفعلة حاليًا"
            description="قاعدة البيانات غير مربوطة. سجّل الدخول للوصول للمفضلة."
          />
        ) : favorites.length === 0 ? (
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
