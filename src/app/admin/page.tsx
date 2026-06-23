'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Package, Building2, FileText, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';

interface Stats {
  destinations: number;
  templates: number;
  stayGuides: number;
  requests: number;
  newRequests: number;
  reviewingRequests: number;
}

interface QuickStat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    destinations: 0,
    templates: 0,
    stayGuides: 0,
    requests: 0,
    newRequests: 0,
    reviewingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch destinations count
        const destResponse = await fetch('/api/admin/content/destinations?status=ACTIVE');
        const destData = destResponse.ok ? await destResponse.json() : { data: [] };
        
        // Fetch templates count
        const tempResponse = await fetch('/api/admin/content/templates?status=ACTIVE');
        const tempData = tempResponse.ok ? await tempResponse.json() : { data: [] };
        
        // Fetch stay guides count
        const stayResponse = await fetch('/api/admin/content/stay-guides?status=ACTIVE');
        const stayData = stayResponse.ok ? await stayResponse.json() : { data: [] };
        
        // Fetch requests counts
        const reqResponse = await fetch('/api/admin/travel-requests');
        const reqData = reqResponse.ok ? await reqResponse.json() : { data: [] };
        
        const requests = reqData.data || [];
        const newRequests = requests.filter((r: { status: string }) => r.status === 'NEW').length;
        const reviewingRequests = requests.filter((r: { status: string }) => r.status === 'REVIEWING').length;
        
        setStats({
          destinations: destData.data?.length || 0,
          templates: tempData.data?.length || 0,
          stayGuides: stayData.data?.length || 0,
          requests: requests.length,
          newRequests,
          reviewingRequests,
        });
      } catch (err) {
        setError('فشل في تحميل الإحصائيات');
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  const quickStats: QuickStat[] = [
    { label: 'الوجهات', value: stats.destinations, icon: <MapPin className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'أفكار الرحلات', value: stats.templates, icon: <Package className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
    { label: 'أدلة الإقامة', value: stats.stayGuides, icon: <Building2 className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
    { label: 'طلبات السفر', value: stats.requests, icon: <FileText className="w-6 h-6" />, color: 'bg-orange-50 text-orange-600' },
  ];

  const quickLinks = [
    { href: '/admin/content', label: 'إدارة المحتوى', icon: <FileText className="w-5 h-5" /> },
    { href: '/admin/content/destinations', label: 'الوجهات', icon: <MapPin className="w-5 h-5" /> },
    { href: '/admin/content/templates', label: 'أفكار الرحلات', icon: <Package className="w-5 h-5" /> },
    { href: '/admin/content/stay-guides', label: 'أدلة الإقامة', icon: <Building2 className="w-5 h-5" /> },
    { href: '/admin/requests', label: 'إدارة الطلبات', icon: <Clock className="w-5 h-5" /> },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-sand rounded w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-sand rounded-xl" />)}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="font-cairo text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />
      
      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ArrowLeft className="w-5 h-5 text-champagne" />
            <span className="font-cairo text-champagne text-sm">لوحة التحكم</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">FlyStay Admin</h1>
          <p className="font-cairo text-white/70 mt-1">نظرة عامة على المحتوى والطلبات</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-mist shadow-sm">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="font-cairo text-3xl font-bold text-charcoal">{stat.value}</p>
              <p className="font-cairo text-sm text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Request Alerts */}
        {(stats.newRequests > 0 || stats.reviewingRequests > 0) && (
          <div className="bg-champagne/10 rounded-2xl p-4 border border-champagne/30 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-champagne" />
              </div>
              <div className="flex-1">
                <p className="font-cairo font-semibold text-charcoal">طلبات تحتاج متابعة</p>
                <p className="font-cairo text-sm text-secondary">
                  {stats.newRequests > 0 && `${stats.newRequests} طلب جديد`}
                  {stats.newRequests > 0 && stats.reviewingRequests > 0 && ' • '}
                  {stats.reviewingRequests > 0 && `${stats.reviewingRequests} قيد المراجعة`}
                </p>
              </div>
              <Link 
                href="/admin/requests"
                className="px-4 py-2 bg-champagne text-charcoal rounded-xl font-cairo text-sm font-semibold hover:bg-champagne/90"
              >
                عرض الكل
              </Link>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="p-4 border-b border-mist">
            <h2 className="font-cairo font-bold text-charcoal">روابط سريعة</h2>
          </div>
          <div className="divide-y divide-mist">
            {quickLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-4 hover:bg-sand/30 transition-colors"
              >
                <div className="w-10 h-10 bg-sand rounded-xl flex items-center justify-center text-charcoal">
                  {link.icon}
                </div>
                <span className="font-cairo text-charcoal">{link.label}</span>
                <ArrowLeft className="w-5 h-5 text-secondary mr-auto" />
              </Link>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-sand/50 rounded-2xl border border-mist">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo text-sm text-charcoal">
                <strong>ملاحظة:</strong> هذا لوحة تحكم المسؤول. جميع العمليات يتم تسجيلها في AuditLog.
                لا تعرض هذه الصفحة أي أسرار أو كلمات مرور أو روابط قاعدة البيانات.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
