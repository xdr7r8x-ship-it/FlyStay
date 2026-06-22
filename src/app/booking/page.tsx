'use client';

import { useState } from 'react';
import { Send, User, Phone, Mail, Calendar, Users, MessageSquare, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function BookingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'flight',
    date: '',
    travelers: 1,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-ivory pb-24">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">
            تم إرسال طلب الحجز بنجاح
          </h2>
          <p className="font-cairo text-secondary mb-8 max-w-md mx-auto">
            شكراً لك! سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الحجز.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ name: '', phone: '', email: '', type: 'flight', date: '', travelers: 1, notes: '' });
            }}
            className="px-6 py-3 bg-charcoal text-white rounded-xl font-cairo font-medium"
          >
            إرسال طلب جديد
          </button>
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
          <h1 className="font-cairo text-3xl font-bold mb-2">إرسال طلب حجز</h1>
          <p className="font-cairo text-champagne">املأ النموذج وسيتواصل معك فريقنا</p>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <form onSubmit={handleSubmit} className="bg-sand border border-mist rounded-3xl p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block font-cairo text-sm font-medium text-charcoal mb-2">
              الاسم الكامل
            </label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسمك الكامل"
                className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block font-cairo text-sm font-medium text-charcoal mb-2">
              رقم الجوال
            </label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966 5XX XXX XXXX"
                className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-cairo text-sm font-medium text-charcoal mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block font-cairo text-sm font-medium text-charcoal mb-2">
              نوع الحجز
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne"
            >
              <option value="flight">طيران</option>
              <option value="hotel">فندق</option>
              <option value="package">باقة سياحية</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block font-cairo text-sm font-medium text-charcoal mb-2">
              تاريخ السفر المتوقع
            </label>
            <div className="relative">
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label className="block font-cairo text-sm font-medium text-charcoal mb-2">
              عدد المسافرين
            </label>
            <div className="relative">
              <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.travelers}
                onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-cairo text-sm font-medium text-charcoal mb-2">
              ملاحظات إضافية
            </label>
            <div className="relative">
              <MessageSquare className="absolute right-4 top-4 w-5 h-5 text-champagne" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات أو متطلبات خاصة..."
                rows={4}
                className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-charcoal text-white rounded-xl font-cairo font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send size={20} />
                إرسال طلب الحجز
              </>
            )}
          </button>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
