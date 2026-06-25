'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';

interface AdminTopbarProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-mist">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Search */}
        <div className="flex-1 max-w-xl">
          <form onSubmit={handleSearch} className="relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchFocused ? 'text-champagne' : 'text-muted'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="بحث في لوحة التحكم..."
              className="w-full pr-10 pl-4 py-2.5 bg-sand/50 border border-mist rounded-xl font-cairo text-sm text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne transition-colors"
            />
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 mr-4">
          {/* Notifications */}
          <Link
            href="/admin/notifications"
            className="relative p-2 hover:bg-sand rounded-lg transition-colors"
            title="الإشعارات"
          >
            <Bell className="w-5 h-5 text-charcoal" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-champagne rounded-full" />
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-sand rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-champagne rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-charcoal" />
              </div>
              <span className="hidden sm:block font-cairo text-sm text-charcoal">مدير النظام</span>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-mist z-50 overflow-hidden">
                  <div className="p-3 border-b border-mist">
                    <p className="font-cairo font-semibold text-charcoal">مدير النظام</p>
                    <p className="font-cairo text-xs text-muted">admin@flystay.com</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sand transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 text-muted" />
                      <span className="font-cairo text-sm text-charcoal">بياناتي</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sand transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 text-muted" />
                      <span className="font-cairo text-sm text-charcoal">الإعدادات</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-mist">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-error/10 text-error transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-cairo text-sm">تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
