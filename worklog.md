# Worklog

---
Task ID: 1
Agent: Main agent (Z.ai)
Task: Build OneShot v0 — cross-posting web app for Korean secondhand marketplaces (당근/Karrot, 번개장터/Bunjang, 중고나라/Naver Cafe, Craigslist Seoul)

Work Log:
- Clarified product concept with user across several turns: guided-assist cross-posting (NO bot automation — ToS ban risk), verified platform API postures via web research (Naver Cafe write API exists → v1 auto-post; Craigslist bulk API is dealers-only; Karrot/Bunjang have no public posting APIs)
- Loaded fullstack-dev skill, initialized Next.js 16 project environment
- Designed Prisma schema: Listing (master item) + PlatformPost (per-platform version & status), SQLite via db:push
- Built platform adapter layer (src/lib/platforms.ts): per-platform rules (title conventions, upload URLs, how-to notes, brand colors), condition/category/shipping maps, KRW formatting, rule-based fallback generator
- Built AI engine (src/lib/ai.ts): z-ai-web-dev-sdk server-side, one structured-JSON call generates 4 platform versions (KR casual for Karrot, KR keywords+hashtags for Bunjang, KR polite [판매] format for Joongonara, EN translation for Craigslist), robust JSON extraction + graceful template fallback
- API routes: POST/GET /api/listings (create triggers AI), PATCH/DELETE /api/listings/[id], POST /api/listings/[id]/regenerate, PATCH /api/platform-posts/[id] (status READY→POSTED→CHATTING→SOLD), POST /api/upload (sharp resize 1200px JPEG → public/uploads)
- UI (single-page SPA in src/app/page.tsx per skill constraint): dashboard w/ stats + platform-dot cards, new-listing form (photo upload w/ previews, condition cards, animated AI writing states), workspace (4 platform cards w/ copy buttons, open links, per-platform status select, AI rewrite), GuidedQueue dialog (4-step walkthrough: copy → open platform → mark posted → next, celebration summary)
- Karrot-orange theme (oklch primary), rounded-3xl cards, mobile-first responsive, sticky footer
- Verified with agent-browser: dashboard render, full form submit → AI generation (~10s), workspace cards, complete 4-step queue walkthrough, statuses persisted, mobile 390px layout, zero console errors; API flow tested via curl (create/status/regenerate/delete all 200)
- Cleaned test data for clean first run

Stage Summary:
- Deliverable: OneShot v0 web app (write once → 4 AI-generated platform versions → guided posting queue → status board)
- Key decisions: assist-mode posting (no bots), AI with template fallback, SPA view-state routing, English UI + KR/EN generated content
- v1 roadmap hook: 중고나라 mode='api-ready' (Naver Cafe OAuth write API)
- Next: Flutter native client (v2/v3, same API), Android listing keyboard, browser extension for CL/Bunjang web autofill
