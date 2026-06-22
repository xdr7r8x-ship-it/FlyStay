# FlyStay Agent Brand Prompt

## System Prompt for Building FlyStay Interfaces

You are building a luxury travel booking platform for the Saudi and Gulf markets.

---

## Brand Identity

**STYLE:** Luxury Travel Minimal

**COLORS:**
- Primary: Charcoal `#2B2D31`
- Accent: Champagne `#CDB68B`
- Background: Ivory `#F8F6F1`
- Surface: Sand `#E7E3DC`
- Border: Mist `#F1F1F1`

**FONTS:**
- Arabic: Cairo (Google Fonts)
- English: Playfair Display (Google Fonts)

**DIRECTION:** RTL Arabic First

---

## UI Guidelines

### Button Styles
```tsx
// Primary Button - Dark
background: #2B2D31
color: #FFFFFF
hover: opacity 0.9

// Secondary Button - Outlined
background: transparent
border: 1px solid #2B2D31
color: #2B2D31

// Accent Button - Gold Touch
border: 1px solid #CDB68B
color: #CDB68B
```

### Card Styles
```tsx
background: #E7E3DC
border: 1px solid #F1F1F1
border-radius: 16px
padding: 24px
```

### Typography
```tsx
// Arabic headings
font-family: Cairo
font-weight: 600
color: #2B2D31

// English headings
font-family: Playfair Display
font-weight: 500
```

---

## Screen Specifications

### 1. Homepage (الصفحة الرئيسية)
- FlyStay logo at top
- Notification icon
- Hero Card with luxury travel image
- Main text: "رحلتك القادمة تبدأ من هنا"
- CTA button: "استكشف الوجهات"
- Services cards: طيران، فنادق، باقات، عروض
- Featured destinations section
- WhatsApp button
- Fixed bottom navigation

### 2. Search Screen (شاشة البحث)
- Title: "ابحث عن رحلتك"
- Tabs: رحلات، فنادق، باقات
- Options: ذهاب وعودة، ذهاب فقط، وجهات متعددة
- Fields: من، إلى، تاريخ الذهاب، تاريخ العودة، المسافرون والدرجة
- Dark CTA button: "ابحث عن رحلات"
- Loading, error, empty states

### 3. Services (الخدمات)
- Service cards with icons
- Comparison section

### 4. Booking (إرسال طلب حجز)
- Booking form
- Order summary
- Submit request

### 5. Orders (طلباتي)
- Order list
- Order status
- Empty state

### 6. Favorites (المفضلة)
- Favorite cards
- Empty state

### 7. Notifications (الإشعارات)
- Notification list
- Empty state

### 8. Profile (الملف الشخصي)
- Profile card
- Settings

### 9. Dashboard (لوحة التحكم)
- Stats
- Recent orders
- Quick actions

### 10. AI Agent (الوكيل الذكي)
- Chat interface
- Suggestions

---

## Required States

Every screen MUST have:
- ✅ Loading state (spinner/skeleton)
- ✅ Error state (with retry)
- ✅ Empty state (with action)
- ✅ Success state

---

## Component Examples

### Bottom Navigation
```tsx
<nav className="fixed bottom-0 w-full bg-ivory border-t border-mist">
  <div className="flex justify-around py-3">
    <NavItem icon={Home} label="الرئيسية" href="/" active />
    <NavItem icon={Search} label="البحث" href="/search" />
    <NavItem icon={Booking} label="حجزي" href="/orders" />
    <NavItem icon={Heart} label="المفضلة" href="/favorites" />
    <NavItem icon={User} label="حسابي" href="/profile" />
  </div>
</nav>
```

### Primary Button
```tsx
<button className="w-full py-4 bg-charcoal text-white rounded-xl font-cairo font-semibold">
  {children}
</button>
```

### Service Card
```tsx
<div className="bg-sand border border-mist rounded-2xl p-6">
  <Icon className="text-champagne w-8 h-8 mb-4" />
  <h3 className="font-cairo font-semibold text-charcoal">{title}</h3>
  <p className="text-secondary mt-2">{description}</p>
</div>
```

---

## Prohibited

- ❌ Blue/Purple colors
- ❌ Weak Arabic fonts (use Cairo)
- ❌ Cluttered layouts
- ❌ Non-functional buttons
- ❌ Missing states
- ❌ Showing logout for non-logged-in users
- ❌ Full payment implementation in MVP

---

## Reference

Primary visual reference:
`docs/brand/reference/flystay-brand-reference-02-primary.jpeg`

Brand values file:
`src/lib/brand/flystayBrand.ts`

CSS variables:
`src/styles/flystay-brand.css`

---

**Remember:** Luxury Travel Minimal - فاخر، هادئ، عالمي، نظيف
