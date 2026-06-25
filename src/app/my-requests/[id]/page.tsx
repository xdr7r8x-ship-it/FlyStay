'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft, Clock, MapPin, Users, Calendar, CheckCircle, AlertCircle, Lock, RefreshCw, MessageSquare, Send, Bell, FileText} from 'lucide-react';
import Header from '@/components/layout/Header';

interface TravelRequest {
  id: string;
  referenceNumber: string;
  serviceType: string;
  sourceType: string;
  cityAr: string | null;
  startDate: string | null;
  endDate: string | null;
  guests: number | null;
  rooms: number | null;
  budgetLevel: string | null;
  notes: string | null;
  status: string;
  paymentStatus: string;
  bookingStatus: string;
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
}

interface Message {
  id: string;
  senderRole: string;
  bodyAr: string;
  messageType: string;
  createdAt: string;
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'forbidden' | 'error';

const STATUS_LABELS: Record<string, { label: string; description: string }> = {
  NEW: { label: 'تم استلام الطلب', description: 'تم استلام طلبك وجاري مراجعته' },
  REVIEWING: { label: 'قيد المراجعة', description: 'الطلب قيد المراجعة من قبل فريقنا' },
  OPTIONS_SENT: { label: 'خيارات جاهزة', description: 'تم تجهيز خيارات للمراجعة' },
  USER_APPROVED: { label: 'تمت الموافقة', description: 'تمت موافقتك على الخيارات المختارة' },
  BOOKING_PENDING: { label: 'بانتظار الإجراء', description: 'بانتظار الإجراء اليدوي' },
  COMPLETED: { label: 'مكتمل إداريًا', description: 'تمت المعاملة إداريًا' },
  CANCELLED: { label: 'ملغي', description: 'تم إلغاء الطلب' },
};

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

export default function MyRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadRequest = useCallback(async () => {
    setAuthState('loading');
    setError(null);

    try {
      const response = await fetch('/api/travel-requests/' + requestId, {
        credentials: 'include'
      });

      if (response.status === 401) {
        setAuthState('unauthenticated');
        return;
      }

      if (response.status === 403) {
        setAuthState('forbidden');
        return;
      }

      if (response.status === 404) {
        setError('الطلب غير موجود');
        setAuthState('error');
        return;
      }

      if (!response.ok) {
        throw new Error('فشل في تحميل الطلب');
      }

      const data = await response.json();
      setRequest(data.data);
      setAuthState('authenticated');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    }
  }, [requestId]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', { credentials: 'include' });
      if (!response.ok) return;
      const data = await response.json();
      setUnreadNotifications(Number(data.unreadCount || 0));
    } catch {
      setUnreadNotifications(0);
    }
  }, []);

  useEffect(() => {
    loadRequest();
    loadNotifications();
    // Per-request mark-as-read is blocked by current Notification schema because notifications do not store requestId/entityId.
    
    // Load messages
    fetch('/api/travel-requests/' + requestId + '/messages', { credentials: 'include' })
      .then(r => r.ok && r.json())
      .then(d => d && setMessages(d.data || []))
      .catch(() => {});
  }, [loadRequest, loadNotifications, requestId]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSending(true);
    
    try {
      const response = await fetch('/api/travel-requests/' + requestId + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bodyAr: messageText.trim() }),
      });
      
      if (!response.ok) throw new Error('فشل في إرسال الرسالة');
      
      setMessageText('');
      
      // Reload messages
      const msgsRes = await fetch('/api/travel-requests/' + requestId + '/messages', { credentials: 'include' });
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Next Step guidance based on status
  const nextStepInfo = useMemo(() => {
    if (!request) return null;
    
    switch (request.status) {
      case 'NEW':
        return {
          title: 'طلبك وصل',
          titleSub: 'سيتم مراجعته قريبًا',
          description: 'فريقنا سيقوم بمراجعة طلبك والتواصل معك عبر الرسائل. يرجى الانتظار.',
          icon: 'search',
          color: 'blue',
          action: 'انتظار',
          actionHint: 'يمكنك إرسال رسالة للفريق إذا كان لديك استفسار'
        };
      case 'REVIEWING':
        return {
          title: 'الطلب قيد المراجعة',
          titleSub: 'فريقنا يعمل عليه',
          description: 'فريقنا يقوم بمراجعة طلبك حاليًا وإعداد الخيارات المناسبة لك.',
          icon: 'cog',
          color: 'yellow',
          action: 'انتظار',
          actionHint: 'سيصلك إشعار عند تجهيز الخيارات'
        };
      case 'OPTIONS_SENT':
        return {
          title: 'لديك خيارات جديدة',
          titleSub: 'راجع واختر ما يناسبك',
          description: 'أرسلنا لك خيارات مبدئية للاختيار من بينها. راجع كل خيار واختر ما يناسب احتياجاتك.',
          icon: 'check',
          color: 'purple',
          action: 'مراجعة',
          actionHint: 'اضغط على "الخيارات" أعلى الصفحة لعرض واختيار ما يناسبك'
        };
      case 'USER_APPROVED':
        return {
          title: 'تم استلام اختيارك',
          titleSub: 'جاري المتابعة يدويًا',
          description: 'شكرًا لاختيارك! فريقنا يستلم اختيارك ويعمل على متابعة طلبك. هذه المرحلة لا تعني تأكيد الحجز.',
          icon: 'clock',
          color: 'orange',
          action: 'متابعة',
          actionHint: 'سنتواصل معك قريبًا. يمكنك إرسال رسالة للاستفسار'
        };
      case 'BOOKING_PENDING':
        return {
          title: 'الطلب يحتاج متابعة',
          titleSub: 'جاري العمل عليه',
          description: 'طلبك يحتاج إلى متابعة خاصة من فريقنا. سنعمل على إنهاء الإجراءات اللازمة.',
          icon: 'hourglass',
          color: 'orange',
          action: 'انتظار',
          actionHint: 'سنتواصل معك قريبًا. لا يعني هذا توفر أو حجز فعلي'
        };
      case 'COMPLETED':
        return {
          title: 'تمت المعاملة إداريًا',
          titleSub: 'من الجانب التشغيلي',
          description: 'تمت الإجراءات الإدارية لهذا الطلب. للتواصل أو الاستفسارات، استخدم الرسائل.',
          icon: 'check-circle',
          color: 'green',
          action: 'اتصال',
          actionHint: 'لأي استفسار، أرسل رسالة للفريق'
        };
      case 'CANCELLED':
        return {
          title: 'تم إلغاء الطلب',
          titleSub: 'لم يتم إتمام المعاملة',
          description: 'تم إلغاء هذا الطلب. يمكنك تقديم طلب جديد إذا رغبت.',
          icon: 'x',
          color: 'red',
          action: 'جديد',
          actionHint: 'لإنشاء طلب جديد، استخدم نموذج طلب جديد'
        };
      default:
        return null;
    }
  }, [request]);

  const getStatusIcon = (icon: string) => {
    switch (icon) {
      case 'search': return <Clock className="w-5 h-5" />;
      case 'cog': return <AlertCircle className="w-5 h-5" />;
      case 'check': return <CheckCircle className="w-5 h-5" />;
      case 'clock': return <Clock className="w-5 h-5" />;
      case 'hourglass': return <Clock className="w-5 h-5" />;
      case 'check-circle': return <CheckCircle className="w-5 h-5" />;
      case 'x': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  // Loading state
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

  // Not authenticated
  if (authState === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-charcoal/50" />
            </div>
            <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">يلزم تسجيل الدخول</h2>
            <p className="font-cairo text-secondary mb-6">يرجى تسجيل الدخول لمشاهدة تفاصيل الطلب</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Forbidden - trying to access another user's request
  if (authState === 'forbidden') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">غير مصرح</h2>
            <p className="font-cairo text-secondary mb-6">لا يمكنك عرض هذا الطلب</p>
            <Link href="/my-requests" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              العودة لطلباتي
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (authState === 'error' || !request) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">{error || 'حدث خطأ'}</h2>
            <Link href="/my-requests" className="inline-flex items-center gap-2 px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo mt-4">
              العودة لطلباتي
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusInfo = STATUS_LABELS[request.status] || { label: request.status, description: '' };

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />

      <div className="bg-charcoal text-white py-8 px-4">
        {unreadNotifications > 0 && (
          <div className="max-w-4xl mx-auto mb-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-champagne px-3 py-1 font-cairo text-sm font-bold text-charcoal">
              <Bell className="h-4 w-4" />
              تحديث جديد
            </span>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/my-requests" className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">طلباتي</span>
          </div>
          <h1 className="font-cairo text-2xl font-bold">تفاصيل الطلب</h1>
          <p className="font-cairo text-white/70 mt-1">{request.referenceNumber}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Phase 6C: Enhanced Next Step Section */}
        {nextStepInfo && (
          <div className={`rounded-xl p-5 mb-6 ${
            nextStepInfo.color === 'blue' ? 'bg-blue-50 border border-blue-200' :
            nextStepInfo.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
            nextStepInfo.color === 'purple' ? 'bg-purple-50 border border-purple-200' :
            nextStepInfo.color === 'orange' ? 'bg-orange-50 border border-orange-200' :
            nextStepInfo.color === 'green' ? 'bg-green-50 border border-green-200' :
            nextStepInfo.color === 'red' ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            {/* Header with icon */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                nextStepInfo.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                nextStepInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                nextStepInfo.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                nextStepInfo.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                nextStepInfo.color === 'green' ? 'bg-green-100 text-green-600' :
                nextStepInfo.color === 'red' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {getStatusIcon(nextStepInfo.icon)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-champagne" />
                  <h2 className="font-cairo text-base font-bold text-charcoal">ما الخطوة القادمة؟</h2>
                </div>
                <h2 className="font-cairo text-xl font-bold mb-1">{nextStepInfo.title}</h2>
                <p className="font-cairo text-sm text-charcoal/70">{nextStepInfo.titleSub}</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="font-cairo text-sm mb-4">{nextStepInfo.description}</p>
            
            {/* Action Card */}
            <div className={`rounded-lg p-3 ${
              nextStepInfo.color === 'blue' ? 'bg-blue-100/50' :
              nextStepInfo.color === 'yellow' ? 'bg-yellow-100/50' :
              nextStepInfo.color === 'purple' ? 'bg-purple-100/50' :
              nextStepInfo.color === 'orange' ? 'bg-orange-100/50' :
              nextStepInfo.color === 'green' ? 'bg-green-100/50' :
              nextStepInfo.color === 'red' ? 'bg-red-100/50' :
              'bg-gray-100/50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-cairo font-semibold ${
                  nextStepInfo.color === 'blue' ? 'bg-blue-200 text-blue-800' :
                  nextStepInfo.color === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                  nextStepInfo.color === 'purple' ? 'bg-purple-200 text-purple-800' :
                  nextStepInfo.color === 'orange' ? 'bg-orange-200 text-orange-800' :
                  nextStepInfo.color === 'green' ? 'bg-green-200 text-green-800' :
                  nextStepInfo.color === 'red' ? 'bg-red-200 text-red-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {nextStepInfo.action}
                </span>
                <span className="font-cairo text-xs text-charcoal/70">—</span>
              </div>
              <p className="font-cairo text-xs text-charcoal/80">{nextStepInfo.actionHint}</p>
            </div>
          </div>
        )}

        {/* Safety Notice */}
        <div className="bg-sand/30 border border-sand rounded-lg p-3 mb-6">
          <p className="font-cairo text-xs text-charcoal/70 text-center">
            <strong className="text-charcoal">تنبيه:</strong> المتابعة داخل FlyStay لا تعني تأكيد الحجز أو الدفع أو توفر الخدمة حتى يتم إشعارك رسميًا.
          </p>
        </div>

        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-6 ${STATUS_COLORS[request.status] || 'bg-gray-100'}`}>
          <div className="flex items-center gap-3">
            {request.status === 'NEW' && <Clock className="w-5 h-5" />}
            {request.status === 'REVIEWING' && <Clock className="w-5 h-5" />}
            {request.status === 'OPTIONS_SENT' && <CheckCircle className="w-5 h-5" />}
            {request.status === 'USER_APPROVED' && <CheckCircle className="w-5 h-5" />}
            {request.status === 'BOOKING_PENDING' && <Clock className="w-5 h-5" />}
            {request.status === 'COMPLETED' && <CheckCircle className="w-5 h-5" />}
            {request.status === 'CANCELLED' && <AlertCircle className="w-5 h-5" />}
            <div>
              <span className="font-cairo font-bold">{statusInfo.label}</span>
              <p className="font-cairo text-xs opacity-80">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Request Info */}
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
              <p className="font-cairo text-sm">
                {request.guests || 0} مسافر{request.rooms ? ` / ${request.rooms} غرفة` : ''}
              </p>
            </div>
            <div>
              <p className="font-cairo text-xs text-secondary mb-1">تاريخ الإنشاء</p>
              <p className="font-cairo text-sm">{formatDate(request.createdAt)}</p>
            </div>
            {request.startDate && (
              <div>
                <p className="font-cairo text-xs text-secondary mb-1">تاريخ البدء</p>
                <p className="font-cairo text-sm">{formatDate(request.startDate)}</p>
              </div>
            )}
            {request.endDate && (
              <div>
                <p className="font-cairo text-xs text-secondary mb-1">تاريخ الانتهاء</p>
                <p className="font-cairo text-sm">{formatDate(request.endDate)}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="font-cairo text-xs text-secondary mb-1">ملاحظاتك</p>
              <p className="font-cairo text-sm bg-sand p-3 rounded-lg">
                {request.notes || 'لا توجد ملاحظات'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="bg-white rounded-xl border border-mist p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-champagne" />
            <h3 className="font-cairo text-lg font-bold text-charcoal">مراسلات الطلب</h3>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <p className="font-cairo text-sm text-secondary text-center py-4">لا توجد رسائل</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-lg ${msg.senderRole === 'SYSTEM' ? 'bg-sand/50' : msg.senderRole === 'ADMIN' ? 'bg-champagne/10 mr-4' : 'bg-white border border-mist ml-4'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-cairo text-xs font-semibold ${msg.senderRole === 'SYSTEM' ? 'text-secondary' : msg.senderRole === 'ADMIN' ? 'text-charcoal' : 'text-champagne'}`}>
                      {msg.senderRole === 'SYSTEM' ? 'نظام' : msg.senderRole === 'ADMIN' ? 'فريق FlyStay' : 'أنت'}
                    </span>
                    <span className="font-cairo text-xs text-muted">
                      {new Date(msg.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <p className="font-cairo text-sm text-charcoal">{msg.bodyAr}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              placeholder="اكتب رسالة..."
              className="flex-1 px-4 py-2 border border-mist rounded-lg font-cairo text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className="px-4 py-2 bg-champagne text-charcoal rounded-lg font-cairo font-semibold disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-sand/50 rounded-xl p-4 border border-mist mb-6">
          <p className="font-cairo text-xs text-secondary">
            <strong>ملاحظة:</strong> هذه صفحة لمتابعة حالة طلبك فقط.
            لا تُعتبر أي حالة هنا تأكيدًا للحجز أو الدفع.
            للتواصل أو الاستفسار، يرجى استخدام قنوات الدعم المتاحة.
          </p>
        </div>

        {/* Options Button - only show when OPTIONS_SENT or USER_APPROVED */}
        {(request.status === 'OPTIONS_SENT' || request.status === 'USER_APPROVED') && (
          <div className="mb-6">
            <Link
              href={'/my-requests/' + requestId + '/options'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-champagne text-charcoal rounded-xl font-cairo font-semibold"
            >
              عرض الخيارات
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link href="/my-requests" className="font-cairo text-sm text-champagne hover:underline">
            العودة لطلباتي
          </Link>
        </div>
      </div>
    </main>
  );
}
