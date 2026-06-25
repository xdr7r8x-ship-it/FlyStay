'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Headphones,
  Users,
  Shield,
  MapPin,
  Package,
  Building2,
  Tag,
  Bell,
  FileBarChart,
  Settings,
  Lock,
  Activity,
  Package2,
  ChevronRight,
  ChevronDown,
  X,
  Menu
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    title: 'لوحة التحكم',
    items: [
      { label: 'الرئيسية', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    title: 'إدارة الطلبات',
    items: [
      { label: 'الطلبات', href: '/admin/requests', icon: <FileText className="w-5 h-5" /> },
      { label: 'مركز الرسائل', href: '/admin/messages', icon: <MessageSquare className="w-5 h-5" /> },
    ],
  },
  {
    title: 'الدعم والمساعدة',
    items: [
      { label: 'الدعم والشكاوى', href: '/admin/support', icon: <Headphones className="w-5 h-5" /> },
    ],
  },
  {
    title: 'إدارة المستخدمين',
    items: [
      { label: 'المستخدمين', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
      { label: 'الصلاحيات والأدوار', href: '/admin/roles', icon: <Shield className="w-5 h-5" /> },
    ],
  },
  {
    title: 'إدارة المحتوى',
    items: [
      { label: 'نظرة عامة', href: '/admin/content', icon: <Package className="w-5 h-5" /> },
      { label: 'الوجهات', href: '/admin/content/destinations', icon: <MapPin className="w-5 h-5" /> },
      { label: 'قوالب الرحلات', href: '/admin/content/templates', icon: <Package2 className="w-5 h-5" /> },
      { label: 'أدلة الإقامة', href: '/admin/content/stay-guides', icon: <Building2 className="w-5 h-5" /> },
      { label: 'العروض', href: '/admin/offers', icon: <Tag className="w-5 h-5" /> },
    ],
  },
  {
    title: 'التقارير والنظام',
    items: [
      { label: 'التقارير', href: '/admin/reports', icon: <FileBarChart className="w-5 h-5" /> },
      { label: 'سجل النشاط', href: '/admin/audit-logs', icon: <Activity className="w-5 h-5" /> },
      { label: 'الإشعارات', href: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
    ],
  },
  {
    title: 'إعدادات النظام',
    items: [
      { label: 'الإعدادات', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
      { label: 'مركز الأمان', href: '/admin/security', icon: <Lock className="w-5 h-5" /> },
      { label: 'صحة النظام', href: '/admin/system-health', icon: <Activity className="w-5 h-5" /> },
      { label: 'الإصدارات', href: '/admin/releases', icon: <Package2 className="w-5 h-5" /> },
    ],
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-72 bg-charcoal text-white z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-champagne rounded-lg flex items-center justify-center">
              <span className="font-cairo font-bold text-charcoal text-lg">F</span>
            </div>
            <div>
              <h1 className="font-cairo font-bold text-lg">FlyStay</h1>
              <p className="font-cairo text-xs text-champagne">لوحة التحكم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {section.title && (
                <h3 className="font-cairo text-xs text-white/50 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg font-cairo text-sm
                          transition-colors duration-200
                          ${active
                            ? 'bg-champagne text-charcoal font-semibold'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        <span className={active ? 'text-charcoal' : 'text-champagne'}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`
                            px-2 py-0.5 text-xs rounded-full
                            ${active ? 'bg-charcoal text-champagne' : 'bg-champagne text-charcoal'}
                          `}>
                            {item.badge}
                          </span>
                        )}
                        {active && <ChevronRight className="w-4 h-4" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg font-cairo text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

export function AdminSidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 hover:bg-sand rounded-lg transition-colors"
    >
      <Menu className="w-6 h-6 text-charcoal" />
    </button>
  );
}
