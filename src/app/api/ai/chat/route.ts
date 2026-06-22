/**
 * AI Chat API
 * POST /api/ai/chat
 * 
 * Secure AI chat endpoint with fail-closed behavior.
 * Requires AI_API_KEY to be configured.
 */

import { NextRequest, NextResponse } from 'next/server';
import { FLYSTAY_SYSTEM_PROMPT, AI_RESPONSE_TEMPLATES } from '@/lib/ai/systemPrompt';

const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const AI_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.2');
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '500', 10);

// Rate limiting - simple in-memory (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// Sanitize user input
function sanitizeInput(text: string): string {
  return text
    .trim()
    .slice(0, 1000) // Max 1000 chars
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/\n{3,}/g, '\n\n'); // Max 2 newlines
}

// Check for sensitive data requests
function containsSensitiveRequest(message: string): boolean {
  const sensitivePatterns = [
    /DATABASE_URL/i,
    /passwordHash/i,
    /JWT_SECRET/i,
    /AI_API_KEY/i,
    /OPENAI_API_KEY/i,
    /TAP_SECRET/i,
    /كل العملاء/i,
    /بيانات كل/i,
    /كل المستخدمين/i,
    /كل الحجوزات/i,
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(message));
}

// Handle offline mode with rule-based responses
function getOfflineResponse(message: string): { response: string; nextAction: string } {
  const lowerMessage = message.toLowerCase();
  
  // Greeting
  if (/^(هلا|مرحبا|اهلا|سلام|هاي|أهلاً)/.test(lowerMessage)) {
    return {
      response: 'هلا والله! أنا مساعد FlyStay. كيف أقدر أساعدك في سفرك؟',
      nextAction: 'answer'
    };
  }
  
  // What do you do
  if (/وش تسوون|خدماتكم|شنو تسوون|إيش خدماتكم/.test(lowerMessage)) {
    return {
      response: 'FlyStay نساعدك في تجهيز طلبات السفر: رحلات، فنادق، باقات، وشاليهات. بساعدك أختار الوجهة المناسبة وأجهز لك الطلب للمراجعة. وش يهمك؟',
      nextAction: 'answer'
    };
  }
  
  // Dubai recommendation
  if (/دبي/.test(lowerMessage) && !/سعر|كم/.test(lowerMessage)) {
    return {
      response: 'دبي خيار ممتاز! مناسبة للتسوق والفعاليات. تبيها عائلية ولا مع الأصدقاء؟ وكم ليلة تفكر تقضي هناك؟',
      nextAction: 'ask_followup'
    };
  }
  
  // Price question
  if (/سعر|كم يكلف|كم الفلوس/.test(lowerMessage)) {
    return {
      response: 'ما أقدر أؤكد السعر بدون مصدر حجز مباشر. أقدر أجهز لك الطلب للمراجعة. كم شخص ومتى السفر؟',
      nextAction: 'ask_followup'
    };
  }
  
  // Destination comparison
  if (/دبي.*البحرين|البحرين.*دبي|دبي.*قطر|قطر.*دبي/.test(lowerMessage)) {
    return {
      response: 'يعتمد على جو الرحلة! دبي أنسب للفعاليات والتسوق، والبحرين أقرب وأهدأ غالبًا. تبيها عائلية ولا مع الشباب؟',
      nextAction: 'ask_followup'
    };
  }
  
  // Book request
  if (/احجز|أريد الحجز| أبي أحجز/.test(lowerMessage)) {
    return {
      response: 'أكيد، أقدر أساعدك في تجهيز الطلب. بس أحتاج أعرف: متى تاريخ السفر وكم عدد الأشخاص؟',
      nextAction: 'ask_followup'
    };
  }
  
  // Tired/want to travel
  if (/تعبان|طفشان|محتار|غير جو/.test(lowerMessage)) {
    return {
      response: 'الله يوسع صدرك! تغيير الجو فكرة ممتازة. تفضّل مكان هادئ للاسترخاء ولا مدينة فيها فعاليات؟',
      nextAction: 'ask_followup'
    };
  }
  
  // Hotel request
  if (/فندق|فنادق|أhotel/.test(lowerMessage)) {
    return {
      response: 'أقدر أساعدك في البحث عن فندق!.city المدينة؟ ومتى تاريخ الدخول والخروج؟ وكم شخص؟',
      nextAction: 'ask_followup'
    };
  }
  
  // Chalet request
  if (/شاليه|شاليهات/.test(lowerMessage)) {
    return {
      response: 'تمام! الشاليهات ممتازة للخصوصية. المدينة؟ والتاريخ؟ وكم شخص؟ ومسبح خاص تبيه؟',
      nextAction: 'ask_followup'
    };
  }
  
  // Flight request
  if (/رحلة|رحلات|طيران|fly/.test(lowerMessage)) {
    return {
      response: 'رائع! أحتاج أعرف: من وين تبي تقلع؟ والى وين الوجهة؟ ومتى تاريخ السفر؟ وكم مسافر؟',
      nextAction: 'ask_followup'
    };
  }
  
  // Check orders
  if (/طلباتي|حجوزاتي|متابعه الطلب/.test(lowerMessage)) {
    return {
      response: 'يلزم تسجيل الدخول لعرض طلباتك. اضغط على "تسجيل الدخول" في أعلى الصفحة.',
      nextAction: 'login_required'
    };
  }
  
  // Generic help
  return {
    response: 'أقدر أساعدك في تجهيز طلب السفر. قل لي وش تبي بالضبط: رحلة، فندق، باقة، ولا شاليه؟',
    nextAction: 'answer'
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    
    // Rate limit check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'طلبك كثير، جرب لاحقًا.' } },
        { status: 429 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { message, conversationId } = body;
    
    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'الرسالة مطلوبة.' } },
        { status: 400 }
      );
    }
    
    const sanitizedMessage = sanitizeInput(message);
    
    // Check for sensitive data requests
    if (containsSensitiveRequest(sanitizedMessage)) {
      return NextResponse.json({
        message: AI_RESPONSE_TEMPLATES.SENSITIVE_DATA_REJECT,
        conversationId: conversationId || crypto.randomUUID(),
        nextAction: 'answer',
        confidence: 'grounded'
      });
    }
    
    // Check if AI is configured
    if (!AI_API_KEY) {
      // Fail-closed: use offline rule-based responses
      const offlineResponse = getOfflineResponse(sanitizedMessage);
      
      return NextResponse.json({
        message: offlineResponse.response,
        conversationId: conversationId || crypto.randomUUID(),
        nextAction: offlineResponse.nextAction,
        confidence: 'general'
      }, { status: 200 });
    }
    
    // Call AI provider
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: FLYSTAY_SYSTEM_PROMPT },
            { role: 'user', content: sanitizedMessage }
          ],
          temperature: AI_TEMPERATURE,
          max_tokens: AI_MAX_TOKENS
        })
      });
      
      if (!response.ok) {
        console.error('[AI Chat] OpenAI API error:', response.status);
        // Fallback to offline response
        const offlineResponse = getOfflineResponse(sanitizedMessage);
        return NextResponse.json({
          message: offlineResponse.response,
          conversationId: conversationId || crypto.randomUUID(),
          nextAction: offlineResponse.nextAction,
          confidence: 'general'
        });
      }
      
      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || 'ما قدرت أساعدك الحين.';
      
      return NextResponse.json({
        message: aiMessage.trim(),
        conversationId: conversationId || crypto.randomUUID(),
        nextAction: 'answer',
        confidence: 'grounded'
      });
      
    } catch (aiError) {
      console.error('[AI Chat] AI provider error:', aiError);
      // Fallback to offline response
      const offlineResponse = getOfflineResponse(sanitizedMessage);
      return NextResponse.json({
        message: offlineResponse.response,
        conversationId: conversationId || crypto.randomUUID(),
        nextAction: offlineResponse.nextAction,
        confidence: 'general'
      });
    }
    
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'خطأ في الخادم.' } },
      { status: 500 }
    );
  }
}
