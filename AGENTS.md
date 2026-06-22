# FlyStay - Brand Identity Enforcement

## 🚫 MANDATORY BRAND LOCK

**DO NOT MODIFY, OVERRIDE, OR DEVIATE FROM THIS BRAND IDENTITY.**

Any agent, developer, or contributor working on this repository MUST adhere to the following brand specifications.

---

## Brand Identity (LOCKED)

| Property | Value |
|----------|-------|
| Brand Style | Luxury Travel Minimal |
| Primary Color | Charcoal `#2B2D31` |
| Accent Color | Champagne `#CDB68B` |
| Background | Ivory `#F8F6F1` |
| Secondary Surface | Sand `#E7E3DC` |
| Soft Border | Mist `#F1F1F1` |
| English Typeface | Playfair Display |
| Arabic Typeface | Cairo |
| UI Direction | RTL Arabic First |
| Brand Feeling | فاخر، هادئ، عالمي، نظيف |

---

## Forbidden Actions

- ❌ Changing brand colors to blue, purple, or generic travel colors
- ❌ Using weak Arabic typefaces
- ❌ Using non-unified icons
- ❌ Creating cluttered designs
- ❌ Leaving buttons without functionality
- ❌ Leaving pages without empty/loading/error states
- ❌ Showing logout for non-logged-in users
- ❌ Implementing full automatic payment/booking in MVP
- ❌ Claiming confirmed booking without manual order management
- ❌ Deleting or ignoring reference images
- ❌ Using any previous design that violates the reference

---

## Reference Files

All agents must reference these files for visual guidance:

- `docs/brand/reference/flystay-brand-reference-02-primary.jpeg` (Primary Reference)
- `public/brand/reference/flystay-brand-reference-02-primary.jpeg`
- `src/assets/brand/reference/flystay-brand-reference-02-primary.jpeg`

---

## Implementation Files

Use these files for brand values:

- `brand-lock.json` - Brand colors, fonts, RTL rules, image paths
- `src/lib/brand/flystayBrand.ts` - Programmatic brand exports
- `src/styles/flystay-brand.css` - CSS Variables

---

## Compliance

Before any commit, ensure:

1. ✅ All brand files exist in required paths
2. ✅ Reference images are in `docs/`, `public/`, `src/assets/`
3. ✅ Colors use Charcoal, Champagne, Ivory
4. ✅ Cairo font for Arabic, Playfair Display for English
5. ✅ RTL is fully applied
6. ✅ Design matches Luxury Travel Minimal reference
7. ✅ No build errors
8. ✅ No critical lint errors
9. ✅ All screens are responsive

---

**Last Updated:** 2026-06-22
**Enforced By:** All AI Agents
