'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Lock, Clock, MapPin, Users, Calendar, CheckCircle, MessageSquare, Send, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/layout/Header';

interface Message {
  id: string;
  senderRole: string;
  bodyAr: string;
  messageType: string;
  visibility: string;
  createdAt: string;
  sender?: {
    name: string;
    email: string;
  };
}

interface TravelRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  serviceType: string;
  cityAr: string | null;
  status: string;
  paymentStatus: string;
  bookingStatus: string;
  guests: number | null;
  rooms: number | null;
  budgetLevel: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  destination?: {
    id: string;
    slug: string;
    cityAr: string;
    countryAr: string;
  } | null;
  template?: {
    id: string;
    slug: string;
    titleAr: string;
  } | null;
  stayGuide?: {
    id: string;
    titleAr: string;
    cityAr: string;
    type: string;
  } | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
  };
}

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'جديد' },
  { value: 'REVIEWING', label: 'قيد المراجعة' },
  { value: 'OPTIONS_SENT', label: 'تم إرسال الخيارات' },
  { value: 'USER_APPROVED', label: 'موافق' },
  { value: 'BOOKING_PENDING', label: 'بانتظار الإجراء اليدوي' },
  { value: 'COMPLETED', label: 'مكتمل إداريًا' },
  { value: 'CANCELLED', label: 'ملغي' },
];

const SERVICE_LABELS: Record<string, string> = {
  FLIGHT: 'رحلات طيران',
  HOTEL: 'فنادق',
  PACKAGE: 'باقات',
  CHALET: 'شاليهات',
  RESTHOUSE: 'استراحات',
  MIXED: 'مختلطة',
};

