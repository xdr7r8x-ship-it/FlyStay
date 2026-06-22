import type { Metadata } from 'next';
import './globals.css';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand/flystayBrand';

export const metadata: Metadata = {
  title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
  description: 'منصة حجز طيران وفنادق فاخرة - Luxury Travel Booking Platform',
  keywords: ['حجز طيران', 'فنادق', 'باقات سياحية', 'السعودية', 'الخليج'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-cairo bg-ivory text-charcoal min-h-screen pb-24">
        {children}
      </body>
    </html>
  );
}
