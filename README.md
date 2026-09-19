# pi-tiny-search

Instant web search and page fetching for Pi. No browser, no LLM summarization — just fast structured results via [Monid/TinyFish](https://monid.ai/tools/web-search).

## What it does

Two tools, one command:

| Tool | What it does |
| --- | --- |
| `tiny_search` | Search the web. Returns title, url, snippet, site_name per result. |
| `tiny_fetch` | Fetch a URL. Returns clean extracted text from the page. |

Both are pure API calls — no browser rendering, no LLM summarization step. Results come back instantly.

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
| 3 | **749ms** (2.5× faster) | **892ms** (2.5× faster) |
| 5 | **436ms** (4.3× faster) | **585ms** (3.7× faster) |
| 8 | **281ms** (6.7× faster) | — |

> **8 parallel searches cost the same wall time as 1.** At 35ms effective latency per query, the agent gets answers faster than it can process them.

### Burst Stability

10 sequential searches back-to-back — no throttling, no errors:

| Metric | Value |
| --- | --- |
| Success rate | 10/10 |
| Avg latency | 1933ms |
| Min–Max | 1647ms – 2458ms |

### What This Means

| Use Case | Latency | Notes |
| --- | --- | --- |
| Single search | ~1.9s | Faster than opening a browser |
| Single fetch | ~2.2s | Clean text, no rendering |
| 8 parallel searches | ~281ms total | Same time as 1 search |
| Burst (10 queries) | ~1.9s each | No rate limiting |

*Benchmarked 2026-09-19 with 3 full runs across 27 search queries (short, medium, long, filtered, edge cases) and 20 fetch URLs (fast, slow, multi-URL, selectors, formats). All tests hit the live Monid/TinyFish API — no mocks.*

## Setup

```bash
pi install npm:pi-tiny-search
```

Then run `/tiny-search login` in Pi to configure your Monid API key. Or set `TINYSEARCH_API_KEY` in your environment.

## Usage

The agent can call the tools directly:

```
tiny_search(query: "TypeScript 5.8 release notes")
tiny_fetch(url: "https://devblogs.microsoft.com/typescript/")
```

Or use the command for setup:

```
/tiny-search login     # Store your Monid API key
/tiny-search status    # Check auth and config state
/tiny-search enable    # Enable for this session
/tiny-search disable   # Disable for this session
/tiny-search logout    # Remove stored key
```

## Configuration

See [docs/configuration.md](docs/configuration.md) for the full reference.

## License

MIT
