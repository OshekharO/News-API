## 2026-09-06 - JSON Pretty-Printing Overhead in API Responses

**Learning:** Manual pretty-printed JSON serialization (`JSON.stringify(data, null, 2)`) adds substantial CPU overhead for formatting whitespace and inflates network payload sizes by ~30–40% on average. Replacing `JSON.stringify(..., null, 2)` + `res.send()` with standard Express `res.json()` eliminates indentation/formatting overhead, cuts response bandwidth significantly, and improves handler throughput.
**Action:** Always use native Express `res.json()` for JSON API responses instead of manually formatting stringified JSON with whitespace.
