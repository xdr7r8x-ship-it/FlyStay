'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AlertTriangle, AlertCircle, RefreshCw, XCircle, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';

interface QualityIssue {
  id: string;
  entityType: string;
  entityName: string;
  issueType: string;
  issueDetails: string;
  severity: 'critical' | 'warning' | 'info';
}

interface QualitySummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
}

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

export default function ContentQualityPage() {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [summary, setSummary] = useState<QualitySummary>({ total: 0, critical: 0, warning: 0, info: 0 });
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadIssues = useCallback(async () => {
    setAuthState('loading');
    setError(null);

    try {
      const response = await fetch('/api/admin/content/quality', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          setIssues([]);
          setSummary({ total: 0, critical: 0, warning: 0, info: 0 });
          return;
        }
        throw new Error('فشل في تحميل المشاكل');
      }
      
      const data = await response.json();
      setIssues(data.data || []);
      setSummary(data.summary || { total: 0, critical: 0, warning: 0, info: 0 });
      setAuthState('authorized');
    } catch (err) {
      setAuthState('error');
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      setIssues([]);
      setSummary({ total: 0, critical: 0, warning: 0, info: 0 });
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleDeactivate = async (issue: QualityIssue) => {
    if (authState !== 'authorized') return;
    
    setProcessing(issue.id);

    try {
      const response = await fetch('/api/admin/content/quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: issue.id,
          entityType: issue.entityType,
          action: 'deactivate',
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthState('unauthorized');
          setProcessing(null);
          return;
        }
        throw new Error('فشل في التعطيل');
      }

      await loadIssues();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setProcessing(null);
    }
  };

  // Loading state
  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-sand rounded w-1/4" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-sand rounded-xl" />)}
            </div>
            <div className="h-64 bg-sand rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  // Unauthorized state
  if (authState === 'unauthorized') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-cairo text-2xl font-bold text-charcoal mb-4">غير مصرح لك بالدخول</h2>
            <p className="font-cairo text-secondary mb-6">هذه الصفحة مخصصة للمسؤول فقط. يرجى تسجيل الدخول بحساب له صلاحية الأدمن.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (authState === 'error') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">خطأ في الخادم</h2>
            <p className="font-cairo text-secondary mb-4">{error}</p>
            <button onClick={loadIssues} className="px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>
    );
  }

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const severityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'حرج';
      case 'warning': return 'تحذير';
      default: return 'معلومة';
    }
  };

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />
      
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin" className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">لوحة التحكم</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">فحص جودة المحتوى</h1>
          <p className="font-cairo text-white/70 mt-1">اكتشاف المشاكل وتفعيل/تعطيل المحتوى</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-sand bg-white p-4">
            <p className="font-cairo text-xs text-muted">الإجمالي</p>
            <strong className="font-cairo text-2xl text-charcoal">{summary.total}</strong>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-cairo text-xs text-red-600">حرج</p>
            <strong className="font-cairo text-2xl text-red-600">{summary.critical}</strong>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-cairo text-xs text-yellow-600">تحذير</p>
            <strong className="font-cairo text-2xl text-yellow-600">{summary.warning}</strong>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="font-cairo text-xs text-blue-600">معلومة</p>
            <strong className="font-cairo text-2xl text-blue-600">{summary.info}</strong>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={loadIssues}
            className="inline-flex items-center gap-2 rounded-md bg-charcoal px-4 py-2 font-cairo text-sm text-white"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث الفحص
          </button>
        </div>

        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="font-cairo text-xl font-bold text-charcoal mb-2">لا توجد مشاكل</p>
            <p className="font-cairo text-secondary">جميع المحتويات سليمة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-xl border border-mist p-4 flex items-start gap-4"
              >
                <div className="flex-shrink-0 mt-1">
                  {severityIcon(issue.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-cairo text-xs px-2 py-0.5 rounded-full ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {severityLabel(issue.severity)}
                    </span>
                    <span className="font-cairo text-xs text-muted">{issue.entityType}</span>
                  </div>
                  <p className="font-cairo text-sm font-bold text-charcoal mb-1">{issue.entityName}</p>
                  <p className="font-cairo text-xs text-secondary">{issue.issueType}: {issue.issueDetails}</p>
                </div>
                {issue.severity === 'critical' || issue.severity === 'warning' ? (
                  <button
                    onClick={() => handleDeactivate(issue)}
                    disabled={processing === issue.id}
                    className="flex-shrink-0 rounded-md bg-red-100 px-3 py-2 font-cairo text-xs text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    {processing === issue.id ? 'جاري...' : 'تعطيل'}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="mt-6 p-4 bg-sand/50 rounded-xl border border-mist">
          <p className="font-cairo text-xs text-secondary">
            <strong>ملاحظة:</strong> التعطيل يعني تغيير الحالة إلى INACTIVE وليس حذف البيانات. يمكن إعادة تفعيلها لاحقًا.
          </p>
        </div>
      </div>
    </main>
  );
}
