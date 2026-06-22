/**
 * FlyStay Brand Identity
 * Luxury Travel Minimal - Saudi/Gulf Market
 */

// Brand Name
export const BRAND_NAME = 'FlyStay';
export const BRAND_TAGLINE = 'رحلتك القادمة تبدأ من هنا';
export const BRAND_TAGLINE_EN = 'Your Next Journey Begins Here';

// Brand Style
export const BRAND_STYLE = 'Luxury Travel Minimal';
export const BRAND_FEELING = 'فاخر، هادئ، عالمي، نظيف';

// Colors
export const colors = {
  // Primary Colors
  primary: {
    name: 'Charcoal',
    hex: '#2B2D31',
    rgb: 'rgb(43, 45, 49)',
    usage: 'Buttons, headers, dark backgrounds',
  },
  accent: {
    name: 'Champagne',
    hex: '#CDB68B',
    rgb: 'rgb(205, 182, 139)',
    usage: 'Luxury touches, borders, highlights',
  },

  // Background Colors
  background: {
    name: 'Ivory',
    hex: '#F8F6F1',
    rgb: 'rgb(248, 246, 241)',
    usage: 'Page background',
  },
  surface: {
    name: 'Sand',
    hex: '#E7E3DC',
    rgb: 'rgb(231, 227, 220)',
    usage: 'Cards, secondary elements',
  },
  border: {
    name: 'Mist',
    hex: '#F1F1F1',
    rgb: 'rgb(241, 241, 241)',
    usage: 'Soft borders, dividers',
  },

  // Text Colors
  text: {
    primary: '#2B2D31',
    secondary: '#5C5D60',
    muted: '#9A9A9C',
    inverse: '#FFFFFF',
  },

  // Status Colors
  status: {
    success: '#4A7C59',
    error: '#C45C5C',
    warning: '#D4A84B',
    info: '#5B7B9A',
  },
} as const;

// CSS Color Variables
export const cssColors = {
  '--color-charcoal': colors.primary.hex,
  '--color-champagne': colors.accent.hex,
  '--color-ivory': colors.background.hex,
  '--color-sand': colors.surface.hex,
  '--color-mist': colors.border.hex,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-muted': colors.text.muted,
  '--color-text-inverse': colors.text.inverse,
  '--color-success': colors.status.success,
  '--color-error': colors.status.error,
  '--color-warning': colors.status.warning,
  '--color-info': colors.status.info,
};

// Typography
export const typography = {
  // Arabic Typography
  arabic: {
    fontFamily: "'Cairo', sans-serif",
    weights: [300, 400, 500, 600, 700] as const,
    directions: {
      primary: 'rtl',
      secondary: 'ltr',
    },
  },

  // English Typography
  english: {
    fontFamily: "'Playfair Display', serif",
    weights: [400, 500, 600, 700] as const,
    directions: {
      primary: 'ltr',
      secondary: 'rtl',
    },
  },

  // Font Sizes
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },

  // Line Heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Direction
export const direction = {
  primary: 'rtl' as const,
  secondary: 'ltr' as const,
  language: 'Arabic First',
  textAlign: {
    rtl: 'right' as const,
    ltr: 'left' as const,
  },
};

// CSS Font Variables
export const cssFonts = {
  '--font-cairo': typography.arabic.fontFamily,
  '--font-playfair': typography.english.fontFamily,
};

// Reference Images
export const referenceImages = {
  primary: {
    path: '/brand/reference/flystay-brand-reference-02-primary.jpeg',
    alt: 'FlyStay Brand Reference - Luxury Travel Minimal',
    description: 'Primary reference for design direction',
  },
  secondary: {
    path: '/brand/reference/flystay-brand-reference-01.jpeg',
    alt: 'FlyStay Brand Reference - Secondary',
    description: 'Secondary reference',
  },
};

// Reference Image Paths (all locations)
export const referenceImagePaths = [
  'docs/brand/reference/flystay-brand-reference-01.jpeg',
  'docs/brand/reference/flystay-brand-reference-02-primary.jpeg',
  'public/brand/reference/flystay-brand-reference-01.jpeg',
  'public/brand/reference/flystay-brand-reference-02-primary.jpeg',
  'src/assets/brand/reference/flystay-brand-reference-01.jpeg',
  'src/assets/brand/reference/flystay-brand-reference-02-primary.jpeg',
];

// Spacing
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

// Border Radius
export const borderRadius = {
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px rgba(43, 45, 49, 0.05)',
  md: '0 4px 6px rgba(43, 45, 49, 0.07)',
  lg: '0 10px 15px rgba(43, 45, 49, 0.1)',
  xl: '0 20px 25px rgba(43, 45, 49, 0.15)',
};

