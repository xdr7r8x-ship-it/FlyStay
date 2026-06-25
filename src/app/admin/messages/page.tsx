'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { MessageSquare, Search, Filter, Send, User, Clock, ChevronRight, RefreshCw, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  requestId?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  body: string;
  senderRole: 'USER' | 'ADMIN' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  requestId?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

type FilterType = 'all' | 'unread' | 'replied';

export default function MessagesCenterPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
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
          fetchConversations();
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

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      } else {
        // If API doesn't exist, use empty array
        setConversations([]);
      }
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          userId: selectedConversation.userId,
          requestId: selectedConversation.requestId,
          body: replyText.trim(),
        }),
      });
      
      if (res.ok) {
        setReplyText('');
        // Refresh conversations
        fetchConversations();
      }
    } catch {
      // Silent failure
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/admin/messages/${conversationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch {
      // Silent failure
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread' && conv.unreadCount === 0) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.userName?.toLowerCase().includes(query) ||
        conv.userEmail?.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
          <p className="font-cairo text-secondary">غير مصرح بالوصول</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-cairo text-2xl font-bold text-charcoal">مركز الرسائل</h1>
        <p className="font-cairo text-secondary mt-1">إدارة جميع الرسائل والتواصل مع المستخدمين</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-mist overflow-hidden">
          {/* Search & Filter */}
          <div className="p-4 border-b border-mist space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-9 pl-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm focus:outline-none focus:border-champagne"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'unread'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-cairo text-sm transition-colors ${
                    filter === f
                      ? 'bg-champagne text-charcoal'
                      : 'bg-sand/50 text-secondary hover:bg-sand'
                  }`}
                >
                  {f === 'all' ? 'الكل' : 'غير المقروءة'}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div className="divide-y divide-mist max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-6 h-6 text-champagne animate-spin mx-auto" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="font-cairo text-secondary">لا توجد رسائل</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    if (conv.unreadCount > 0) {
                      markAsRead(conv.id);
                    }
                  }}
                  className={`w-full p-4 text-right hover:bg-sand/30 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-sand/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-champagne" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-cairo font-semibold text-charcoal text-sm truncate">
                          {conv.userName || 'مستخدم'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-champagne text-charcoal text-xs rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="font-cairo text-xs text-secondary truncate mb-1">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted" />
                        <span className="font-cairo text-xs text-muted">
                          {new Date(conv.lastMessageAt).toLocaleDateString('ar-SA')}
                        </span>
                        {conv.requestId && (
                          <span className="font-cairo text-xs text-champagne">
                            #{conv.requestId.slice(0, 8)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-mist flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-mist">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-cairo font-semibold text-charcoal">
                      {selectedConversation.userName || 'مستخدم'}
                    </h2>
                    <p className="font-cairo text-sm text-secondary">
                      {selectedConversation.userEmail}
                    </p>
                  </div>
                  {selectedConversation.requestId && (
                    <Link
                      href={`/admin/requests/${selectedConversation.requestId}`}
                      className="flex items-center gap-1 text-sm text-champagne hover:underline"
                    >
                      عرض الطلب
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[400px]">
                {selectedConversation.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === 'ADMIN' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.senderRole === 'ADMIN'
                          ? 'bg-sand text-charcoal'
                          : 'bg-champagne/20 text-charcoal'
                      }`}
                    >
                      <p className="font-cairo text-sm whitespace-pre-wrap">{msg.body}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-muted" />
                        <span className="font-cairo text-xs text-muted">
                          {new Date(msg.createdAt).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply */}
              <div className="p-4 border-t border-mist">
                <div className="flex gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب ردك..."
                    rows={2}
                    className="flex-1 px-4 py-2 bg-sand/50 border border-mist rounded-xl font-cairo text-sm resize-none focus:outline-none focus:border-champagne"
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim() || sending}
                    className="px-6 py-2 bg-champagne text-charcoal rounded-xl font-cairo font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="font-cairo text-secondary">اختر محادثة لعرض الرسائل</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
