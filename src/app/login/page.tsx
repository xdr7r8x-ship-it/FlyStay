'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    // Redirect to profile
    window.location.href = '/profile';
  };

  return (
    <main className="min-h-screen bg-ivory">
      <Header />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-charcoal hover:text-champagne transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-cairo">العودة للرئيسية</span>
        </Link>
      </div>

      {/* Login Form */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">FlyStay</h1>
          <p className="font-cairo text-secondary">تسجيل الدخول إلى حسابك</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-sand border border-mist rounded-3xl p-8 space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full pr-12 pl-4 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-cairo text-sm font-medium text-charcoal mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-12 pl-12 py-4 bg-ivory border border-mist rounded-xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error font-cairo text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-charcoal text-white rounded-xl font-cairo font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                جاري الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>

          {/* Links */}
          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="font-cairo text-champagne hover:text-charcoal transition-colors">
              نسيت كلمة المرور؟
            </Link>
            <Link href="/register" className="font-cairo text-champagne hover:text-charcoal transition-colors">
              إنشاء حساب جديد
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
