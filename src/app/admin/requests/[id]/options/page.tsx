'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Send, Archive, Edit2, Check, X, AlertCircle, Lock, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';

interface TravelRequest {
  id: string;
  referenceNumber: string;
  serviceType: string;
  cityAr: string | null;
  status: string;
  destination?: { cityAr: string; countryAr: string } | null;
  template?: { titleAr: string } | null;
}

interface Option {
  id: string;
  requestId: string;
  titleAr: string;
  descriptionAr: string;
  optionType: string;
  priceHintAr: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

const OPTION_TYPE_LABELS: Record<string, string> = {
  SUGGESTION: 'اقتراح',
  UPGRADE: 'ترقية',
  ALTERNATIVE: 'بديل',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  SENT: 'مرسل',
  SELECTED: 'مختار',
  REJECTED: 'مرفوض',
  ARCHIVED: 'مؤرشف',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  SELECTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

export default function AdminRequestOptionsPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOptionType, setFormOptionType] = useState('SUGGESTION');
  const [formPriceHint, setFormPriceHint] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setAuthState('loading');
    setError(null);

    try {
      // Load request
      const reqRes = await fetch('/api/admin/travel-requests/' + requestId, {
        credentials: 'include'
      });
      if (!reqRes.ok) {
        if (reqRes.status === 401 || reqRes.status === 403) {
          setAuthState('unauthorized');
          return;
        }
        throw new Error('فشل في تحميل الطلب');
      }
      const reqData = await reqRes.json();
      setRequest(reqData.data);

      // Load options
      const optRes = await fetch('/api/admin/travel-requests/' + requestId + '/options', {
        credentials: 'include'
      });
      if (!optRes.ok) throw new Error('فشل في تحميل الخيارات');
      const optData = await optRes.json();
      setOptions(optData.data || []);

      setAuthState('authorized');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    }
  }, [requestId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormOptionType('SUGGESTION');
    setFormPriceHint('');
    setFormNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formTitle || !formDescription) return;
    setIsSubmitting(true);

    try {
      const url = editingId
        ? '/api/admin/travel-requests/' + requestId + '/options/' + editingId
        : '/api/admin/travel-requests/' + requestId + '/options';
      
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titleAr: formTitle,
          descriptionAr: formDescription,
          optionType: formOptionType,
          priceHintAr: formPriceHint || null,
          notes: formNotes || null,
        }),
      });

      if (!res.ok) throw new Error('فشل في الحفظ');

      resetForm();
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (opt: Option) => {
    setFormTitle(opt.titleAr);
    setFormDescription(opt.descriptionAr);
    setFormOptionType(opt.optionType);
    setFormPriceHint(opt.priceHintAr || '');
    setFormNotes(opt.notes || '');
    setEditingId(opt.id);
    setShowForm(true);
  };

  const handleArchive = async (optionId: string) => {
    if (!confirm('هل تريد أرشفة هذا الخيار؟')) return;

    try {
      const res = await fetch('/api/admin/travel-requests/' + requestId + '/options/' + optionId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });

      if (!res.ok) throw new Error('فشل في الأرشفة');
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleSend = async () => {
    const draftOptions = options.filter(o => o.status === 'DRAFT');
    if (draftOptions.length === 0) {
      alert('لا توجد خيارات جاهزة للإرسال');
      return;
    }

    if (!confirm('هل تريد إرسال ' + draftOptions.length + ' خيارات للمستخدم؟')) return;

    try {
      const res = await fetch('/api/admin/travel-requests/' + requestId + '/options/send', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error?.message || 'فشل في الإرسال');
        return;
      }

      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-champagne" />
        </div>
      </main>
    );
  }

  if (authState === 'unauthorized') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">غير مصرح لك بالدخول</h2>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (authState === 'error') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="font-cairo text-secondary mb-4">{error}</p>
            <button onClick={loadData} className="px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>
    );
  }

  const draftOptions = options.filter(o => o.status === 'DRAFT');
  const sentOptions = options.filter(o => o.status === 'SENT');
  const selectedOption = options.find(o => o.status === 'SELECTED');

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />

      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href={'/admin/requests/' + requestId} className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">تفاصيل الطلب</span>
          </div>
          <h1 className="font-cairo text-2xl font-bold">إدارة الخيارات</h1>
          <p className="font-cairo text-white/70 mt-1">{request?.referenceNumber}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Request Summary */}
        <div className="bg-white rounded-xl border border-mist p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-cairo text-sm text-secondary">
                {request?.destination?.cityAr || request?.template?.titleAr || request?.cityAr || '-'}
              </p>
              <p className="font-cairo text-xs text-muted">رقم المرجع: {request?.referenceNumber}</p>
            </div>
            <Link
              href={'/admin/requests/' + requestId}
              className="px-4 py-2 bg-sand text-charcoal rounded-lg font-cairo text-sm"
            >
              العودة للطلب
            </Link>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg font-cairo text-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة خيار
          </button>
          {draftOptions.length > 0 && (
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 bg-champagne text-charcoal rounded-lg font-cairo text-sm"
            >
              <Send className="w-4 h-4" />
              إرسال {draftOptions.length} خيار
            </button>
          )}
        </div>

        {/* Notice */}
        <div className="bg-sand/50 rounded-xl p-4 border border-mist mb-6">
          <p className="font-cairo text-xs text-secondary">
            <strong>ملاحظة:</strong> هذه خيارات أولية للمراجعة وليست حجزًا مؤكدًا.
            سيتم تأكيد السعر والتوفر يدويًا قبل أي إجراء.
          </p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-mist p-6 mb-6">
            <h3 className="font-cairo text-lg font-bold text-charcoal mb-4">
              {editingId ? 'تعديل الخيار' : 'إضافة خيار جديد'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm text-secondary mb-2">العنوان *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-mist rounded-lg font-cairo"
                  placeholder="مثال: خيار فندق 5 نجوم"
                />
              </div>
              <div>
                <label className="block font-cairo text-sm text-secondary mb-2">الوصف *</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-mist rounded-lg font-cairo resize-none"
                  placeholder="تفاصيل الخيار..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-2">النوع</label>
                  <select
                    value={formOptionType}
                    onChange={(e) => setFormOptionType(e.target.value)}
                    className="w-full px-4 py-2 border border-mist rounded-lg font-cairo"
                  >
                    <option value="SUGGESTION">اقتراح</option>
                    <option value="UPGRADE">ترقية</option>
                    <option value="ALTERNATIVE">بديل</option>
                  </select>
                </div>
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-2">تكلفة تقديرية</label>
                  <input
                    type="text"
                    value={formPriceHint}
                    onChange={(e) => setFormPriceHint(e.target.value)}
                    className="w-full px-4 py-2 border border-mist rounded-lg font-cairo"
                    placeholder="مثال: يتم تأكيد السعر لاحقًا"
                  />
                </div>
              </div>
              <div>
                <label className="block font-cairo text-sm text-secondary mb-2">ملاحظات داخلية (غير مرئية للمستخدم)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-mist rounded-lg font-cairo resize-none"
                  placeholder="ملاحظات للفريق الداخلي..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formTitle || !formDescription}
                  className="flex items-center gap-2 px-6 py-2 bg-champagne text-charcoal rounded-lg font-cairo font-semibold disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'جاري...' : 'حفظ'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-2 bg-sand text-charcoal rounded-lg font-cairo"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-4">
          {options.length === 0 ? (
            <div className="bg-white rounded-xl border border-mist p-8 text-center">
              <p className="font-cairo text-secondary">لا توجد خيارات بعد</p>
            </div>
          ) : (
            options.map((opt) => (
              <div key={opt.id} className="bg-white rounded-xl border border-mist p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-cairo font-bold text-charcoal">{opt.titleAr}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-cairo ${STATUS_COLORS[opt.status]}`}>
                        {STATUS_LABELS[opt.status]}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-cairo bg-sand text-secondary">
                        {OPTION_TYPE_LABELS[opt.optionType] || opt.optionType}
                      </span>
                    </div>
                    <p className="font-cairo text-sm text-secondary mb-2">{opt.descriptionAr}</p>
                    {opt.priceHintAr && (
                      <p className="font-cairo text-xs text-charcoal bg-sand/50 px-3 py-1 rounded-full inline-block">
                        {opt.priceHintAr}
                      </p>
                    )}
                  </div>
                  {opt.status === 'DRAFT' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(opt)} className="p-2 text-champagne">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleArchive(opt.id)} className="p-2 text-red-500">
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="font-cairo text-xs text-muted">
                  تاريخ الإنشاء: {formatDate(opt.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Status Summary */}
        {(sentOptions.length > 0 || selectedOption) && (
          <div className="mt-6 p-4 bg-sand/50 rounded-xl border border-mist">
            <p className="font-cairo text-sm text-secondary">
              {sentOptions.length > 0 && <span>خيارات بانتظار رد المستخدم: {sentOptions.length}</span>}
              {selectedOption && <span>الخيار المختار: {selectedOption.titleAr}</span>}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
