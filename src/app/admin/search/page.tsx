'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, FileText, User, MapPin, Headphones, MessageSquare, RefreshCw, ChevronRight } from 'lucide-react';

interface SearchResult {
  type: 'request' | 'user' | 'destination' | 'ticket' | 'message';
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
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

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const resultsList: SearchResult[] = [];

      // Search requests
      try {
        const reqRes = await fetch(`/api/admin/travel-requests?search=${encodeURIComponent(q)}&limit=5`, { credentials: 'include' });
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          (reqData.data || []).slice(0, 3).forEach((req: any) => {
            resultsList.push({
              type: 'request',
              id: req.id,
              title: req.referenceNumber || `طلب #${req.id.slice(0, 8)}`,
              subtitle: `${req.serviceType} - ${req.status}`,
              href: `/admin/requests/${req.id}`,
            });
          });
        }
      } catch {
        // Silent
      }

      // Search users
      try {
        const userRes = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}&limit=5`, { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          (userData.data || []).slice(0, 3).forEach((user: any) => {
            resultsList.push({
              type: 'user',
              id: user.id,
              title: user.name,
              subtitle: user.email,
              href: `/admin/users/${user.id}`,
            });
          });
        }
      } catch {
        // Silent
      }

      // Search destinations
      try {
        const destRes = await fetch(`/api/admin/content/destinations?search=${encodeURIComponent(q)}&limit=5`, { credentials: 'include' });
        if (destRes.ok) {
          const destData = await destRes.json();
          (destData.data || []).slice(0, 3).forEach((dest: any) => {
            resultsList.push({
              type: 'destination',
              id: dest.id,
              title: dest.cityAr,
              subtitle: dest.countryAr,
              href: `/admin/content/destinations/${dest.id}`,
            });
          });
        }
      } catch {
        // Silent
      }

      setResults(resultsList);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(null, '', `/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery);
    }
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'request':
        return <FileText className="w-5 h-5" />;
      case 'user':
        return <User className="w-5 h-5" />;
      case 'destination':
        return <MapPin className="w-5 h-5" />;
      case 'ticket':
        return <Headphones className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'request':
        return 'طلب';
      case 'user':
        return 'مستخدم';
      case 'destination':
        return 'وجهة';
      case 'ticket':
        return 'تذكرة';
      case 'message':
        return 'رسالة';
    }
  };

  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-champagne animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-cairo text-2xl font-bold text-charcoal">البحث</h1>
        <p className="font-cairo text-secondary mt-1">البحث في الطلبات والمستخدمين والمحتوى</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="اكتب للبحث في الطلبات والمستخدمين..."
            className="w-full pr-12 pl-4 py-4 bg-white border border-mist rounded-2xl font-cairo text-lg focus:outline-none focus:border-champagne transition-colors"
            autoFocus
          />
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-champagne animate-spin" />
        </div>
      ) : query ? (
        results.length > 0 ? (
          <div className="space-y-4">
            <p className="font-cairo text-secondary">
              تم العثور على <span className="font-semibold text-charcoal">{results.length}</span> نتيجة
            </p>
            <div className="bg-white rounded-2xl border border-mist overflow-hidden">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  className={`flex items-center gap-4 p-4 hover:bg-sand/30 transition-colors ${
                    index !== 0 ? 'border-t border-mist' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-champagne/20 rounded-xl flex items-center justify-center text-champagne">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-sand text-secondary text-xs font-cairo rounded">
                        {getTypeLabel(result.type)}
                      </span>
                      <h3 className="font-cairo font-semibold text-charcoal">{result.title}</h3>
                    </div>
                    {result.subtitle && (
                      <p className="font-cairo text-sm text-secondary">{result.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="font-cairo text-secondary text-lg">لم يتم العثور على نتائج</p>
            <p className="font-cairo text-sm text-muted mt-2">
              جرب البحث بكلمات مختلفة
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="font-cairo text-secondary text-lg">ابدأ بالبحث</p>
          <p className="font-cairo text-sm text-muted mt-2">
            يمكنك البحث بالرقم أو الاسم أو أي كلمة مفتاحية
          </p>
        </div>
      )}
    </AdminLayout>
  );
}

export default function AdminSearchPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-champagne border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    }>
      <SearchContent />
    </Suspense>
  );
}
