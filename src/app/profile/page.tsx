'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, ChevronLeft, LogOut, Settings, Shield, HelpCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function ProfilePage() {
  const [isLoggedIn] = useState(false); // Mock state

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-ivory pb-24">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-sand rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-champagne" />
          </div>
          <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">
            تسجيل الدخول
          </h2>
          <p className="font-cairo text-secondary mb-8 max-w-md mx-auto">
            سجل دخولك للوصول إلى ملفك الشخصي ومتابعة طلباتك
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-4 bg-charcoal text-white rounded-xl font-cairo font-semibold hover:opacity-90 transition-opacity"
          >
            تسجيل الدخول
          </a>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-24">
      <Header />

      {/* Profile Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-20 h-20 bg-champagne rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-charcoal" />
          </div>
          <div>
            <h1 className="font-cairo text-2xl font-bold">أحمد محمد</h1>
            <p className="font-cairo text-champagne">ahmed@email.com</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-sand border border-mist rounded-2xl overflow-hidden">
          <MenuItem icon={User} label="البيانات الشخصية" href="/profile/edit" />
          <MenuItem icon={Mail} label="البريد الإلكتروني" href="/profile/email" />
          <MenuItem icon={Phone} label="رقم الجوال" href="/profile/phone" />
          <MenuItem icon={MapPin} label="العناوين المحفوظة" href="/profile/addresses" />
        </div>

        <div className="bg-sand border border-mist rounded-2xl overflow-hidden mt-4">
          <MenuItem icon={Settings} label="الإعدادات" href="/settings" />
          <MenuItem icon={Shield} label="الخصوصية والأمان" href="/privacy" />
          <MenuItem icon={HelpCircle} label="المساعدة والدعم" href="/help" />
        </div>

        {/* Only show logout for logged-in users */}
        {isLoggedIn && (
          <button className="w-full mt-6 py-4 bg-error/10 text-error rounded-xl font-cairo font-medium flex items-center justify-center gap-2 hover:bg-error/20 transition-colors">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function MenuItem({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 px-5 py-4 hover:bg-mist/50 transition-colors border-b border-mist last:border-b-0"
    >
      <Icon className="w-5 h-5 text-champagne" />
      <span className="flex-1 font-cairo text-charcoal">{label}</span>
      <ChevronLeft className="w-5 h-5 text-muted" />
    </a>
  );
}