const BUDGET_LABELS: Record<string, string> = {
  ECONOMY: 'اقتصادية',
  MID: 'متوسطة',
  LUXURY: 'فاخرة',
  MIXED: 'مختلطة',
};

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-yellow-100 text-yellow-700',
  OPTIONS_SENT: 'bg-purple-100 text-purple-700',
  USER_APPROVED: 'bg-green-100 text-green-700',
  BOOKING_PENDING: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messageInternal, setMessageInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const loadRequest = useCallback(async () => {
    setAuthState('loading');
    setError(null);

    try {
      const response = await fetch('/api/admin/travel-requests/' + requestId, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          return;
        }
        if (response.status === 404) {
          setError('الطلب غير موجود');
          setAuthState('error');
          return;
        }
        throw new Error('فشل في تحميل الطلب');
      }

      const data = await response.json();
      setRequest(data.data);
      setUpdateStatus(data.data.status);
      setUpdateNotes(data.data.notes || '');
      setAuthState('authorized');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
    
    // Load messages
    fetch('/api/admin/travel-requests/' + requestId + '/messages', { credentials: 'include' })
      .then(r => r.ok && r.json())
      .then(d => d && setMessages(d.data || []))
      .catch(() => {});
  }, [loadRequest, requestId]);

  const handleUpdate = async () => {
    if (authState !== 'authorized' || !request) return;
    setIsUpdating(true);

    try {
      const response = await fetch('/api/admin/travel-requests/' + requestId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: updateStatus,
          notes: updateNotes,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          return;
        }
        throw new Error('فشل في تحديث الطلب');
      }

      loadRequest();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSending(true);
    
    try {
      const response = await fetch('/api/admin/travel-requests/' + requestId + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bodyAr: messageText.trim(),
          visibility: messageInternal ? 'INTERNAL' : 'USER',
        }),
      });
      
      if (!response.ok) throw new Error('فشل في إرسال الرسالة');
      
      setMessageText('');
      setMessageInternal(false);
      
      // Reload messages
      const msgsRes = await fetch('/api/admin/travel-requests/' + requestId + '/messages', { credentials: 'include' });
      if (msgsRes.ok) {
        const msgsData = await msgsRes.json();
        setMessages(msgsData.data || []);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sand rounded w-1/3" />
            <div className="h-64 bg-sand rounded-xl" />
          </div>
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
            <p className="font-cairo text-secondary mb-6">هذه الصفحة مخصصة للمسؤول فقط.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (authState === 'error' || !request) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">{error || 'الطلب غير موجود'}</h2>
            <Link href="/admin/requests" className="inline-flex items-center gap-2 px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo mt-4">
              العودة للطلبات
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />

      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/requests" className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">إدارة الطلبات</span>
          </div>
          <h1 className="font-cairo text-2xl font-bold">تفاصيل الطلب</h1>
          <p className="font-cairo text-white/70 mt-1">{request.referenceNumber}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-6 ${STATUS_COLORS[request.status] || 'bg-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {request.status === 'NEW' && <Clock className="w-5 h-5" />}
              {request.status === 'REVIEWING' && <Clock className="w-5 h-5" />}
              {request.status === 'OPTIONS_SENT' && <CheckCircle className="w-5 h-5" />}
              {request.status === 'USER_APPROVED' && <CheckCircle className="w-5 h-5" />}
              {request.status === 'BOOKING_PENDING' && <Clock className="w-5 h-5" />}
              {request.status === 'COMPLETED' && <CheckCircle className="w-5 h-5" />}
              {request.status === 'CANCELLED' && <AlertCircle className="w-5 h-5" />}
              <span className="font-cairo font-bold">
                {STATUS_OPTIONS.find(s => s.value === request.status)?.label || request.status}
              </span>
            </div>
            <span className="font-cairo text-sm">
              {request.paymentStatus} / {request.bookingStatus}
            </span>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white rounded-xl border border-mist p-6 mb-6">
          <h2 className="font-cairo text-lg font-bold text-charcoal mb-4">معلومات الطلب</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">رقم المرجع</p>
              <p className="font-cairo text-sm font-bold">{request.referenceNumber}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">نوع الخدمة</p>
              <p className="font-cairo text-sm">{SERVICE_LABELS[request.serviceType] || request.serviceType}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الوجهة</p>
              <p className="font-cairo text-sm">
                {request.cityAr || request.destination?.cityAr || request.template?.titleAr || '-'}
              </p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الميزانية</p>
              <p className="font-cairo text-sm">{request.budgetLevel ? BUDGET_LABELS[request.budgetLevel] || '-' : '-'}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الضيوف</p>
              <p className="font-cairo text-sm">{request.guests || 0} مسافر{request.rooms ? ` / ${request.rooms} غرفة` : ''}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">تاريخ الإنشاء</p>
              <p className="font-cairo text-sm">{formatDate(request.createdAt)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-cairo text-xs text-secondary mb-1">ملاحظات المستخدم</p>
              <p className="font-cairo text-sm bg-sand p-3 rounded-lg">{request.notes || 'لا توجد ملاحظات'}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl border border-mist p-6 mb-6">
          <h2 className="font-cairo text-lg font-bold text-charcoal mb-4">معلومات المستخدم</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الاسم</p>
              <p className="font-cairo text-sm">{request.user?.name || '-'}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">البريد</p>
              <p className="font-cairo text-sm">{request.user?.email || '-'}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الهاتف</p>
              <p className="font-cairo text-sm">{request.user?.phone || '-'}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">الدور</p>
              <p className="font-cairo text-sm">{request.user?.role || '-'}</p>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-xl border border-mist p-6 mb-6">
          <h2 className="font-cairo text-lg font-bold text-charcoal mb-4">تحديث الطلب</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block font-cairo text-sm text-secondary mb-2">تحديث الحالة</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full px-4 py-2 border border-mist rounded-lg font-cairo bg-white"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-cairo text-sm text-secondary mb-2">ملاحظات</label>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-mist rounded-lg font-cairo bg-white resize-none"
                placeholder="أضف ملاحظات..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-champagne text-charcoal rounded-xl font-cairo font-semibold disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <Link
                href="/admin/requests"
                className="px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo"
              >
                العودة
              </Link>
            </div>
          </div>

          <div className="mt-4 p-3 bg-sand/50 rounded-lg">
            <p className="font-cairo text-xs text-secondary">
              <strong>تنبيه:</strong> تحديث الحالة لا يعني تأكيد الحجز أو الدفع.
              الحالة &#8220;بانتظار الإجراء&#8221; تعني أن الطلب يحتاج متابعة يدوية.
              الحالة &#8220;مكتمل إداريًا&#8221; تعني أن المعاملة تمت إداريًا ولا تعني تأكيد الحجز.
            </p>
          </div>

          {/* Options Management */}
          <div className="mt-4 pt-4 border-t border-mist">
            <Link
              href={'/admin/requests/' + requestId + '/options'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg font-cairo text-sm"
            >
              إدارة الخيارات
            </Link>
          </div>

          {/* Messages Section */}
          <div className="mt-6 pt-6 border-t border-mist">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-champagne" />
              <h3 className="font-cairo text-lg font-bold text-charcoal">مراسلات الطلب</h3>
            </div>

            {/* Message List */}
            <div className="bg-white rounded-xl border border-mist divide-y divide-mist max-h-80 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="font-cairo text-sm text-secondary">لا توجد رسائل بعد</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {msg.senderRole === 'SYSTEM' ? (
                          <span className="px-2 py-1 bg-sand text-xs font-cairo rounded-full">نظام</span>
                        ) : msg.senderRole === 'ADMIN' ? (
                          <span className="px-2 py-1 bg-charcoal text-white text-xs font-cairo rounded-full">أدمن</span>
                        ) : (
                          <span className="px-2 py-1 bg-champagne/30 text-xs font-cairo rounded-full">مستخدم</span>
                        )}
                        {msg.visibility === 'INTERNAL' && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-cairo rounded-full">
                            <EyeOff className="w-3 h-3" />
                            داخلي فقط
                          </span>
                        )}
                      </div>
                      <span className="font-cairo text-xs text-muted">
                        {new Date(msg.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <p className="font-cairo text-sm text-charcoal">{msg.bodyAr}</p>
                    {msg.sender && (
                      <p className="font-cairo text-xs text-muted mt-1">
                        {msg.sender.name || msg.sender.email}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Send Message Form */}
            <div className="bg-white rounded-xl border border-mist p-4">
              <textarea
                id="messageText"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-mist rounded-lg font-cairo resize-none mb-3"
                placeholder="اكتب رسالة للمستخدم..."
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={messageInternal}
                    onChange={(e) => setMessageInternal(e.target.checked)}
                    className="w-4 h-4 accent-charcoal"
                  />
                  <span className="font-cairo text-sm text-secondary">رسالة داخلية فقط</span>
                </label>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  className="flex items-center gap-2 mr-auto px-4 py-2 bg-champagne text-charcoal rounded-lg font-cairo font-semibold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'جاري...' : 'إرسال'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/admin/requests" className="font-cairo text-sm text-champagne hover:underline">
            العودة لقائمة الطلبات
          </Link>
        </div>
      </div>
    </main>
  );
}
