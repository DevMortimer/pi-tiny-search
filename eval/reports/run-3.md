# pi-tiny-search Performance Report

> Generated: 2026-09-19T14:32:46.979Z | Runs: 4 | Samples: 54

## Summary

| Metric | Search | Fetch |
| --- | --- | --- |
| Samples | 27 | 20 |
| Median (p50) | 1855ms | 2203ms |
| p90 | 2150ms | 4607ms |
| p95 | 2253ms | 5353ms |
| p99 | 3687ms | 7962ms |
| Mean | 1953ms | 2799ms |
| Min | 1621ms | 1831ms |
| Max | 3687ms | 7962ms |

## Search Latency by Query Type

| Category | Median | p90 | p95 | Samples |
| --- | --- | --- | --- | --- |
| domain-news | 1641ms | 1641ms | 1641ms | 1 |
| site-filter | 1675ms | 2150ms | 2150ms | 3 |
| purpose | 1740ms | 1936ms | 1936ms | 2 |
| page-5 | 1741ms | 1741ms | 1741ms | 1 |
| edge-long | 1768ms | 1768ms | 1768ms | 1 |
| special-chars | 1842ms | 2150ms | 2150ms | 2 |
| page-2 | 1843ms | 1843ms | 1843ms | 1 |
| edge-short | 1855ms | 1855ms | 1855ms | 1 |
| short | 1891ms | 2113ms | 2113ms | 5 |
| long | 1910ms | 2148ms | 2148ms | 3 |
| domain-research | 1967ms | 1967ms | 1967ms | 1 |
| medium | 1979ms | 2253ms | 2253ms | 5 |
| recency | 3687ms | 3687ms | 3687ms | 1 |

## Fetch Latency by Page Type

| Category | Median | p90 | p95 | Samples |
| --- | --- | --- | --- | --- |
| edge-404 | 1831ms | 1831ms | 1831ms | 1 |
| complex | 1891ms | 1891ms | 1891ms | 1 |
| ttl-cached | 1946ms | 1946ms | 1946ms | 1 |
| selector-readme | 2047ms | 2047ms | 2047ms | 1 |
| multi | 2048ms | 2048ms | 2048ms | 1 |
| readme | 2077ms | 2077ms | 2077ms | 1 |
| json | 2124ms | 2124ms | 2124ms | 1 |
| edge-redirect | 2149ms | 2149ms | 2149ms | 1 |
| ttl-live | 2150ms | 2150ms | 2150ms | 1 |
| fast | 2203ms | 2392ms | 2392ms | 3 |
| minimal | 2203ms | 2203ms | 2203ms | 1 |
| format-html | 2226ms | 2226ms | 2226ms | 1 |
| docs | 2307ms | 2454ms | 2454ms | 2 |
| large | 2307ms | 3085ms | 3085ms | 3 |
| multi-3 | 2356ms | 2356ms | 2356ms | 1 |
| text-heavy | 2392ms | 2392ms | 2392ms | 1 |
| medium | 2454ms | 7962ms | 7962ms | 3 |
| purpose | 2764ms | 2764ms | 2764ms | 1 |
| slow | 3085ms | 3085ms | 3085ms | 1 |
| selector | 4607ms | 4607ms | 4607ms | 1 |
| format-json | 5353ms | 5353ms | 5353ms | 1 |
| links | 7962ms | 7962ms | 7962ms | 1 |

## Concurrency

### Search

| Concurrent | Wall Time | Success | Effective Latency |
| --- | --- | --- | --- |
| 3 | 1918ms | 3/3 | 639ms |
| 5 | 2123ms | 5/5 | 425ms |
| 8 | 2230ms | 8/8 | 279ms |

### Fetch

| Concurrent | Wall Time | Success | Effective Latency |
| --- | --- | --- | --- |
| 3 | 2740ms | 3/3 | 913ms |
| 5 | 2999ms | 5/5 | 600ms |

## Burst (Sequential Search)

| Iterations | Success | Min | Max | Avg |
| --- | --- | --- | --- | --- |
| 10 | 10/10 | 1645ms | 2150ms | 1943ms |

## Cache

| Cold (ttl=0) | Warm (ttl=600) | Speedup |
| --- | --- | --- |
| 2457ms | 2254ms | 1.09x |
