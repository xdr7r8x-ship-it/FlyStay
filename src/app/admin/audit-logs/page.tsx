'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Lock, Search } from 'lucide-react';
import Header from '@/components/layout/Header';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorId: string | null;
  actorRole: string | null;
  ipAddress: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      setAuthState('loading');
      setError(null);

      try {
        const response = await fetch('/api/admin/audit-logs', {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setAuthState('unauthorized');
            return;
          }
          if (response.status === 503) {
            // Service not configured - show graceful error
            setAuthState('error');
            setError('سجل النشاط غير متاح - قاعدة البيانات غير مهيأة');
            return;
          }
          throw new Error('فشل في جلب البيانات');
        }

        const data = await response.json();
        setLogs(data.logs || data.data || []);
        setAuthState('authorized');
      } catch (err) {
        setAuthState('error');
        setError(err instanceof Error ? err.message : 'فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entityType.toLowerCase().includes(searchLower) ||
      (log.actorRole && log.actorRole.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      CREATE: { bg: 'bg-green-100', text: 'text-green-700' },
      UPDATE: { bg: 'bg-blue-100', text: 'text-blue-700' },
      DELETE: { bg: 'bg-red-100', text: 'text-red-700' },
      LOGIN: { bg: 'bg-purple-100', text: 'text-purple-700' },
      LOGOUT: { bg: 'bg-gray-100', text: 'text-gray-700' },
      SEND: { bg: 'bg-orange-100', text: 'text-orange-700' },
      APPROVE: { bg: 'bg-green-100', text: 'text-green-700' },
      REJECT: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const style = styles[action] || { bg: 'bg-sand', text: 'text-charcoal' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-cairo ${style.bg} ${style.text}`}>
        {action}
      </span>
    );
  };

  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-sand rounded w-1/4" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-sand rounded-xl" />)}
            </div>
          </div>
        </div>
      </main>
    );
  }

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
            <p className="font-cairo text-secondary mb-6">هذه الصفحة مخصصة للمسؤول فقط.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl font-cairo">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (authState === 'error') {
    return (
      <main className="min-h-screen bg-ivory">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-mist text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">سجل النشاط غير متاح</h2>
            <p className="font-cairo text-secondary mb-4">{error}</p>
            <p className="font-cairo text-sm text-charcoal/60 mb-4">
              يتطلب سجل النشاط تفعيل قاعدة البيانات وجدول audit_logs.
            </p>
            <Link href="/admin" className="inline-flex items-center gap-2 px-6 py-3 bg-sand text-charcoal rounded-xl font-cairo">
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory pb-8">
      <Header />
      
      <div className="bg-charcoal text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin" className="text-champagne hover:text-champagne/80">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-cairo text-champagne text-sm">لوحة التحكم</span>
          </div>
          <h1 className="font-cairo text-3xl font-bold">سجل النشاط</h1>
          <p className="font-cairo text-white/70 mt-1">عرض العمليات الإدارية الأخيرة</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="p-4 border-b border-mist flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-charcoal" />
              <h2 className="font-cairo font-bold text-charcoal">سجل النشاط</h2>
              <span className="px-2 py-1 bg-sand rounded-full text-xs font-cairo text-secondary">
                {filteredLogs.length} سجل
              </span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث..."
                className="pr-10 pl-4 py-2 border border-mist rounded-lg font-cairo text-sm w-48"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-sand rounded" />)}
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-charcoal/50" />
              </div>
              <p className="font-cairo text-secondary">
                {search ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد سجلات نشاط'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-mist">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-sand/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-sand rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-charcoal/60" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-cairo font-semibold text-charcoal">{log.action}</p>
                          {getActionBadge(log.action)}
                        </div>
                        <p className="font-cairo text-sm text-secondary">
                          {log.entityType}
                          {log.entityId && ` • ${log.entityId.slice(0, 8)}...`}
                          {log.actorRole && ` • ${log.actorRole}`}
                        </p>
                        <p className="font-cairo text-xs text-secondary mt-2">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-champagne/10 rounded-2xl border border-champagne/30">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo text-sm text-charcoal">
                <strong>ملاحظة:</strong> سجل النشاط يعرض العمليات الإدارية الأخيرة.
                جميع العمليات يتم تسجيلها تلقائيًا للحفاظ على الشفافية والأمان.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
