'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Lock, Shield, Clock, AlertTriangle, CheckCircle, User, Download, RefreshCw, Activity, LogIn } from 'lucide-react';

interface LoginEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
}

interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export default function SecurityCenterPage() {
  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logins' | 'events'>('logins');
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
          fetchSecurityData();
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

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Fetch login events from audit logs
      const res = await fetch('/api/admin/audit-logs?action=login&limit=20', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLoginEvents(data.logs?.map((log: any) => ({
          id: log.id,
          userId: log.actorId || '',
          userName: 'مدير النظام',
          userEmail: 'admin@flystay.com',
          ipAddress: log.ipAddress || 'غير متوفر',
          userAgent: log.userAgent || 'غير متوفر',
          timestamp: log.createdAt,
          success: log.details?.success !== false,
        })) || []);
      } else {
        setLoginEvents([]);
      }

      // Fetch security-related audit events
      const secRes = await fetch('/api/admin/audit-logs?limit=50', { credentials: 'include' });
      if (secRes.ok) {
        const secData = await secRes.json();
        setSecurityEvents(secData.logs?.filter((log: any) => 
          ['security', 'permission', 'role', 'settings'].some(key => 
            log.entityType?.toLowerCase().includes(key) || log.action?.toLowerCase().includes(key)
          )
        ).map((log: any) => ({
          id: log.id,
          type: log.action,
          description: `تم ${log.action} على ${log.entityType}`,
          userId: log.actorId,
          userName: 'مدير النظام',
          ipAddress: log.ipAddress,
          timestamp: log.createdAt,
          severity: 'medium' as const,
        })) || []);
      }
    } catch {
      setLoginEvents([]);
      setSecurityEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = activeTab === 'logins' ? loginEvents : securityEvents;
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (authState === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-champagne animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-charcoal">مركز الأمان</h1>
          <p className="font-cairo text-secondary mt-1">مراقبة وتسجيل الأنشطة الأمنية</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSecurityData}
            disabled={loading}
            className="px-4 py-2 bg-sand text-charcoal rounded-xl font-cairo text-sm hover:bg-sand/80 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-champagne text-charcoal rounded-xl font-cairo text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>تصدير</span>
          </button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-mist p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="font-cairo text-2xl font-bold text-charcoal">{loginEvents.filter(e => e.success).length}</p>
              <p className="font-cairo text-sm text-secondary">تسجيل دخول ناجح</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-mist p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="font-cairo text-2xl font-bold text-charcoal">{loginEvents.filter(e => !e.success).length}</p>
              <p className="font-cairo text-sm text-secondary">محاولة فاشلة</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-mist p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-champagne/10 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-champagne" />
            </div>
            <div>
              <p className="font-cairo text-2xl font-bold text-charcoal">{securityEvents.length}</p>
              <p className="font-cairo text-sm text-secondary">حدث أمني</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('logins')}
          className={`px-4 py-2 rounded-xl font-cairo text-sm transition-colors ${
            activeTab === 'logins'
              ? 'bg-champagne text-charcoal font-semibold'
              : 'bg-sand/50 text-charcoal hover:bg-sand'
          }`}
        >
          سجلات الدخول
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl font-cairo text-sm transition-colors ${
            activeTab === 'events'
              ? 'bg-champagne text-charcoal font-semibold'
              : 'bg-sand/50 text-charcoal hover:bg-sand'
          }`}
        >
          الأحداث الأمنية
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-mist overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sand/50">
              <tr>
                {activeTab === 'logins' ? (
                  <>
                    <th className="px-4 py-3 text-right font-cairo text-sm text-charcoal">المستخدم</th>
                    <th className="px-4 py-3 text-right font-cairo text-sm text-charcoal">الحالة</th>
                    <th className="px-4 py-3 text-right font-cairo text-sm text-charcoal">عنوان IP</th>
                    <th className="px-4 py-3 text-right font-cairo text-sm text-charcoal">الوقت</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-right font-cairo text-sm text-charcoal">الحدث</th>
                    <th className="px-4 py-3 text-right font-cairo text-sm text-charcoal">الوصف</th>
                    <th className="px-4 py-3 text-right font-cairo text-sm text-charcoal">المستخدم</th>
                    <th className="px-4 py-3 text-right font-cairo text-sm text-charcoal">الوقت</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <RefreshCw className="w-6 h-6 text-champagne animate-spin mx-auto" />
                  </td>
                </tr>
              ) : activeTab === 'logins' ? (
                loginEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <LogIn className="w-12 h-12 text-muted mx-auto mb-3" />
                      <p className="font-cairo text-secondary">لا توجد سجلات</p>
                    </td>
                  </tr>
                ) : (
                  loginEvents.map(event => (
                    <tr key={event.id} className="hover:bg-sand/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-champagne/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-champagne" />
                          </div>
                          <div>
                            <p className="font-cairo text-sm text-charcoal">{event.userName}</p>
                            <p className="font-cairo text-xs text-secondary">{event.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-cairo ${
                          event.success
                            ? 'bg-success/10 text-success'
                            : 'bg-error/10 text-error'
                        }`}>
                          {event.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {event.success ? 'نجاح' : 'فشل'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-secondary">{event.ipAddress}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-cairo text-xs text-secondary">
                          {new Date(event.timestamp).toLocaleString('ar-SA')}
                        </span>
                      </td>
                    </tr>
                  ))
                )
              ) : securityEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Shield className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="font-cairo text-secondary">لا توجد أحداث أمنية</p>
                  </td>
                </tr>
              ) : (
                securityEvents.map(event => (
                  <tr key={event.id} className="hover:bg-sand/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-cairo ${
                        event.severity === 'high'
                          ? 'bg-error/10 text-error'
                          : event.severity === 'medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-sand text-secondary'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-cairo text-sm text-charcoal">{event.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-cairo text-sm text-charcoal">{event.userName || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-cairo text-xs text-secondary">
                        {new Date(event.timestamp).toLocaleString('ar-SA')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
