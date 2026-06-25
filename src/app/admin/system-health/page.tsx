'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Activity, RefreshCw, CheckCircle, XCircle, AlertTriangle, Database, Server, Lock, Clock, GitCommit, Copy, Check } from 'lucide-react';

interface HealthStatus {
  database: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  auth: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  responseTime: number;
  buildCommit: string;
  buildDate: string;
  environment: string;
  version: string;
  uptime: string;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  endpoint: string;
  statusCode: number;
  error: string;
  count: number;
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthStatus>({
    database: 'healthy',
    api: 'healthy',
    auth: 'healthy',
    lastChecked: new Date().toISOString(),
    responseTime: 0,
    buildCommit: '5617f3c',
    buildDate: '2026-06-25',
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    uptime: '0h 0m',
  });
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
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
          fetchHealthStatus();
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

  const fetchHealthStatus = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      // Check database connectivity
      const dbRes = await fetch('/api/admin/content/destinations?limit=1', { credentials: 'include' });
      const dbStatus = dbRes.ok ? 'healthy' : 'degraded';

      // Check API
      const apiRes = await fetch('/api/auth/me', { credentials: 'include' });
      const apiStatus = apiRes.ok ? 'healthy' : 'degraded';

      // Check auth
      const authStatus = apiStatus;

      // Calculate response time
      const responseTime = Date.now() - startTime;

      setHealth(prev => ({
        ...prev,
        database: dbStatus,
        api: apiStatus,
        auth: authStatus,
        lastChecked: new Date().toISOString(),
        responseTime,
      }));
    } catch {
      setHealth(prev => ({
        ...prev,
        database: 'down',
        api: 'down',
        auth: 'down',
        lastChecked: new Date().toISOString(),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setChecking(true);
    await fetchHealthStatus();
    setChecking(false);
  };

  const handleCopyReport = () => {
    const report = `FlyStay System Health Report
=============================
Generated: ${new Date().toLocaleString('ar-SA')}
Environment: ${health.environment}
Version: ${health.version}
Build Commit: ${health.buildCommit}

Status:
- Database: ${health.database.toUpperCase()}
- API: ${health.api.toUpperCase()}
- Auth: ${health.auth.toUpperCase()}
- Response Time: ${health.responseTime}ms

Environment Info:
- Node Env: ${health.environment}
- Build Date: ${health.buildDate}
- Commit: ${health.buildCommit}
`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'degraded':
        return <AlertTriangle className="w-6 h-6 text-warning" />;
      case 'down':
        return <XCircle className="w-6 h-6 text-error" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return 'bg-success/10 border-success/20';
      case 'degraded':
        return 'bg-warning/10 border-warning/20';
      case 'down':
        return 'bg-error/10 border-error/20';
    }
  };

  const getStatusLabel = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return { text: 'سليم', color: 'text-success' };
      case 'degraded':
        return { text: 'متأثر', color: 'text-warning' };
      case 'down':
        return { text: 'متوقف', color: 'text-error' };
    }
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
          <h1 className="font-cairo text-2xl font-bold text-charcoal">صحة النظام</h1>
          <p className="font-cairo text-secondary mt-1">مراقبة حالة الخدمات والاتصالات</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopyReport}
            className="px-4 py-2 bg-sand text-charcoal rounded-xl font-cairo text-sm hover:bg-sand/80 transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={checking || loading}
            className="px-4 py-2 bg-champagne text-charcoal rounded-xl font-cairo text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${checking || loading ? 'animate-spin' : ''}`} />
            <span>إعادة الفحص</span>
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Database */}
        <div className={`rounded-2xl border p-6 ${getStatusColor(health.database)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-charcoal" />
              <span className="font-cairo font-semibold text-charcoal">قاعدة البيانات</span>
            </div>
            {getStatusIcon(health.database)}
          </div>
          <p className={`font-cairo text-lg font-bold ${getStatusLabel(health.database).color}`}>
            {getStatusLabel(health.database).text}
          </p>
        </div>

        {/* API */}
        <div className={`rounded-2xl border p-6 ${getStatusColor(health.api)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-charcoal" />
              <span className="font-cairo font-semibold text-charcoal">واجهة API</span>
            </div>
            {getStatusIcon(health.api)}
          </div>
          <p className={`font-cairo text-lg font-bold ${getStatusLabel(health.api).color}`}>
            {getStatusLabel(health.api).text}
          </p>
        </div>

        {/* Auth */}
        <div className={`rounded-2xl border p-6 ${getStatusColor(health.auth)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-charcoal" />
              <span className="font-cairo font-semibold text-charcoal">النظام</span>
            </div>
            {getStatusIcon(health.auth)}
          </div>
          <p className={`font-cairo text-lg font-bold ${getStatusLabel(health.auth).color}`}>
            {getStatusLabel(health.auth).text}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-mist p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-champagne" />
            <span className="font-cairo text-xs text-secondary">وقت الاستجابة</span>
          </div>
          <p className="font-cairo text-2xl font-bold text-charcoal">{health.responseTime}ms</p>
        </div>

        <div className="bg-white rounded-2xl border border-mist p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-champagne" />
            <span className="font-cairo text-xs text-secondary">آخر فحص</span>
          </div>
          <p className="font-cairo text-sm font-bold text-charcoal">
            {new Date(health.lastChecked).toLocaleTimeString('ar-SA')}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-mist p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitCommit className="w-4 h-4 text-champagne" />
            <span className="font-cairo text-xs text-secondary">Commit</span>
          </div>
          <p className="font-cairo text-sm font-bold text-charcoal font-mono">
            {health.buildCommit.slice(0, 7)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-mist p-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-champagne" />
            <span className="font-cairo text-xs text-secondary">البيئة</span>
          </div>
          <p className="font-cairo text-sm font-bold text-charcoal uppercase">
            {health.environment}
          </p>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-2xl border border-mist p-6">
        <h2 className="font-cairo text-lg font-semibold text-charcoal mb-4">معلومات البيئة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="font-cairo text-xs text-secondary mb-1">Node Environment</p>
            <p className="font-cairo text-sm font-semibold text-charcoal">{health.environment}</p>
          </div>
          <div>
            <p className="font-cairo text-xs text-secondary mb-1">Version</p>
            <p className="font-cairo text-sm font-semibold text-charcoal">{health.version}</p>
          </div>
          <div>
            <p className="font-cairo text-xs text-secondary mb-1">Build Date</p>
            <p className="font-cairo text-sm font-semibold text-charcoal">{health.buildDate}</p>
          </div>
          <div>
            <p className="font-cairo text-xs text-secondary mb-1">Build Commit</p>
            <p className="font-cairo text-sm font-semibold text-charcoal font-mono">{health.buildCommit}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
