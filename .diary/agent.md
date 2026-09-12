# Agent Journal

## 2026-09-12 - Resilient RSS Fallback & URL Parameter Encoding

**Learning:** Unreliable/dead third-party API domains (such as `api.fl-anime.com`) can bring down API routes with uncaught fetch errors. Providing an RSS fallback (e.g., MyAnimeList RSS parsed via `cheerio` with `{ xmlMode: true }`) ensures high availability and valid response structures without breaking client contracts. Unencoded path/query parameters passed directly to third-party endpoints trigger severe runtime exception crashes or bad requests when special characters are included.

**Action:** Always wrap dynamic URL parameters with `encodeURIComponent()` and implement graceful fallbacks for critical external APIs.
