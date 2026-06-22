'use client';

import { useState, useEffect } from 'react';
import { User, ChevronLeft, LogOut, Key, Check, X, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (e) {
      window.location.href = '/';
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'حدث خطأ' });
      }
    } catch (e) {
      setPasswordMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory pb-24">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-champagne border-t-transparent rounded-full" />
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
            <h1 className="font-cairo text-2xl font-bold">{user.name}</h1>
            <p className="font-cairo text-champagne">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-champagne/20 text-champagne text-xs rounded-full font-cairo">
                مدير النظام
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-sand border border-mist rounded-2xl overflow-hidden">
          <MenuItem icon={User} label="البيانات الشخصية" href="/profile/edit" />
          <MenuItem icon={Key} label="الأمان - تغيير كلمة المرور" onClick={() => setShowPasswordForm(!showPasswordForm)} isActive={showPasswordForm} />
        </div>

        {showPasswordForm && (
          <div className="bg-sand border border-mist rounded-2xl p-5 mt-4">
            <h3 className="font-cairo text-lg font-bold text-charcoal mb-4">تغيير كلمة المرور</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-1">كلمة المرور الحالية</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne"
                    required
                  />
                </div>
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-secondary mt-1">8 أحرف على الأقل، حرف كبير، حرف صغير، رقم</p>
                </div>
                <div>
                  <label className="block font-cairo text-sm text-secondary mb-1">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-ivory border border-mist rounded-xl font-cairo text-charcoal focus:outline-none focus:border-champagne"
                    required
                  />
                </div>
              </div>

              {passwordMessage && (
                <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                  {passwordMessage.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-cairo text-sm">{passwordMessage.text}</span>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-3 bg-charcoal text-white rounded-xl font-cairo font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {passwordLoading ? 'جارٍ التغيير...' : 'تغيير كلمة المرور'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasswordForm(false); setPasswordMessage(null); }}
                  className="px-6 py-3 bg-mist text-charcoal rounded-xl font-cairo font-semibold hover:bg-mist/80 transition-opacity"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 py-4 bg-error/10 text-error rounded-xl font-cairo font-medium flex items-center justify-center gap-2 hover:bg-error/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

function MenuItem({ icon: Icon, label, href, onClick, isActive }: { icon: any; label: string; href?: string; onClick?: () => void; isActive?: boolean }) {
  const content = (
    <div className={`flex items-center gap-4 px-5 py-4 hover:bg-mist/50 transition-colors border-b border-mist last:border-b-0 ${isActive ? 'bg-champagne/10' : ''}`}>
      <Icon className="w-5 h-5 text-champagne" />
      <span className="flex-1 font-cairo text-charcoal">{label}</span>
      <ChevronLeft className={`w-5 h-5 text-muted transition-transform ${isActive ? 'rotate-90' : ''}`} />
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="w-full text-right">{content}</button>;
  }

  return <a href={href}>{content}</a>;
}
