'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { LoadingSpinner } from '@/components/ui/Loading';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface OrderDetails {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  details: {
    name: string;
    phone: string;
    email: string;
    date?: string;
    travelers?: number;
    notes?: string;
    destination?: string;
  };
  createdAt: string;
  statusHistory?: Array<{
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }>;
}

const statusLabels: Record<string, string> = {
  NEW: 'جديد',
  REVIEWING: 'قيد المراجعة',
  WAITING_USER: 'في انتظار ردك',
  OFFER_SENT: 'تم إرسال العرض',
  CONFIRMED_MANUALLY: 'تم التأكيد',
  CANCELLED: 'ملغي',
  CLOSED: 'مغلق',
};

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-yellow-100 text-yellow-700',
  WAITING_USER: 'bg-orange-100 text-orange-700',
  OFFER_SENT: 'bg-purple-100 text-purple-700',
  CONFIRMED_MANUALLY: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-gray-100 text-gray-700',
};

const serviceTypeLabels: Record<string, string> = {
  FLIGHT: 'طيران',
  HOTEL: 'فندق',
  CHALET: 'شالية',
  PACKAGE: 'باقة سياحية',
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        setError(data.error || 'حدث خطأ');
      }
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="font-cairo text-charcoal mt-4">جاري تحميل الطلب...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-ivory pb-24">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="p-4 bg-red-100 border border-red-200 rounded-xl text-red-700 font-cairo mb-6">
            {error || 'الطلب غير موجود'}
          </div>
          <Link href="/orders" className="inline-block px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
            العودة للطلبات
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  const whatsappLink = generateWhatsAppLink(order.orderNumber, order.serviceType);

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      <div className="bg-charcoal text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/orders" className="p-2 hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="font-cairo text-champagne text-sm">رقم الطلب</p>
              <h1 className="font-cairo text-2xl font-bold">{order.orderNumber}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status */}
        <div className="bg-sand border border-mist rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cairo font-bold text-charcoal">الحالة</h2>
            <span className={`px-3 py-1 rounded-full font-cairo text-sm ${statusColors[order.status]}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-sand border border-mist rounded-2xl p-5">
          <h2 className="font-cairo font-bold text-charcoal mb-4">تفاصيل الطلب</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-champagne" />
              <div>
                <p className="font-cairo text-sm text-secondary">نوع الخدمة</p>
                <p className="font-cairo text-charcoal">{serviceTypeLabels[order.serviceType] || order.serviceType}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-champagne" />
              <div>
                <p className="font-cairo text-sm text-secondary">الاسم</p>
                <p className="font-cairo text-charcoal">{order.details.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-champagne" />
              <div>
                <p className="font-cairo text-sm text-secondary">الجوال</p>
                <p className="font-cairo text-charcoal direction-ltr">{order.details.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-champagne" />
              <div>
                <p className="font-cairo text-sm text-secondary">البريد</p>
                <p className="font-cairo text-charcoal direction-ltr">{order.details.email}</p>
              </div>
            </div>

            {order.details.date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-champagne" />
                <div>
                  <p className="font-cairo text-sm text-secondary">تاريخ السفر</p>
                  <p className="font-cairo text-charcoal">{order.details.date}</p>
                </div>
              </div>
            )}

            {order.details.travelers && (
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-champagne" />
                <div>
                  <p className="font-cairo text-sm text-secondary">عدد المسافرين</p>
                  <p className="font-cairo text-charcoal">{order.details.travelers}</p>
                </div>
              </div>
            )}

            {order.details.notes && (
              <div className="pt-3 border-t border-mist">
                <p className="font-cairo text-sm text-secondary mb-1">ملاحظات</p>
                <p className="font-cairo text-charcoal">{order.details.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-xl font-cairo font-semibold text-lg hover:opacity-90 transition-all"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          تواصل عبر واتساب
        </a>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-sand border border-mist rounded-2xl p-5">
            <h2 className="font-cairo font-bold text-charcoal mb-4">سجل التحديثات</h2>
            <div className="space-y-3">
              {order.statusHistory.map((history) => (
                <div key={history.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-champagne rounded-full" />
                  <div className="flex-1">
                    <p className="font-cairo text-charcoal">
                      {statusLabels[history.status] || history.status}
                    </p>
                    {history.note && (
                      <p className="font-cairo text-sm text-secondary">{history.note}</p>
                    )}
                    <p className="font-cairo text-xs text-muted">
                      {new Date(history.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
