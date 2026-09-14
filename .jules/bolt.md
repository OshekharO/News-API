## 2026-09-14 - Parallel Request Processing in Async Scrapers
**Learning:** Sequential processing in array enrichment loops (e.g., using `for...of` with `await`) introduces substantial network latency bottlenecks (O(N * latency)). Refactoring to `Promise.all(items.map(...))` allows network requests to execute concurrently, drastically cutting endpoint response times without compromising output structure or readability.
**Action:** When mapping over search/list items to resolve external metadata or media URLs, leverage `Promise.all` for non-dependent asynchronous tasks.
