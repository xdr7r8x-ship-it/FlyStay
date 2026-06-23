'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info, RefreshCw, XCircle, CheckCircle, ArrowLeft } from 'lucide-react';
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

export default function ContentQualityPage() {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [summary, setSummary] = useState<QualitySummary>({ total: 0, critical: 0, warning: 0, info: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/content/quality');
      if (!response.ok) {
        throw new Error('فشل في تحميل المشاكل');
      }
      const data = await response.json();
      setIssues(data.data || []);
      setSummary(data.summary || { total: 0, critical: 0, warning: 0, info: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleDeactivate = async (issue: QualityIssue) => {
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
      });
      
      if (!response.ok) {
        throw new Error('فشل في التعطيل');
      }
      
      // Reload issues
      await loadIssues();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setProcessing(null);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const entityTypeLabels: Record<string, string> = {
    DESTINATION: 'الوجهات',
    TEMPLATE: 'أفكار الرحلات',
    STAY_GUIDE: 'أدلة الإقامة',
  };

  const issueTypeLabels: Record<string, string> = {
    TEST_SLUG: 'slug اختبار',
    TEST_NAME: 'اسم اختبار',
    MISSING_SUMMARY: 'ملخص ناقص',
    MISSING_DESCRIPTION: 'وصف ناقص',
    MISSING_TRAVEL_STYLES: 'أنماط سفر فارغة',
    MISSING_BEST_FOR: 'مناسب لـ فارغ',
    FORBIDDEN_PHRASE: 'عبارة محظورة',
  };

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />
      
      {/* Page Header */}
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/content" className="text-champagne hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">إدارة المحتوى</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">فحص جودة المحتوى</h1>
          <p className="font-cairo text-white/70 mt-1">تحقق من مشاكل الجودة في المحتوى</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-mist shadow-sm">
            <p className="font-cairo text-sm text-secondary mb-1">الإجمالي</p>
            <p className="font-cairo text-3xl font-bold text-charcoal">{summary.total}</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-5 border border-red-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="font-cairo text-sm text-red-700">حرجة</p>
            </div>
            <p className="font-cairo text-3xl font-bold text-red-600">{summary.critical}</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <p className="font-cairo text-sm text-yellow-700">تحذير</p>
            </div>
            <p className="font-cairo text-3xl font-bold text-yellow-600">{summary.warning}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-blue-500" />
              <p className="font-cairo text-sm text-blue-700">معلومات</p>
            </div>
            <p className="font-cairo text-3xl font-bold text-blue-600">{summary.info}</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={loadIssues}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl font-cairo text-sm hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <div className="w-12 h-12 border-4 border-champagne border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-cairo text-secondary">جاري التحميل...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="font-cairo text-red-600">{error}</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="font-cairo text-xl font-bold text-charcoal mb-2">لا توجد مشاكل!</p>
            <p className="font-cairo text-secondary">جميع المحتوى يمر بمراجعة الجودة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id + issue.issueType}
                className={`rounded-2xl p-4 border ${getSeverityBg(issue.severity)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(issue.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-cairo text-sm font-semibold text-charcoal">
                        {entityTypeLabels[issue.entityType] || issue.entityType}
                      </span>
                      <span className="font-cairo text-xs px-2 py-0.5 bg-white/50 rounded">
                        {issue.entityName}
                      </span>
                    </div>
                    <p className="font-cairo text-sm text-charcoal">
                      <strong>{issueTypeLabels[issue.issueType] || issue.issueType}:</strong>{' '}
                      {issue.issueDetails}
                    </p>
                  </div>
                  {issue.severity === 'critical' && (
                    <button
                      onClick={() => handleDeactivate(issue)}
                      disabled={processing === issue.id}
                      className="flex-shrink-0 px-4 py-2 bg-red-500 text-white rounded-xl font-cairo text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
                    >
                      {processing === issue.id ? '...' : 'تعطيل'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-4 bg-sand/50 rounded-2xl border border-mist">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo text-sm text-charcoal">
                <strong>ملاحظة:</strong> عمليات التعطيل فقط تحول الحالة إلى INACTIVE ولا تحذف نهائيًا.
                يمكن تفعيل المحتوى مرة أخرى من صفحات الإدارة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
