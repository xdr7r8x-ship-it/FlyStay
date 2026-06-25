'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tag, Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, Star, RefreshCw, Calendar, MapPin, AlertTriangle } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  code?: string;
  serviceType?: string;
  estimatedPrice?: string;
  currency?: string;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  featured: boolean;
  termsAr?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [saving, setSaving] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  // Form state
  const [formData, setFormData] = useState({
    titleAr: '',
    descriptionAr: '',
    code: '',
    serviceType: 'PACKAGE',
    estimatedPrice: '',
    currency: 'SAR',
    startsAt: '',
    endsAt: '',
    termsAr: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN')) {
          setAuthState('authorized');
          fetchOffers();
        } else {
          setAuthState('unauthorized');
        }
      } else {
        setAuthState('unauthorized');
      }
    } catch {
      setAuthState('unauthorized');
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/offers', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOffers(data.data || []);
      } else {
        setOffers([]);
      }
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.titleAr.trim() || !formData.descriptionAr.trim()) return;

    setSaving(true);
    try {
      const url = editingOffer
        ? `/api/admin/offers/${editingOffer.id}`
        : '/api/admin/offers';
      
      const res = await fetch(url, {
        method: editingOffer ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : null,
          startsAt: formData.startsAt || null,
          endsAt: formData.endsAt || null,
        }),
      });

      if (res.ok) {
        fetchOffers();
        closeModal();
      }
    } catch {
      // Silent failure
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

    try {
      await fetch(`/api/admin/offers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchOffers();
    } catch {
      // Silent failure
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    try {
      await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active: !offer.active }),
      });
      fetchOffers();
    } catch {
      // Silent failure
    }
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      titleAr: offer.titleAr || offer.title,
      descriptionAr: offer.descriptionAr || offer.description,
      code: offer.code || '',
      serviceType: offer.serviceType || 'PACKAGE',
      estimatedPrice: offer.estimatedPrice || '',
      currency: offer.currency || 'SAR',
      startsAt: offer.startsAt ? offer.startsAt.split('T')[0] : '',
      endsAt: offer.endsAt ? offer.endsAt.split('T')[0] : '',
      termsAr: offer.termsAr || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOffer(null);
    setFormData({
      titleAr: '',
      descriptionAr: '',
      code: '',
      serviceType: 'PACKAGE',
      estimatedPrice: '',
      currency: 'SAR',
      startsAt: '',
      endsAt: '',
      termsAr: '',
    });
  };

  const filteredOffers = offers.filter(offer => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        offer.titleAr?.toLowerCase().includes(query) ||
        offer.descriptionAr?.toLowerCase().includes(query) ||
        offer.code?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (authState === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-champagne animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-charcoal">العروض</h1>
          <p className="font-cairo text-secondary mt-1">إدارة العروض والتخفيضات</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-champagne text-charcoal rounded-xl font-cairo font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة عرض</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="mb-6 p-4 bg-champagne/10 border border-champagne/20 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-cairo text-sm text-charcoal font-semibold">تنبيه الأمان</p>
          <p className="font-cairo text-xs text-secondary mt-1">
            جميع الأسعار المعروضة هي أسعار تقديرية وغير نهائية. أي تأكيد على توفر أو حجز يتطلب موافقة إدارية.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في العروض..."
            className="w-full pr-10 pl-4 py-3 bg-white border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne transition-colors"
          />
        </div>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-champagne animate-spin" />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist p-12 text-center">
          <Tag className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="font-cairo text-secondary text-lg">لا توجد عروض</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-6 py-2 bg-champagne text-charcoal rounded-xl font-cairo hover:opacity-90 transition-opacity"
          >
            إضافة عرض جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-opacity ${
                offer.active ? 'border-mist' : 'border-muted opacity-60'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-mist">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-champagne" />
                    {offer.featured && (
                      <Star className="w-4 h-4 text-champagne fill-current" />
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleActive(offer)}
                    className={`p-1 rounded transition-colors ${
                      offer.active ? 'text-success' : 'text-muted'
                    }`}
                    title={offer.active ? 'تعطيل' : 'تفعيل'}
                  >
                    {offer.active ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>
                <h3 className="font-cairo font-semibold text-charcoal">{offer.titleAr || offer.title}</h3>
                {offer.code && (
                  <span className="inline-block mt-2 px-2 py-1 bg-champagne/20 text-champagne text-xs font-mono rounded">
                    {offer.code}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                <p className="font-cairo text-sm text-secondary line-clamp-3 mb-4">
                  {offer.descriptionAr || offer.description}
                </p>

                {offer.estimatedPrice && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-cairo text-xs text-muted">السعر التقديري:</span>
                    <span className="font-cairo text-sm font-semibold text-charcoal">
                      {offer.estimatedPrice} {offer.currency || 'SAR'}
                    </span>
                  </div>
                )}

                {(offer.startsAt || offer.endsAt) && (
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {offer.startsAt && new Date(offer.startsAt).toLocaleDateString('ar-SA')}
                      {offer.startsAt && offer.endsAt && ' - '}
                      {offer.endsAt && new Date(offer.endsAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-mist flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(offer)}
                  className="p-2 hover:bg-sand rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4 text-secondary" />
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4 text-error" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-mist">
              <h2 className="font-cairo text-xl font-bold text-charcoal">
                {editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-cairo text-sm text-charcoal mb-2">عنوان العرض *</label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                  placeholder="مثال: عرض الصيف المميز"
                />
              </div>
              <div>
                <label className="block font-cairo text-sm text-charcoal mb-2">الوصف *</label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm resize-none focus:outline-none focus:border-champagne"
                  placeholder="تفاصيل العرض..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-cairo text-sm text-charcoal mb-2">كود الخصم</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                    placeholder="SUMMER20"
                  />
                </div>
                <div>
                  <label className="block font-cairo text-sm text-charcoal mb-2">نوع الخدمة</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                  >
                    <option value="PACKAGE">باقة</option>
                    <option value="FLIGHT">طيران</option>
                    <option value="HOTEL">فندق</option>
                    <option value="CHALET">شالية</option>
                    <option value="MIXED">مختلط</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-cairo text-sm text-charcoal mb-2">السعر التقديري</label>
                  <input
                    type="number"
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                    className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                    placeholder="1500"
                  />
                  <p className="font-cairo text-xs text-muted mt-1">سعر تقديري غير نهائي</p>
                </div>
                <div>
                  <label className="block font-cairo text-sm text-charcoal mb-2">العملة</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-cairo text-sm text-charcoal mb-2">تاريخ البدء</label>
                  <input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="block font-cairo text-sm text-charcoal mb-2">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                  />
                </div>
              </div>
              <div>
                <label className="block font-cairo text-sm text-charcoal mb-2">الشروط والأحكام</label>
                <textarea
                  value={formData.termsAr}
                  onChange={(e) => setFormData({ ...formData, termsAr: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm resize-none focus:outline-none focus:border-champagne"
                  placeholder="شروط العرض..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-mist flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-sand text-charcoal rounded-xl font-cairo hover:bg-sand/80 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.titleAr.trim() || !formData.descriptionAr.trim()}
                className="px-6 py-2 bg-champagne text-charcoal rounded-xl font-cairo font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
