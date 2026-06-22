'use client';

import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { BRAND_NAME } from '@/lib/brand/flystayBrand';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-charcoal text-white">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="القائمة"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="font-playfair text-2xl font-semibold">{BRAND_NAME}</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
            aria-label="الإشعارات"
          >
            <Bell size={24} />
            <span className="absolute top-1 left-1 w-2 h-2 bg-champagne rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-charcoal border-t border-white/10 md:hidden">
          <div className="flex flex-col p-4 gap-2">
            <NavLink href="/" label="الرئيسية" />
            <NavLink href="/search" label="البحث" />
            <NavLink href="/services" label="الخدمات" />
            <NavLink href="/ai-agent" label="الوكيل الذكي" />
            <NavLink href="/profile" label="حسابي" />
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-cairo text-lg"
    >
      {label}
    </a>
  );
}
