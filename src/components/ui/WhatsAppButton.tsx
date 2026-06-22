'use client';

import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '+966500000000'; // Replace with actual number

export default function WhatsAppButton() {
  const handleClick = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 left-4 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle size={28} />
    </button>
  );
}
