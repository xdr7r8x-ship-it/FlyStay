'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Shield, Calendar, ArrowRight, Lock, CheckCircle, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export default function ProfileEditPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setIsLoggedIn(true);
          // Use only user-safe API data
          setUser({
            id: data.user.id,
            name: data.user.name || data.user.email?.split('@')[0] || 'مستخدم',
            email: data.user.email,
            role: data.user.role,
          });
        }
      }
    } catch {
      // Silent failure - user data not available
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    return 'غير متوفر';
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: 'مدير النظام',
      USER: 'مستخدم',
      GUEST: 'زائر',
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory pb-24">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-champagne animate-spin" />
        </div>
        <BottomNav />
      </main>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <main className="min-h-screen bg-ivory pb-24">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-sand rounded-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-champagne" />
          </div>
          <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">
            غير مصرح لك بالدخول
          </h2>
          <p className="font-cairo text-secondary mb-8 max-w-md mx-auto">
            يرجى تسجيل الدخول للوصول إلى بياناتك الشخصية
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-charcoal text-white rounded-xl font-cairo font-semibold hover:opacity-90 transition-opacity"
          >
            تسجيل الدخول
          </Link>
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
          <div className="flex items-center gap-3 mb-2">
            <Link href="/profile" className="text-champagne hover:text-champagne/80">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">حسابي</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">البيانات الشخصية</h1>
          <p className="font-cairo text-white/70 mt-1">عرض وتعديل بياناتك الشخصية</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User Avatar */}
        <div className="bg-white rounded-2xl border border-mist p-6 mb-6 text-center">
          <div className="w-24 h-24 bg-champagne/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-champagne" />
          </div>
          <h2 className="font-cairo text-xl font-bold text-charcoal">{user.name}</h2>
          <p className="font-cairo text-secondary">{user.email}</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden mb-6">
          <div className="p-4 border-b border-mist bg-sand/50">
            <h3 className="font-cairo font-bold text-charcoal">معلومات الحساب</h3>
          </div>
          
          <div className="divide-y divide-mist">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-champagne" />
              </div>
              <div className="flex-1">
                <p className="font-cairo text-sm text-secondary">الاسم</p>
                <p className="font-cairo text-charcoal">{user.name}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-champagne" />
              </div>
              <div className="flex-1">
                <p className="font-cairo text-sm text-secondary">البريد الإلكتروني</p>
                <p className="font-cairo text-charcoal">{user.email}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-champagne" />
              </div>
              <div className="flex-1">
                <p className="font-cairo text-sm text-secondary">رقم الجوال</p>
                <p className="font-cairo text-charcoal">{user.phone || 'غير مسجل'}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-champagne" />
              </div>
              <div className="flex-1">
                <p className="font-cairo text-sm text-secondary">الدور</p>
                <p className="font-cairo text-charcoal">{getRoleLabel(user.role)}</p>
              </div>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-champagne" />
              </div>
              <div className="flex-1">
                <p className="font-cairo text-sm text-secondary">تاريخ التسجيل</p>
                <p className="font-cairo text-charcoal">{formatDate()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Notice */}
        <div className="bg-champagne/10 rounded-2xl border border-champagne/30 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo text-sm text-charcoal">
                <strong>ملاحظة:</strong> تعديل البيانات الشخصية غير متاح حاليًا من داخل التطبيق.
                يمكن التواصل مع الدعم لتعديل البيانات عند الحاجة.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link 
            href="/profile"
            className="flex items-center gap-2 text-charcoal hover:text-champagne transition-colors font-cairo"
          >
            <ArrowRight className="w-5 h-5" />
            العودة لحسابي
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
