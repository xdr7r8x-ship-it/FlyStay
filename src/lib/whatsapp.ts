const WHATSAPP_NUMBER = process.env.WHATSAPP_SUPPORT_NUMBER || '966500000000';

const SERVICE_TYPE_LABELS: Record<string, string> = {
  HOTEL: 'فندق',
  CHALET: 'شالية',
  FLIGHT: 'طيران',
  PACKAGE: 'باقة سياحية',
};

export function generateWhatsAppLink(orderNumber: string, serviceType: string): string {
  const message = `مرحبًا، لدي طلب في FlyStay رقم: ${orderNumber}
الخدمة: ${SERVICE_TYPE_LABELS[serviceType] || serviceType}
أرغب بمتابعة الطلب.`;
  
  const encodedMessage = encodeURIComponent(message);
  
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanNumber = WHATSAPP_NUMBER.replace(/[\s\-\(\)]/g, '');
  
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

export function getWhatsAppButtonText(): string {
  return 'تواصل عبر واتساب';
}
