'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  'أبغى أسافر دبي',
  'أبي فندق في الرياض',
  'أبي شاليه الجمعة',
  'وش تنصحني؟',
];

const serviceOptions = [
  { id: 'flight', label: 'رحلة', icon: '✈️', fields: ['من وين؟', 'إلى وين؟', 'متى؟', 'كم مسافر؟'] },
  { id: 'hotel', label: 'فندق', icon: '🏨', fields: ['المدينة؟', 'تاريخ الدخول؟', 'تاريخ الخروج؟', 'كم شخص؟'] },
  { id: 'package', label: 'باقة', icon: '🎁', fields: ['الوجهة؟', 'متى؟', 'عدد الأشخاص؟'] },
  { id: 'chalet', label: 'شاليه', icon: '🏡', fields: ['المدينة؟', 'التاريخ؟', 'كم شخص؟', 'مسبح؟'] },
];

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'هلا والله! أنا مساعد FlyStay 🌟\n\nأقدر أساعدك في تجهيز طلب السفر. بس أسألك几个 أسئلة عشان أفهم طلبك:\n\n• وش تبي بالضبط؟ رحلة، فندق، باقة، ولا شاليه؟\n• وين تبي تروح؟\n• متى تاريخ السفر؟\n• كم عدد الأشخاص؟',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'حدث خطأ');
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'عذرًا، صار خطأ. جرب مرة ثانية.',
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setError('فشل الاتصال');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'عذرًا، ما قدرت أساعدك الحين. جرب مرة ثانية.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <main className="min-h-screen bg-ivory pb-24 flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="bg-charcoal text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-champagne/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-champagne" />
          </div>
          <div>
            <h1 className="font-cairo text-2xl font-bold">الوكيل الذكي</h1>
            <p className="font-cairo text-champagne text-sm">متاح لمساعدتك في سفرك</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 py-4 w-full">
        <p className="font-cairo text-sm text-muted mb-3">أسئلة سريعة:</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(action)}
              className="px-4 py-2 bg-sand border border-mist rounded-full font-cairo text-sm text-charcoal hover:border-champagne transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 w-full">
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="font-cairo text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-4 w-full overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-champagne/20 text-champagne'
                    : 'bg-charcoal text-white'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                  message.role === 'assistant'
                    ? 'bg-sand border border-mist text-charcoal'
                    : 'bg-charcoal text-white'
                }`}
              >
                <p className="font-cairo leading-relaxed whitespace-pre-line">
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'assistant' ? 'text-muted' : 'text-white/60'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-champagne/20 text-champagne flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-sand border border-mist px-5 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-champagne rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-champagne rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="w-2 h-2 bg-champagne rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="max-w-4xl mx-auto px-4 py-4 w-full bg-ivory border-t border-mist">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك أو اختر سؤالاً سريعاً..."
            className="flex-1 px-5 py-4 bg-sand border border-mist rounded-2xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-charcoal text-white rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="max-w-4xl mx-auto px-4 pb-4 w-full">
        <p className="font-cairo text-xs text-muted text-center">
          🔒 نحمي بياناتك ونستخدمها فقط لتنفيذ طلبك داخل FlyStay، ولا نعرضها لأي طرف غير مخوّل.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
