---
Task ID: 1
Agent: Main
Task: Rebuild BlueBay Auto Care booking flow + admin dashboard

Work Log:
- Updated Prisma schema with Booking, PromoCode, BlockedTime, AdminSession models
- Ran prisma db push to sync SQLite database
- Created 10 API routes for bookings CRUD, promo codes, blocked times, available slots, and reminders
- Rewrote entire page.tsx (client-side SPA) with new booking flow:
  - Step 1: Vehicle size + Package + Addons
  - Step 2: Date & Time with prominent "NOT GUARANTEED" disclaimer
  - Step 3: Customer info + Promo code redemption
  - Step 4: Review with pending disclaimer + waiver checkbox
  - Step 5: Done — "Request Submitted" with reminder that time is not confirmed
- Built real admin dashboard with 3 tabs: Bookings, Promo Codes, Blocked Times
- Booking flow sends PENDING email to customer and NEW BOOKING email to admin with Confirm/Change Time buttons
- Day-before reminder email system via /api/send-reminders endpoint
- Promo code system: fixed dollar or percent discount, max uses, expiry date
- Blocked times system: block individual time slots or entire days
- Available slots API filters out blocked times
- Refactored all API routes to use shared Prisma client singleton from @/lib/db
- Verified build passes and all API endpoints return correct data

Stage Summary:
- Complete booking flow overhaul with pending state, prominent disclaimers, and proper email sequencing
- Real admin dashboard with booking management, promo code CRUD, and blocked time management
- Promo code redemption integrated into customer-facing booking page
- All API routes using shared Prisma singleton
- Build passes clean, all endpoints tested and working
