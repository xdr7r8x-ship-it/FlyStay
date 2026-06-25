'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Settings as SettingsIcon, Save, RefreshCw, Lock, AlertTriangle, Check, Mail, Phone, Clock, ToggleLeft, ToggleRight, Shield } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  group: string;
  labelAr?: string;
  descriptionAr?: string;
}

const SETTING_GROUPS = [
  { key: 'general', label: 'عام' },
  { key: 'requests', label: 'الطلبات' },
  { key: 'notifications', label: 'الإشعارات' },
  { key: 'support', label: 'الدعم' },
  { key: 'safety', label: 'الأمان' },
  { key: 'maintenance', label: 'الصيانة' },
];

const DEFAULT_SETTINGS: Setting[] = [
  { id: '1', key: 'app_name', value: 'FlyStay', type: 'STRING', group: 'general', labelAr: 'اسم التطبيق', descriptionAr: 'اسم التطبيق المعروض في الواجهة' },
  { id: '2', key: 'support_email', value: 'support@flystay.com', type: 'STRING', group: 'general', labelAr: 'بريد الدعم', descriptionAr: 'البريد الإلكتروني للدعم الفني' },
  { id: '3', key: 'support_whatsapp', value: '+966500000000', type: 'STRING', group: 'general', labelAr: 'واتساب الدعم', descriptionAr: 'رقم واتساب للتواصل المباشر' },
  { id: '4', key: 'working_hours', value: '9:00 - 18:00', type: 'STRING', group: 'general', labelAr: 'ساعات العمل', descriptionAr: 'ساعات العمل الرسمية' },
  { id: '5', key: 'requests_enabled', value: 'true', type: 'BOOLEAN', group: 'requests', labelAr: 'تفعيل الطلبات', descriptionAr: 'السماح بتقديم طلبات جديدة' },
  { id: '6', key: 'max_daily_requests', value: '100', type: 'NUMBER', group: 'requests', labelAr: 'الحد الأقصى للطلبات اليومية', descriptionAr: 'الحد الأقصى من الطلبات لكل مستخدم يوميًا' },
  { id: '7', key: 'notify_admin_on_new_request', value: 'true', type: 'BOOLEAN', group: 'requests', labelAr: 'إشعار الأدمن عند طلب جديد', descriptionAr: 'إرسال إشعار للأدمن عند كل طلب جديد' },
  { id: '8', key: 'default_safety_notice', value: 'جميع الأسعار تقديرية وغير نهائية', type: 'STRING', group: 'safety', labelAr: 'إشعار الأمان الافتراضي', descriptionAr: 'النص المعروض لتنبيه المستخدم بأن الأسعار غير نهائية' },
  { id: '9', key: 'maintenance_mode', value: 'false', type: 'BOOLEAN', group: 'maintenance', labelAr: 'وضع الصيانة', descriptionAr: 'تفعيل وضع الصيانة لإيقاف الموقع مؤقتًا' },
  { id: '10', key: 'maintenance_message', value: 'الموقع قيد الصيانة حاليًا', type: 'STRING', group: 'maintenance', labelAr: 'رسالة الصيانة', descriptionAr: 'الرسالة المعروضة للمستخدمين أثناء الصيانة' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>(DEFAULT_SETTINGS);
  const [selectedGroup, setSelectedGroup] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role === 'SUPER_ADMIN' || data.user?.role === 'ADMIN') {
          setAuthState('authorized');
          fetchSettings();
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

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.settings && data.settings.length > 0) {
          setSettings(data.settings);
        }
      }
    } catch {
      // Use default settings
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, value } : s))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, this would save to database
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaved(true);
    } catch {
      // Silent failure
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaved(false);
  };

  const handleToggleBoolean = (key: string, currentValue: string) => {
    updateSetting(key, currentValue === 'true' ? 'false' : 'true');
  };

  const filteredSettings = settings.filter(s => s.group === selectedGroup);

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
          <h1 className="font-cairo text-2xl font-bold text-charcoal">إعدادات النظام</h1>
          <p className="font-cairo text-secondary mt-1">إدارة إعدادات ومعلومات النظام</p>
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

      {/* Maintenance Warning */}
      {settings.find(s => s.key === 'maintenance_mode')?.value === 'true' && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-cairo text-sm font-semibold text-charcoal">وضع الصيانة مفعل</p>
            <p className="font-cairo text-xs text-secondary mt-1">
              الموقع غير متاح للمستخدمين حاليًا. قم بتعطيل وضع الصيانة عند الانتهاء.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Groups Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-mist p-4">
            <h2 className="font-cairo font-semibold text-charcoal mb-4">الفئات</h2>
            <div className="space-y-2">
              {SETTING_GROUPS.map(group => (
                <button
                  key={group.key}
                  onClick={() => setSelectedGroup(group.key)}
                  className={`w-full p-3 rounded-xl text-right font-cairo text-sm transition-colors flex items-center gap-3 ${
                    selectedGroup === group.key
                      ? 'bg-champagne text-charcoal font-semibold'
                      : 'hover:bg-sand/50 text-charcoal'
                  }`}
                >
                  {group.key === 'general' && <SettingsIcon className="w-5 h-5" />}
                  {group.key === 'requests' && <SettingsIcon className="w-5 h-5" />}
                  {group.key === 'notifications' && <SettingsIcon className="w-5 h-5" />}
                  {group.key === 'support' && <Phone className="w-5 h-5" />}
                  {group.key === 'safety' && <Shield className="w-5 h-5" />}
                  {group.key === 'maintenance' && <AlertTriangle className="w-5 h-5" />}
                  <span>{group.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-mist p-6">
            <h2 className="font-cairo text-lg font-semibold text-charcoal mb-6">
              {SETTING_GROUPS.find(g => g.key === selectedGroup)?.label}
            </h2>

            <div className="space-y-6">
              {filteredSettings.map(setting => (
                <div key={setting.key} className="pb-6 border-b border-mist last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <label className="font-cairo font-semibold text-charcoal">
                        {setting.labelAr || setting.key}
                      </label>
                      {setting.descriptionAr && (
                        <p className="font-cairo text-xs text-secondary mt-1">
                          {setting.descriptionAr}
                        </p>
                      )}
                    </div>
                  </div>

                  {setting.type === 'BOOLEAN' ? (
                    <button
                      onClick={() => handleToggleBoolean(setting.key, setting.value)}
                      className={`p-2 rounded-lg transition-colors ${
                        setting.value === 'true' ? 'text-success' : 'text-muted'
                      }`}
                    >
                      {setting.value === 'true' ? (
                        <ToggleRight className="w-10 h-10" />
                      ) : (
                        <ToggleLeft className="w-10 h-10" />
                      )}
                    </button>
                  ) : setting.type === 'NUMBER' ? (
                    <input
                      type="number"
                      value={setting.value}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                      className="w-full md:w-64 px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                    />
                  ) : (
                    <input
                      type={setting.key.includes('email') ? 'email' : setting.key.includes('phone') || setting.key.includes('whatsapp') ? 'tel' : 'text'}
                      value={setting.value}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                      className="w-full md:w-96 px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
