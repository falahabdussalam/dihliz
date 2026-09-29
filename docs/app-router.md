# App Router

All 23 page URLs and five API endpoints are registered under app/. There is no pages/ router.

- app/layout.tsx owns global styles, document metadata and the Dihliz theme. app/providers.tsx initializes AOS animations; app/loading.tsx supplies the route loading indicator.
- Each page.tsx is a server route with metadata. Interactive screens live beside it in page-content.tsx with "use client". Query-dependent screens render inside Suspense.
- Dashboard routes authenticate with requirePageUser() before loading Prisma data. Client mutations call the existing API URLs and then router.refresh().
- Gallery retains 60-second ISR in both the route and its fetch.
- app/api/**/route.ts uses native Request/Response handlers. Session creation and logout use cookies(); validation, roles and audit logging remain in place.
- Navigation uses next/navigation; edit/admission/login parameters use useSearchParams(). /cpanel redirects to /dashboard. proxy.ts continues protecting dashboard and control-panel URLs.

Add new routes as app/<url>/page.tsx, and new HTTP endpoints as app/api/<url>/route.ts. Keep database access in server files and interactive hooks in client components.

Validation: npm run typecheck, npm run build, and production HTTP smoke checks of all page URLs, unauthorized redirects, API validation/method handling, logout cookies and 404s. Authenticated database mutations and legacy external-service workflows require their respective accounts/services for end-to-end testing.

Browser verification: nine public/login routes hydrated without page errors in headless Edge, including the expired-session query message. Fixed invalid heading-inside-paragraph markup on About found during this check.
