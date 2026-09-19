# pi-tiny-search Performance Report

> Generated: 2026-09-19T14:31:40.929Z | Runs: 1 | Samples: 54

## Summary

| Metric | Search | Fetch |
| --- | --- | --- |
| Samples | 27 | 20 |
| Median (p50) | 1865ms | 2277ms |
| p90 | 2197ms | 3292ms |
| p95 | 2298ms | 3408ms |
| p99 | 2671ms | 3690ms |
| Mean | 1915ms | 2432ms |
| Min | 1595ms | 1844ms |
| Max | 2671ms | 3690ms |

## Search Latency by Query Type

| Category | Median | p90 | p95 | Samples |
| --- | --- | --- | --- | --- |
| purpose | 1670ms | 1673ms | 1673ms | 2 |
| page-2 | 1684ms | 1684ms | 1684ms | 1 |
| domain-research | 1754ms | 1754ms | 1754ms | 1 |
| edge-short | 1788ms | 1788ms | 1788ms | 1 |
| special-chars | 1803ms | 2197ms | 2197ms | 2 |
| long | 1843ms | 1848ms | 1848ms | 3 |
| edge-long | 1852ms | 1852ms | 1852ms | 1 |
| medium | 1908ms | 2183ms | 2183ms | 5 |
| page-5 | 1932ms | 1932ms | 1932ms | 1 |
| site-filter | 1959ms | 1984ms | 1984ms | 3 |
| short | 2026ms | 2298ms | 2298ms | 5 |
| domain-news | 2045ms | 2045ms | 2045ms | 1 |
| recency | 2671ms | 2671ms | 2671ms | 1 |

## Fetch Latency by Page Type

| Category | Median | p90 | p95 | Samples |
| --- | --- | --- | --- | --- |
| json | 1844ms | 1844ms | 1844ms | 1 |
| complex | 1851ms | 1851ms | 1851ms | 1 |
| edge-redirect | 1945ms | 1945ms | 1945ms | 1 |
| fast | 1945ms | 2663ms | 2663ms | 3 |
| minimal | 1945ms | 1945ms | 1945ms | 1 |
| format-json | 1950ms | 1950ms | 1950ms | 1 |
| docs | 2071ms | 2147ms | 2147ms | 2 |
| large | 2071ms | 3278ms | 3278ms | 3 |
| multi | 2185ms | 2185ms | 2185ms | 1 |
| ttl-cached | 2212ms | 2212ms | 2212ms | 1 |
| edge-404 | 2277ms | 2277ms | 2277ms | 1 |
| medium | 2338ms | 2373ms | 2373ms | 3 |
| readme | 2338ms | 2338ms | 2338ms | 1 |
| selector-readme | 2351ms | 2351ms | 2351ms | 1 |
| links | 2373ms | 2373ms | 2373ms | 1 |
| multi-3 | 2395ms | 2395ms | 2395ms | 1 |
| ttl-live | 2424ms | 2424ms | 2424ms | 1 |
| text-heavy | 2663ms | 2663ms | 2663ms | 1 |
| slow | 3278ms | 3278ms | 3278ms | 1 |
| purpose | 3292ms | 3292ms | 3292ms | 1 |
| format-html | 3408ms | 3408ms | 3408ms | 1 |
| selector | 3690ms | 3690ms | 3690ms | 1 |

## Concurrency

### Search

| Concurrent | Wall Time | Success | Effective Latency |
| --- | --- | --- | --- |
| 3 | 2356ms | 3/3 | 785ms |
| 5 | 2435ms | 5/5 | 487ms |
| 8 | 2285ms | 8/8 | 286ms |

### Fetch

| Concurrent | Wall Time | Success | Effective Latency |
| --- | --- | --- | --- |
| 3 | 3881ms | 3/3 | 1294ms |
| 5 | 2378ms | 5/5 | 476ms |

## Burst (Sequential Search)

| Iterations | Success | Min | Max | Avg |
| --- | --- | --- | --- | --- |
| 10 | 10/10 | 1740ms | 2458ms | 1974ms |

## Cache

| Cold (ttl=0) | Warm (ttl=600) | Speedup |
| --- | --- | --- |
| 2356ms | 6451ms | 0.37x |
