# pi-tiny-search Performance Report

> Generated: 2026-09-19T14:27:59.849Z | Runs: 2 | Samples: 54

## Summary

| Metric | Search | Fetch |
| --- | --- | --- |
| Samples | 27 | 20 |
| Median (p50) | 1933ms | 2038ms |
| p90 | 2355ms | 2867ms |
| p95 | 2764ms | 2868ms |
| p99 | 3161ms | 3254ms |
| Mean | 1962ms | 2237ms |
| Min | 1642ms | 1704ms |
| Max | 3161ms | 3254ms |

## Search Latency by Query Type

| Category | Median | p90 | p95 | Samples |
| --- | --- | --- | --- | --- |
| page-2 | 1642ms | 1642ms | 1642ms | 1 |
| page-5 | 1734ms | 1734ms | 1734ms | 1 |
| short | 1740ms | 2099ms | 2099ms | 5 |
| domain-research | 1740ms | 1740ms | 1740ms | 1 |
| purpose | 1746ms | 2047ms | 2047ms | 2 |
| special-chars | 1754ms | 1842ms | 1842ms | 2 |
| medium | 1906ms | 2764ms | 2764ms | 5 |
| site-filter | 1941ms | 1945ms | 1945ms | 3 |
| long | 1944ms | 2154ms | 2154ms | 3 |
| edge-long | 1945ms | 1945ms | 1945ms | 1 |
| domain-news | 1946ms | 1946ms | 1946ms | 1 |
| edge-short | 2355ms | 2355ms | 2355ms | 1 |
| recency | 3161ms | 3161ms | 3161ms | 1 |

## Fetch Latency by Page Type

| Category | Median | p90 | p95 | Samples |
| --- | --- | --- | --- | --- |
| complex | 1704ms | 1704ms | 1704ms | 1 |
| ttl-cached | 1818ms | 1818ms | 1818ms | 1 |
| edge-redirect | 1823ms | 1823ms | 1823ms | 1 |
| selector | 1945ms | 1945ms | 1945ms | 1 |
| format-html | 1945ms | 1945ms | 1945ms | 1 |
| selector-readme | 1946ms | 1946ms | 1946ms | 1 |
| text-heavy | 1964ms | 1964ms | 1964ms | 1 |
| format-json | 1979ms | 1979ms | 1979ms | 1 |
| docs | 1981ms | 2561ms | 2561ms | 2 |
| large | 1981ms | 3254ms | 3254ms | 3 |
| ttl-live | 2038ms | 2038ms | 2038ms | 1 |
| readme | 2169ms | 2169ms | 2169ms | 1 |
| medium | 2216ms | 2561ms | 2561ms | 3 |
| links | 2216ms | 2216ms | 2216ms | 1 |
| fast | 2354ms | 2868ms | 2868ms | 3 |
| minimal | 2354ms | 2354ms | 2354ms | 1 |
| edge-404 | 2399ms | 2399ms | 2399ms | 1 |
| multi | 2457ms | 2457ms | 2457ms | 1 |
| purpose | 2459ms | 2459ms | 2459ms | 1 |
| multi-3 | 2867ms | 2867ms | 2867ms | 1 |
| json | 2868ms | 2868ms | 2868ms | 1 |
| slow | 3254ms | 3254ms | 3254ms | 1 |

## Concurrency

### Search

| Concurrent | Wall Time | Success | Effective Latency |
| --- | --- | --- | --- |
| 3 | 1950ms | 3/3 | 650ms |
| 5 | 2151ms | 5/5 | 430ms |
| 8 | 2119ms | 8/8 | 265ms |

### Fetch

| Concurrent | Wall Time | Success | Effective Latency |
| --- | --- | --- | --- |
| 3 | 2126ms | 3/3 | 709ms |
| 5 | 2469ms | 5/5 | 494ms |

## Burst (Sequential Search)

| Iterations | Success | Min | Max | Avg |
| --- | --- | --- | --- | --- |
| 10 | 10/10 | 1647ms | 2349ms | 1847ms |

## Cache

| Cold (ttl=0) | Warm (ttl=600) | Speedup |
| --- | --- | --- |
| 2765ms | 2357ms | 1.17x |
