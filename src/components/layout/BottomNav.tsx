'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, Heart, User } from 'lucide-react';

const navItems = [
  { key: 'home', label: 'الرئيسية', icon: Home, href: '/' },
  { key: 'search', label: 'البحث', icon: Search, href: '/search' },
  { key: 'orders', label: 'حجزي', icon: Calendar, href: '/orders' },
  { key: 'favorites', label: 'المفضلة', icon: Heart, href: '/favorites' },
  { key: 'profile', label: 'حسابي', icon: User, href: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ivory border-t border-mist">
      <div className="flex justify-around items-center py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive
                  ? 'text-champagne'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-cairo text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