// Transitions
export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
};

// Z-Index Scale
export const zIndex = {
  dropdown: 100,
  sticky: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Screen Components
export const screens = {
  home: {
    title: 'الصفحة الرئيسية',
    path: '/',
    components: ['Header', 'HeroCard', 'ServicesGrid', 'FeaturedDestinations', 'WhatsAppButton', 'BottomNav'],
  },
  search: {
    title: 'البحث',
    path: '/search',
    components: ['SearchTabs', 'TripOptions', 'SearchForm', 'ResultsList'],
  },
  services: {
    title: 'الخدمات',
    path: '/services',
    components: ['ServiceCard', 'ComparisonTable'],
  },
  booking: {
    title: 'إرسال طلب حجز',
    path: '/booking',
    components: ['BookingForm', 'OrderSummary'],
  },
  orders: {
    title: 'طلباتي',
    path: '/orders',
    components: ['OrderList', 'OrderStatus', 'EmptyState'],
  },
  favorites: {
    title: 'المفضلة',
    path: '/favorites',
    components: ['FavoriteCard', 'EmptyState'],
  },
  notifications: {
    title: 'الإشعارات',
    path: '/notifications',
    components: ['NotificationList', 'EmptyState'],
  },
  profile: {
    title: 'الملف الشخصي',
    path: '/profile',
    components: ['ProfileCard', 'Settings'],
  },
  dashboard: {
    title: 'لوحة التحكم',
    path: '/dashboard',
    components: ['Stats', 'RecentOrders', 'QuickActions'],
  },
  aiAgent: {
    title: 'الوكيل الذكي',
    path: '/ai-agent',
    components: ['ChatInterface', 'Suggestions'],
  },
  login: {
    title: 'تسجيل الدخول',
    path: '/login',
    components: ['LoginForm'],
  },
  compare: {
    title: 'المقارنة',
    path: '/compare',
    components: ['ComparisonTable', 'CompareCards'],
  },
  details: {
    title: 'تفاصيل الخيار',
    path: '/details',
    components: ['DetailsCard', 'Gallery', 'BookingCTA'],
  },
  offers: {
    title: 'إدارة العروض',
    path: '/offers',
    components: ['OfferCard', 'OfferForm'],
  },
  manageOrders: {
    title: 'إدارة الطلبات',
    path: '/manage-orders',
    components: ['OrderManagement', 'OrderFilters'],
  },
};

// Required States
export const requiredStates = {
  loading: true,
  error: true,
  empty: true,
  success: true,
};

// Navigation Items
export const navigationItems = [
  { key: 'home', label: 'الرئيسية', icon: 'home', href: '/' },
  { key: 'search', label: 'البحث', icon: 'search', href: '/search' },
  { key: 'orders', label: 'حجزي', icon: 'booking', href: '/orders' },
  { key: 'favorites', label: 'المفضلة', icon: 'heart', href: '/favorites' },
  { key: 'profile', label: 'حسابي', icon: 'user', href: '/profile' },
];

// Service Cards
export const serviceCards = [
  {
    key: 'flights',
    title: 'طيران',
    titleEn: 'Flights',
    description: 'حجز رحلات طيران',
    icon: '✈️',
    href: '/search?type=flights',
  },
  {
    key: 'hotels',
    title: 'فنادق',
    titleEn: 'Hotels',
    description: 'أفضل الفنادق',
    icon: '🏨',
    href: '/search?type=hotels',
  },
  {
    key: 'packages',
    title: 'باقات',
    titleEn: 'Packages',
    description: 'باقات سياحية',
    icon: '📦',
    href: '/search?type=packages',
  },
  {
    key: 'offers',
    title: 'عروض',
    titleEn: 'Offers',
    description: 'عروض حصرية',
    icon: '🎁',
    href: '/offers',
  },
];

// Type Exports
export type BrandColors = typeof colors;
export type BrandTypography = typeof typography;
export type BrandDirection = typeof direction;
export type BrandScreens = typeof screens;

// Default Export
const flystayBrand = {
  brandName: BRAND_NAME,
  brandTagline: BRAND_TAGLINE,
  brandTaglineEn: BRAND_TAGLINE_EN,
  brandStyle: BRAND_STYLE,
  brandFeeling: BRAND_FEELING,
  colors,
  cssColors,
  typography,
  cssFonts,
  direction,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  referenceImages,
  referenceImagePaths,
  screens,
  requiredStates,
  navigationItems,
  serviceCards,
};

export default flystayBrand;
