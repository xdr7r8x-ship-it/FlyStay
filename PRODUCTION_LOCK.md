# FlyStay Production Lock

**Status: PRODUCTION_READY** ✅

## Production URLs

- **Production:** https://flystay-ten.vercel.app
- **Health Check:** https://flystay-ten.vercel.app/api/discovery/search?t=final-lock

## Required Database State

| Entity | Required | Status |
|--------|----------|--------|
| destinations | ≥80 | ✅ 80 |
| tripTemplates | ≥40 | ✅ 42 |
| stayGuides | ≥40 | ✅ 40 |

## Production Rules

### ✅ Allowed
- Database-backed travel encyclopedia
- Travel requests saved to DB only
- Provider APIs fail closed with 503 SERVICE_NOT_CONFIGURED
- Safe UI messages: "أرسل للمراجعة", "ليس حجزًا مؤكدًا"

### ❌ Forbidden
- Fake prices
- Fake availability
- Fake bookings
- "تم الحجز" / "حجز مؤكد" without real provider
- "احجز الآن" without confirmed booking flow
- In-memory travel requests
- Demo/mock data in production

## Security Rules

- Secrets live ONLY in Vercel/GitHub Secrets
- No secrets in code
- No secrets in commits
- test-db/debug routes removed before push
- No database URL or credentials in responses

## Provider APIs

| API | Unconfigured Response |
|-----|----------------------|
| `/api/flights/search` | 503 SERVICE_NOT_CONFIGURED |
| `/api/hotels/search` | 503 SERVICE_NOT_CONFIGURED |
| `/api/packages/search` | 503 SERVICE_NOT_CONFIGURED |
| `/api/stays/search` | 503 SERVICE_NOT_CONFIGURED |

## Last Verified

- **Date:** 2026-06-23
- **Commit:** 8486049
- **Tag:** v1.0-production-ready
- **Build:** ✅ Passing
- **Lint:** ✅ Passing

## GitHub Actions

- **Workflow:** Database Deploy
- **Secrets Required:**
  - `DATABASE_URL` (pooled)
  - `DIRECT_URL` (direct/non-pooled)
  - `ADMIN_PASSWORD`
