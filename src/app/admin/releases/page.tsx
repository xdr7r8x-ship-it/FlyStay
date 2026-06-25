'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Package, GitCommit, Clock, CheckCircle, AlertTriangle, Copy, Check, ExternalLink, Lock, Rocket } from 'lucide-react';

interface Release {
  version: string;
  commit: string;
  date: string;
  phase: string;
  status: 'frozen' | 'active' | 'planning';
  features: string[];
  bugFixes: string[];
  deferred: string[];
  deploymentUrl?: string;
}

const CURRENT_RELEASE: Release = {
  version: '1.0.0',
  commit: '5617f3c',
  date: '2026-06-25',
  phase: 'Phase 8 - PRO Admin Panel',
  status: 'active',
  features: [
    'Professional admin dashboard with KPIs',
    'Advanced admin sidebar with navigation',
    'Admin topbar with search and user menu',
    'Messages center for unified communication',
    'Roles and permissions management',
    'Offers management system',
    'Reports and analytics dashboard',
    'System settings management',
    'Security center with audit logs',
    'System health monitoring',
  ],
  bugFixes: [
    'Removed UI console errors',
    'Fixed profile data source security',
  ],
  deferred: [
    'Full support tickets migration (DB deploy required)',
    'Advanced permissions system (schema ready)',
    'Real-time notifications (requires WebSocket)',
  ],
};

const PAST_RELEASES: Release[] = [
  {
    version: '0.9.0',
    commit: '96c5760',
    date: '2026-06-20',
    phase: 'Phase 7 - App Buttons',
    status: 'frozen',
    features: [
      'Complete app buttons and flows',
      'Bottom navigation improvements',
      'User profile management',
    ],
    bugFixes: [],
    deferred: [],
  },
];

export default function ReleasesPage() {
  const [copied, setCopied] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN')) {
          setAuthState('authorized');
        } else {
          setAuthState('unauthorized');
        }
      } else {
        setAuthState('unauthorized');
      }
    } catch {
      setAuthState('unauthorized');
    }
  };

  const handleCopyInfo = () => {
    const info = `FlyStay Release Information
==============================
Version: ${CURRENT_RELEASE.version}
Commit: ${CURRENT_RELEASE.commit}
Date: ${CURRENT_RELEASE.date}
Phase: ${CURRENT_RELEASE.phase}
Status: ${CURRENT_RELEASE.status.toUpperCase()}

Features:
${CURRENT_RELEASE.features.map(f => `- ${f}`).join('\n')}

Bug Fixes:
${CURRENT_RELEASE.bugFixes.map(f => `- ${f}`).join('\n')}

Deferred:
${CURRENT_RELEASE.deferred.map(f => `- ${f}`).join('\n')}
`;
    navigator.clipboard.writeText(info);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authState === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-champagne border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-charcoal">الإصدارات</h1>
          <p className="font-cairo text-secondary mt-1">معلومات الإصدارات والتغييرات</p>
        </div>
        <button
          onClick={handleCopyInfo}
          className="px-4 py-2 bg-champagne text-charcoal rounded-xl font-cairo text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'تم النسخ' : 'نسخ معلومات الإصدار'}</span>
        </button>
      </div>

      {/* Current Release */}
      <div className="bg-gradient-to-br from-charcoal to-charcoal/90 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-champagne text-charcoal text-xs font-cairo font-semibold rounded-full">
                {CURRENT_RELEASE.status === 'active' ? 'نشط' : 'مجمد'}
              </span>
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-cairo rounded-full">
                Phase 8
              </span>
            </div>
            <h2 className="font-cairo text-2xl font-bold mb-1">إصدار {CURRENT_RELEASE.version}</h2>
            <p className="font-cairo text-white/70">{CURRENT_RELEASE.phase}</p>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 text-white/70 mb-1">
              <GitCommit className="w-4 h-4" />
              <span className="font-mono text-sm">{CURRENT_RELEASE.commit.slice(0, 7)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="w-4 h-4" />
              <span className="font-cairo text-sm">{CURRENT_RELEASE.date}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-cairo text-sm text-white/70 mb-2">المميزات الجديدة</p>
            <p className="font-cairo text-2xl font-bold">{CURRENT_RELEASE.features.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-cairo text-sm text-white/70 mb-2">إصلاحات الأخطاء</p>
            <p className="font-cairo text-2xl font-bold">{CURRENT_RELEASE.bugFixes.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-cairo text-sm text-white/70 mb-2">مؤجلة</p>
            <p className="font-cairo text-2xl font-bold">{CURRENT_RELEASE.deferred.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Features */}
        <div className="bg-white rounded-2xl border border-mist p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <h3 className="font-cairo font-semibold text-charcoal">المميزات الجديدة</h3>
          </div>
          <ul className="space-y-3">
            {CURRENT_RELEASE.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span className="font-cairo text-sm text-charcoal">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bug Fixes */}
        <div className="bg-white rounded-2xl border border-mist p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-cairo font-semibold text-charcoal">إصلاحات الأخطاء</h3>
          </div>
          {CURRENT_RELEASE.bugFixes.length > 0 ? (
            <ul className="space-y-3">
              {CURRENT_RELEASE.bugFixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="font-cairo text-sm text-charcoal">{fix}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-cairo text-sm text-secondary text-center py-8">لا توجد إصلاحات</p>
          )}
        </div>

        {/* Deferred */}
        <div className="bg-white rounded-2xl border border-mist p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <h3 className="font-cairo font-semibold text-charcoal">مؤجلة للتالي</h3>
          </div>
          {CURRENT_RELEASE.deferred.length > 0 ? (
            <ul className="space-y-3">
              {CURRENT_RELEASE.deferred.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <span className="font-cairo text-sm text-charcoal">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-cairo text-sm text-secondary text-center py-8">لا توجد عناصر مؤجلة</p>
          )}
        </div>
      </div>

      {/* Past Releases */}
      <div className="mt-8">
        <h2 className="font-cairo text-xl font-bold text-charcoal mb-4">الإصدارات السابقة</h2>
        <div className="space-y-4">
          {PAST_RELEASES.map((release, index) => (
            <div key={index} className="bg-white rounded-2xl border border-mist p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-sand text-secondary text-xs font-cairo font-semibold rounded-full">
                    {release.status === 'frozen' ? 'مجمد' : 'سابق'}
                  </span>
                  <h3 className="font-cairo font-semibold text-charcoal">إصدار {release.version}</h3>
                  <span className="font-cairo text-sm text-secondary">{release.phase}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-secondary">
                  <span className="font-mono">{release.commit.slice(0, 7)}</span>
                  <span>{release.date}</span>
                </div>
              </div>
              {release.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {release.features.map((feature, i) => (
                    <span key={i} className="px-2 py-1 bg-champagne/10 text-champagne text-xs font-cairo rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Release Freeze Status */}
      <div className="mt-8 bg-success/10 border border-success/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-cairo font-bold text-charcoal">حالة التجميد</h3>
            <p className="font-cairo text-sm text-secondary mt-1">
              الإصدار الحالي {CURRENT_RELEASE.version} جاهز للتجميد النهائي
            </p>
          </div>
          <span className="px-4 py-2 bg-success text-white font-cairo font-semibold rounded-xl">
            READY TO FREEZE
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
