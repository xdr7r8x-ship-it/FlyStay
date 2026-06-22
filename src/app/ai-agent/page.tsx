'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { LoadingSpinner } from '@/components/ui/Loading';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  'ابحث عن فنادق في دبي',
  'أفضل عروض شهر العسل',
  'رحلات إلى إسطنبول',
  'فنادق 5 نجوم في الرياض',
];

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا وكيلك الذكي في FlyStay. كيف يمكنني مساعدتك في رحلتك القادمة؟',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses = [
      'يسعدني مساعدتك! هل تبحث عن وجهة معينة أم تريد اقتراحات؟',
      'رائع! أحتاج quelques تفاصيل إضافية عن تواريخ سفرك وعدد المسافرين.',
      'وجدت لك بعض العروض المميزة! هل تريد التفاصيل؟',
      'أوصي بفندق أتلانتس دبي للرحلة. هل تريد الحجز؟',
    ];

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
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
            <p className="font-cairo text-champagne text-sm">متاح لمساعدتك 24/7</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 py-4 w-full">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => setInput(action)}
              className="px-4 py-2 bg-sand border border-mist rounded-full font-cairo text-sm text-charcoal hover:border-champagne transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

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
                <p className="font-cairo leading-relaxed">{message.content}</p>
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
            placeholder="اكتب رسالتك..."
            className="flex-1 px-5 py-4 bg-sand border border-mist rounded-2xl font-cairo text-charcoal placeholder:text-muted focus:outline-none focus:border-champagne"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-14 h-14 bg-charcoal text-white rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
