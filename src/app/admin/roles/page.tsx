'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Shield, Check, X, RefreshCw, Save, Lock } from 'lucide-react';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT', 'CONTENT_MANAGER', 'VIEWER'];

const PERMISSIONS: Record<string, { label: string; group: string }> = {
  'admin.dashboard.view': { label: 'عرض لوحة التحكم', group: 'لوحة التحكم' },
  'requests.view': { label: 'عرض الطلبات', group: 'الطلبات' },
  'requests.update': { label: 'تحديث الطلبات', group: 'الطلبات' },
  'requests.assign': { label: 'تعيين مسؤول', group: 'الطلبات' },
  'requests.export': { label: 'تصدير الطلبات', group: 'الطلبات' },
  'messages.view': { label: 'عرض الرسائل', group: 'الرسائل' },
  'messages.reply': { label: 'الرد على الرسائل', group: 'الرسائل' },
  'support.view': { label: 'عرض الدعم', group: 'الدعم' },
  'support.reply': { label: 'الرد على التذاكر', group: 'الدعم' },
  'support.close': { label: 'إغلاق التذاكر', group: 'الدعم' },
  'users.view': { label: 'عرض المستخدمين', group: 'المستخدمين' },
  'users.update': { label: 'تحديث المستخدمين', group: 'المستخدمين' },
  'users.change_role': { label: 'تغيير الأدوار', group: 'المستخدمين' },
  'content.view': { label: 'عرض المحتوى', group: 'المحتوى' },
  'content.create': { label: 'إنشاء محتوى', group: 'المحتوى' },
  'content.update': { label: 'تحديث المحتوى', group: 'المحتوى' },
  'content.delete': { label: 'حذف المحتوى', group: 'المحتوى' },
  'notifications.view': { label: 'عرض الإشعارات', group: 'الإشعارات' },
  'notifications.create': { label: 'إنشاء إشعارات', group: 'الإشعارات' },
  'reports.view': { label: 'عرض التقارير', group: 'التقارير' },
  'settings.view': { label: 'عرض الإعدادات', group: 'الإعدادات' },
  'settings.update': { label: 'تحديث الإعدادات', group: 'الإعدادات' },
  'audit.view': { label: 'عرض سجل النشاط', group: 'الأمان' },
  'security.view': { label: 'عرض الأمان', group: 'الأمان' },
};

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: Object.keys(PERMISSIONS),
  ADMIN: [
    'admin.dashboard.view', 'requests.view', 'requests.update', 'requests.assign', 'requests.export',
    'messages.view', 'messages.reply', 'support.view', 'support.reply', 'support.close',
    'users.view', 'users.update', 'content.view', 'content.create', 'content.update',
    'notifications.view', 'notifications.create', 'reports.view', 'settings.view', 'audit.view', 'security.view',
  ],
  OPERATIONS_MANAGER: [
    'admin.dashboard.view', 'requests.view', 'requests.update', 'requests.assign', 'requests.export',
    'messages.view', 'messages.reply', 'content.view', 'reports.view',
  ],
  SUPPORT_AGENT: [
    'admin.dashboard.view', 'requests.view', 'requests.update',
    'messages.view', 'messages.reply', 'support.view', 'support.reply', 'support.close',
    'users.view', 'notifications.view',
  ],
  CONTENT_MANAGER: [
    'admin.dashboard.view', 'requests.view',
    'messages.view', 'messages.reply', 'content.view', 'content.create', 'content.update', 'content.delete',
    'notifications.view', 'notifications.create', 'reports.view',
  ],
  VIEWER: [
    'admin.dashboard.view', 'requests.view', 'users.view',
    'messages.view', 'support.view', 'content.view', 'notifications.view', 'reports.view',
  ],
};

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Load permissions for selected role
    const rolePerms = rolePermissions[selectedRole] || [];
    const newPerms: Record<string, boolean> = {};
    Object.keys(PERMISSIONS).forEach(p => {
      newPerms[p] = rolePerms.includes(p);
    });
    setPermissions(newPerms);
    setSaved(false);
  }, [selectedRole]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role === 'SUPER_ADMIN') {
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

  const togglePermission = (perm: string) => {
    setPermissions(prev => ({ ...prev, [perm]: !prev[perm] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the database
      // For now, we just simulate the save
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaved(true);
    } catch {
      // Silent failure
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const rolePerms = rolePermissions[selectedRole] || [];
    const newPerms: Record<string, boolean> = {};
    Object.keys(PERMISSIONS).forEach(p => {
      newPerms[p] = rolePerms.includes(p);
    });
    setPermissions(newPerms);
    setSaved(false);
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

  if (authState === 'unauthorized') {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-error mx-auto mb-4" />
          <p className="font-cairo text-xl text-charcoal mb-2">غير مصرح</p>
          <p className="font-cairo text-secondary">هذه الصفحة متاحة لـ Super Admin فقط</p>
        </div>
      </AdminLayout>
    );
  }

  // Group permissions by category
  const groupedPermissions: Record<string, { key: string; label: string }[]> = {};
  Object.entries(PERMISSIONS).forEach(([key, value]) => {
    const group = value.group;
    if (!groupedPermissions[group]) {
      groupedPermissions[group] = [];
    }
    groupedPermissions[group].push({ key, label: value.label });
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-charcoal">الصلاحيات والأدوار</h1>
          <p className="font-cairo text-secondary mt-1">إدارة صلاحيات الأدوار المختلفة</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-sand text-charcoal rounded-xl font-cairo text-sm hover:bg-sand/80 transition-colors"
          >
            إعادة ضبط
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-champagne text-charcoal rounded-xl font-cairo font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ التغييرات</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-success" />
          <span className="font-cairo text-success">تم حفظ التغييرات بنجاح</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-mist p-4">
            <h2 className="font-cairo font-semibold text-charcoal mb-4">الأدوار</h2>
            <div className="space-y-2">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full p-3 rounded-xl text-right font-cairo text-sm transition-colors flex items-center gap-3 ${
                    selectedRole === role
                      ? 'bg-champagne text-charcoal font-semibold'
                      : 'hover:bg-sand/50 text-charcoal'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>{role.replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-mist p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cairo text-lg font-semibold text-charcoal">
                صلاحيات: {selectedRole.replace(/_/g, ' ')}
              </h2>
              <span className="font-cairo text-sm text-secondary">
                {Object.values(permissions).filter(Boolean).length} / {Object.keys(permissions).length} صلاحية
              </span>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group}>
                  <h3 className="font-cairo font-semibold text-charcoal mb-3 pb-2 border-b border-mist">
                    {group}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map(perm => (
                      <button
                        key={perm.key}
                        onClick={() => togglePermission(perm.key)}
                        className={`p-3 rounded-xl border transition-colors text-right flex items-center gap-3 ${
                          permissions[perm.key]
                            ? 'bg-champagne/10 border-champagne'
                            : 'bg-sand/30 border-mist hover:border-champagne/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          permissions[perm.key] ? 'bg-champagne text-charcoal' : 'bg-sand text-muted'
                        }`}>
                          {permissions[perm.key] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <span className="font-cairo text-sm text-charcoal flex-1">{perm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
