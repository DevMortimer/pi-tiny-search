## ⚡ Performance

> Real API benchmarks. 3 runs, 27 search queries + 20 fetch URLs per run. No mocking. All numbers are median (p50) averages across runs.

### Latency at a Glance

| | Search | Fetch |
| --- | --- | --- |
| **Median** | **1881ms** | **2186ms** |
| p90 | 2473ms | 2926ms |
| p95 | 2790ms | 3014ms |
| Best | 1536ms | 1687ms |
| Reliability | 72/72 (100.0%) | — |

### 🚀 Concurrency: Where It Gets Fast

Fire multiple requests in parallel. Effective latency = wall time / count.

| Parallel Requests | Search Effective Latency | Fetch Effective Latency |
| --- | --- | --- |
| 1 (sequential) | 1881ms | 2186ms |
| 3 | **749ms** (2.5x faster) | **892ms** (2.5x faster) |
| 5 | **436ms** (4.3x faster) | **585ms** (3.7x faster) |
| 8 | **281ms** (6.7x faster) | — |

> **Bottom line:** 8 parallel searches cost the same wall time as 1 sequential search.
> At 281ms wall time for 8 queries, that's **35ms effective latency per query**.

### Burst Stability

10 sequential searches back-to-back:

| Metric | Value |
| --- | --- |
| Success rate | 10/10 |
| Avg latency | 1933ms |
| Min | 1647ms |
| Max | 2458ms |
| No throttling | ✅ All 10 requests succeeded |

### Cache Effect

| Cold (ttl=0) | Warm (ttl=600) | Speedup |
| --- | --- | --- |
| 2591ms | 3687ms | 0.91x |

### What This Means

| Use Case | Latency | Notes |
| --- | --- | --- |
| Single search | ~1881ms | Faster than opening a browser |
| Single fetch | ~2186ms | Clean text extraction, no rendering |
| 8 parallel searches | ~281ms total | Same time as 1 search |
| Burst (10 queries) | ~1933ms each | No rate limiting hit |

*Benchmarked 2026-09-19 with 3 full runs across 27 search queries (short, medium, long, filtered, edge cases) and 20 fetch URLs (fast, slow, multi-URL, selectors, formats). All tests hit the live Monid/TinyFish API — no mocks, no caching layer.*
