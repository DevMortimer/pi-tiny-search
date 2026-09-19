# pi-tiny-search Performance Report

> Generated: 2026-09-19T14:31:50.247Z | Runs: 3 | Samples: 54

## Summary

| Metric | Search | Fetch |
| --- | --- | --- |
| Samples | 27 | 20 |
| Median (p50) | 1845ms | 2242ms |
| p90 | 2867ms | 2620ms |
| p95 | 3308ms | 2765ms |
| p99 | 3426ms | 5686ms |
| Mean | 2034ms | 2376ms |
| Min | 1536ms | 1687ms |
| Max | 3426ms | 5686ms |

## Search Latency by Query Type

| Category | Median | p90 | p95 | Samples |
| --- | --- | --- | --- | --- |
| page-2 | 1701ms | 1701ms | 1701ms | 1 |
| site-filter | 1731ms | 2271ms | 2271ms | 3 |
| long | 1747ms | 1751ms | 1751ms | 3 |
| special-chars | 1807ms | 1877ms | 1877ms | 2 |
| short | 1808ms | 1977ms | 1977ms | 5 |
| purpose | 1841ms | 2604ms | 2604ms | 2 |
| edge-long | 1845ms | 1845ms | 1845ms | 1 |
| medium | 1853ms | 2329ms | 2329ms | 5 |
| page-5 | 1944ms | 1944ms | 1944ms | 1 |
| edge-short | 2150ms | 2150ms | 2150ms | 1 |
| recency | 2867ms | 2867ms | 2867ms | 1 |
| domain-research | 3308ms | 3308ms | 3308ms | 1 |
| domain-news | 3426ms | 3426ms | 3426ms | 1 |

## Fetch Latency by Page Type

| Category | Median | p90 | p95 | Samples |
| --- | --- | --- | --- | --- |
| edge-404 | 1687ms | 1687ms | 1687ms | 1 |
| minimal | 1824ms | 1824ms | 1824ms | 1 |
| complex | 1842ms | 1842ms | 1842ms | 1 |
| edge-redirect | 1965ms | 1965ms | 1965ms | 1 |
| format-json | 1994ms | 1994ms | 1994ms | 1 |
| docs | 1999ms | 2254ms | 2254ms | 2 |
| fast | 2051ms | 2371ms | 2371ms | 3 |
| json | 2051ms | 2051ms | 2051ms | 1 |
| ttl-live | 2062ms | 2062ms | 2062ms | 1 |
| medium | 2200ms | 2458ms | 2458ms | 3 |
| readme | 2200ms | 2200ms | 2200ms | 1 |
| selector | 2242ms | 2242ms | 2242ms | 1 |
| multi | 2253ms | 2253ms | 2253ms | 1 |
| large | 2254ms | 5686ms | 5686ms | 3 |
| selector-readme | 2265ms | 2265ms | 2265ms | 1 |
| text-heavy | 2371ms | 2371ms | 2371ms | 1 |
| ttl-cached | 2433ms | 2433ms | 2433ms | 1 |
| links | 2458ms | 2458ms | 2458ms | 1 |
| multi-3 | 2558ms | 2558ms | 2558ms | 1 |
| format-html | 2620ms | 2620ms | 2620ms | 1 |
| purpose | 2765ms | 2765ms | 2765ms | 1 |
| slow | 5686ms | 5686ms | 5686ms | 1 |

## Concurrency

### Search

| Concurrent | Wall Time | Success | Effective Latency |
| --- | --- | --- | --- |
| 3 | 2438ms | 3/3 | 813ms |
| 5 | 1957ms | 5/5 | 391ms |
| 8 | 2344ms | 8/8 | 293ms |

### Fetch

| Concurrent | Wall Time | Success | Effective Latency |
| --- | --- | --- | --- |
| 3 | 2020ms | 3/3 | 673ms |
| 5 | 3918ms | 5/5 | 784ms |

## Burst (Sequential Search)

| Iterations | Success | Min | Max | Avg |
| --- | --- | --- | --- | --- |
| 10 | 10/10 | 1751ms | 2458ms | 1977ms |

## Cache

| Cold (ttl=0) | Warm (ttl=600) | Speedup |
| --- | --- | --- |
| 2652ms | 2253ms | 1.18x |
