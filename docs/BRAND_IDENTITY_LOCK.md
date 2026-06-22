# FlyStay Brand Identity Lock

## Overview

FlyStay is a luxury travel booking platform targeting the Saudi and Gulf markets. This document defines the locked brand identity that ALL agents and developers MUST follow.

---

## Brand Style: Luxury Travel Minimal

### Core Principles
- **Luxury**: Premium feel, sophisticated design
- **Travel**: Travel-focused imagery and concepts
- **Minimal**: Clean, uncluttered, focused on content
- **Arabic First**: RTL direction, Cairo font, Saudi/Gulf market focus

---

## Color Palette

| Color | Name | Hex Code | Usage |
|-------|------|----------|-------|
| Primary | Charcoal | `#2B2D31` | Main buttons, headers, dark backgrounds |
| Accent | Champagne | `#CDB68B` | Luxury touches, borders, highlighted icons |
| Background | Ivory | `#F8F6F1` | Page background |
| Surface | Sand | `#E7E3DC` | Cards, secondary elements |
| Border | Mist | `#F1F1F1` | Soft borders, dividers |
| Text Primary | Charcoal | `#2B2D31` | Main text |
| Text Secondary | Gray | `#5C5D60` | Secondary text |
| Text Muted | Light Gray | `#9A9A9C` | Muted text, placeholders |

### Status Colors
| Status | Hex | Usage |
|--------|-----|-------|
| Success | `#4A7C59` | Success messages |
| Error | `#C45C5C` | Error states |
| Warning | `#D4A84B` | Warnings |
| Info | `#5B7B9A` | Information |

---

## Typography

### Arabic Typography
- **Font**: Cairo
- **Weights**: 300, 400, 500, 600, 700
- **Direction**: RTL
- **Usage**: All Arabic text

### English Typography
- **Font**: Playfair Display
- **Weights**: 400, 500, 600, 700
- **Direction**: LTR
- **Usage**: English headings, brand name

### Font Sizes
```
--font-size-xs: 0.75rem
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem
--font-size-2xl: 1.5rem
--font-size-3xl: 1.875rem
--font-size-4xl: 2.25rem
--font-size-5xl: 3rem
```

---

## Direction: RTL Arabic First

- Primary direction: RTL
- Arabic text: Right to Left
- English text: Left to Right
- Numbers: Western (1, 2, 3)
- Layouts must support both directions

---

## UI Components

### Buttons
- Primary: Charcoal background, white text
- Secondary: Transparent with Charcoal border
- Accent: Champagne border and text
- All buttons must have hover states

### Cards
- Background: Sand (#E7E3DC)
- Border: Mist (#F1F1F1)
- Border radius: 16px (rounded-2xl)
- Shadow: Soft, subtle
- Padding: 24px

### Icons
- Style: Line icons, consistent
- Color: Champagne or Charcoal
- Size: 24px default

### Forms
- Background: Ivory
- Border: Mist
- Focus: Champagne border
- Labels: Cairo font

---

## Reference Images

All visual references are located at:
- `docs/brand/reference/flystay-brand-reference-02-primary.jpeg` (PRIMARY)
- `docs/brand/reference/flystay-brand-reference-01.jpeg`

These images define the visual style that must be followed.

---

## Forbidden Practices

1. ❌ Using blue, purple, or generic travel colors
2. ❌ Using weak Arabic typefaces
3. ❌ Non-unified icons
4. ❌ Cluttered designs
5. ❌ Non-functional buttons
6. ❌ Missing loading/error/empty states
7. ❌ Showing logout for non-logged-in users
8. ❌ Full automatic payment in MVP
9. ❌ Claiming confirmed booking without manual management
10. ❌ Deleting reference images
11. ❌ Using designs that violate this reference

---

## Implementation Checklist

- [ ] All brand files created
- [ ] Reference images in docs/, public/, src/assets/
- [ ] Colors use Charcoal, Champagne, Ivory
- [ ] Cairo font for Arabic
- [ ] Playfair Display for English headings
- [ ] RTL fully applied
- [ ] Design matches Luxury Travel Minimal reference
- [ ] All pages functional
- [ ] All buttons functional
- [ ] All navigation links work
- [ ] Loading states exist
- [ ] Error states exist
- [ ] Empty states exist
- [ ] Responsive design
- [ ] No build errors
- [ ] No critical lint errors

---

**Version:** 1.0.0
**Locked Date:** 2026-06-22
**Enforced:** All agents and developers
