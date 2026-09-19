#!/usr/bin/env node
/**
 * pi-tiny-search performance evaluation suite
 *
 * Measures real-world API latency, throughput, reliability, and edge cases.
 * Run: node --env-file-if-exists=.env eval/perf.mjs
 * Loop: eval/run-perf.sh
 *
 * Outputs JSON to stdout and a markdown summary to eval/reports/
 */

import { performance } from "node:perf_hooks";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(__dirname, "reports");

// ── Config ──────────────────────────────────────────────────────────────
const API_KEY = process.env.TINYSEARCH_API_KEY;
const BASE_URL = process.env.TINYSEARCH_BASE_URL || "https://api.monid.ai";
const TIMEOUT_MS = 30_000;

if (!API_KEY) {
  console.error("Set TINYSEARCH_API_KEY env var. Copy from ~/.pi/agent/pi-tiny-search/auth.json");
  process.exit(1);
}

// ── Search Queries ──────────────────────────────────────────────────────
const SEARCH_QUERIES = [
  // Short queries
  { query: "TypeScript 5.8", tags: ["short"] },
  { query: "React hooks", tags: ["short"] },
  { query: "Node.js benchmarks", tags: ["short"] },
  { query: "Rust vs Go", tags: ["short"] },
  { query: "Docker best practices", tags: ["short"] },

  // Medium queries
  { query: "how to optimize React rendering performance 2026", tags: ["medium"] },
  { query: "TypeScript strict mode migration guide", tags: ["medium"] },
  { query: "PostgreSQL query optimization techniques", tags: ["medium"] },
  { query: "Kubernetes autoscaling configuration", tags: ["medium"] },
  { query: "AWS Lambda cold start solutions", tags: ["medium"] },

  // Long / complex queries
  { query: "comprehensive comparison of JavaScript bundlers in 2026 webpack vite esbuild rolldown", tags: ["long"] },
  { query: "building production microservices with Node.js express fastify hono", tags: ["long"] },
  { query: "database indexing strategies for high traffic web applications postgres mysql", tags: ["long"] },

  // Site-filtered queries
  { query: "site:github.com pi-coding-agent", tags: ["site-filter"] },
  { query: "site:arxiv.org transformer attention mechanism", tags: ["site-filter"] },
  { query: "site:news.ycombinator.com best tools 2026", tags: ["site-filter"] },

  // Domain type variants
  { query: "artificial intelligence latest research", tags: ["domain-news"], domain_type: "news" },
  { query: "quantum computing breakthroughs", tags: ["domain-research"], domain_type: "research_paper" },

  // Purpose-sharpened
  { query: "best typescript ORM for postgres", tags: ["purpose"], purpose: "I need to pick an ORM for a new project" },
  { query: "how to deploy Next.js on AWS", tags: ["purpose"], purpose: "Setting up CI/CD for a SaaS app" },

  // Pagination
  { query: "JavaScript frameworks", tags: ["page-2"], page: 2 },
  { query: "JavaScript frameworks", tags: ["page-5"], page: 5 },

  // Recency filter
  { query: "AI news", tags: ["recency"], recency_minutes: 60 },

  // Edge: unusual characters
  { query: "C++ concepts vs Rust traits", tags: ["special-chars"] },
  { query: "CSS :has() selector browser support", tags: ["special-chars"] },

  // Edge: very long query
  { query: "a".repeat(300), tags: ["edge-long"] },

  // Edge: empty-ish
  { query: "x", tags: ["edge-short"] },
];

// ── Fetch URLs ──────────────────────────────────────────────────────────
const FETCH_URLS = [
  // Fast, small pages
  { urls: ["https://httpbin.org/get"], tags: ["fast", "json"] },
  { urls: ["https://example.com"], tags: ["fast", "minimal"] },
  { urls: ["https://www.wikipedia.org"], tags: ["fast", "text-heavy"] },

  // Medium pages
  { urls: ["https://news.ycombinator.com"], tags: ["medium", "links"] },
  { urls: ["https://github.com/DevMortimer/pi-tiny-search"], tags: ["medium", "readme"] },
  { urls: ["https://docs.python.org/3/"], tags: ["medium", "docs"] },

  // Larger pages
  { urls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript"], tags: ["large", "docs"] },
  { urls: ["https://stackoverflow.com/questions/tagged/typescript?sort=votes"], tags: ["large", "complex"] },

  // Multi-URL fetch
  { urls: ["https://example.com", "https://httpbin.org/get"], tags: ["multi"] },
  { urls: ["https://example.com", "https://httpbin.org/get", "https://news.ycombinator.com"], tags: ["multi-3"] },

  // With selectors
  { urls: ["https://news.ycombinator.com"], include_selectors: [".titleline"], tags: ["selector"] },
  { urls: ["https://github.com/DevMortimer/pi-tiny-search"], include_selectors: ["article"], tags: ["selector-readme"] },

  // Format variants
  { urls: ["https://example.com"], format: "html", tags: ["format-html"] },
  { urls: ["https://httpbin.org/get"], format: "json", tags: ["format-json"] },

  // TTL: force live
  { urls: ["https://example.com"], ttl: 0, tags: ["ttl-live"] },

  // TTL: cached
  { urls: ["https://example.com"], ttl: 300, tags: ["ttl-cached"] },

  // Purpose
  { urls: ["https://github.com/DevMortimer/pi-tiny-search"], purpose: "Reading the README to understand the tool", tags: ["purpose"] },

  // Slow-ish page (to test timeout tolerance)
  { urls: ["https://en.wikipedia.org/wiki/JavaScript"], tags: ["slow", "large"] },

  // Edge: likely 404
  { urls: ["https://httpbin.org/status/404"], tags: ["edge-404"] },

  // Edge: redirect
  { urls: ["https://httpbin.org/redirect/2"], tags: ["edge-redirect"] },
];

// ── API Helpers ─────────────────────────────────────────────────────────
async function searchAPI(input) {
  const { tags: _tags, ...params } = input;
  const res = await fetch(`${BASE_URL}/v1/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ provider: "tinyfish", endpoint: "/search", input: { queryParams: params } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) { const body = await res.text().catch(() => ''); throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`); }
  return res.json();
}

async function fetchAPI(input) {
  const { tags: _tags, ...params } = input;
  const res = await fetch(`${BASE_URL}/v1/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ provider: "tinyfish", endpoint: "/fetch", input: { body: params } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) { const body = await res.text().catch(() => ''); throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`); }
  return res.json();
}

// ── Benchmarks ──────────────────────────────────────────────────────────
async function benchSearch(q, runIndex) {
  const start = performance.now();
  let ok = false;
  let resultCount = 0;
  let error = null;
  try {
    const data = await searchAPI(q);
    const output = data.output || {};
    resultCount = (output.results || []).length;
    ok = true;
  } catch (e) {
    error = e.message || String(e);
  }
  const latencyMs = performance.now() - start;
  return { kind: "search", ...q, runIndex, latencyMs, ok, resultCount, error };
}

async function benchFetch(f, runIndex) {
  const start = performance.now();
  let ok = false;
  let textLength = 0;
  let error = null;
  try {
    const data = await fetchAPI(f);
    const output = data.output || {};
    const results = output.results || [];
    textLength = results.reduce((s, r) => s + (r.text || "").length, 0);
    ok = true;
  } catch (e) {
    error = e.message || String(e);
  }
  const latencyMs = performance.now() - start;
  return { kind: "fetch", ...f, runIndex, latencyMs, ok, textLength, error };
}

// ── Concurrency test ────────────────────────────────────────────────────
async function benchConcurrentSearches(count, runIndex) {
  const queries = SEARCH_QUERIES.slice(0, count);
  const start = performance.now();
  const results = await Promise.allSettled(queries.map(q => searchAPI(q)));
  const wallMs = performance.now() - start;
  const successes = results.filter(r => r.status === "fulfilled").length;
  return { kind: "concurrent-search", count, wallMs, successes, avgLatencyMs: wallMs / count, runIndex };
}

async function benchConcurrentFetches(count, runIndex) {
  const fetches = FETCH_URLS.slice(0, count);
  const start = performance.now();
  const results = await Promise.allSettled(fetches.map(f => fetchAPI(f)));
  const wallMs = performance.now() - start;
  const successes = results.filter(r => r.status === "fulfilled").length;
  return { kind: "concurrent-fetch", count, wallMs, successes, avgLatencyMs: wallMs / count, runIndex };
}

// ── Burst test ──────────────────────────────────────────────────────────
async function benchBurstSearch(iterations, runIndex) {
  const results = [];
  for (let i = 0; i < iterations; i++) {
    const q = SEARCH_QUERIES[i % SEARCH_QUERIES.length];
    const start = performance.now();
    let ok = false, error = null;
    try { await searchAPI(q); ok = true; } catch (e) { error = e.message; }
    results.push({ iteration: i, latencyMs: performance.now() - start, ok, error });
  }
  const latencies = results.filter(r => r.ok).map(r => r.latencyMs);
  const successes = results.filter(r => r.ok).length;
  return { kind: "burst-search", iterations, successes, latencies: { min: Math.min(...latencies), max: Math.max(...latencies), avg: latencies.reduce((a, b) => a + b, 0) / latencies.length }, runIndex };
}

// ── Cache test ──────────────────────────────────────────────────────────
async function benchCache(runIndex) {
  const url = { urls: ["https://example.com"] };
  const cold = await benchFetch({ ...url, ttl: 0 }, runIndex);
  const warm = await benchFetch({ ...url, ttl: 600 }, runIndex);
  return { kind: "cache", coldLatencyMs: cold.latencyMs, warmLatencyMs: warm.latencyMs, speedup: cold.latencyMs / warm.latencyMs, runIndex };
}

// ── Statistics ──────────────────────────────────────────────────────────
function percentile(sorted, p) {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function stats(latencies) {
  const sorted = [...latencies].sort((a, b) => a - b);
  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
    p50: percentile(sorted, 50),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  };
}

// ── Report Generator ────────────────────────────────────────────────────
function generateReport(allResults, runCount) {
  const searchResults = allResults.filter(r => r.kind === "search" && r.ok);
  const fetchResults = allResults.filter(r => r.kind === "fetch" && r.ok);
  const concurrentSearch = allResults.filter(r => r.kind === "concurrent-search");
  const concurrentFetch = allResults.filter(r => r.kind === "concurrent-fetch");
  const burstSearch = allResults.filter(r => r.kind === "burst-search");
  const cacheResults = allResults.filter(r => r.kind === "cache");

  const searchLatencies = searchResults.map(r => r.latencyMs);
  const fetchLatencies = fetchResults.map(r => r.latencyMs);

  // Per-tag search stats
  const searchTags = {};
  for (const r of searchResults) {
    for (const tag of r.tags || []) {
      if (!searchTags[tag]) searchTags[tag] = [];
      searchTags[tag].push(r.latencyMs);
    }
  }

  // Per-tag fetch stats
  const fetchTags = {};
  for (const r of fetchResults) {
    for (const tag of r.tags || []) {
      if (!fetchTags[tag]) fetchTags[tag] = [];
      fetchTags[tag].push(r.latencyMs);
    }
  }

  const searchStats = stats(searchLatencies);
  const fetchStats = stats(fetchLatencies);

  const report = {
    meta: { runCount, totalResults: allResults.length, timestamp: new Date().toISOString() },
    search: {
      overall: searchStats,
      byTag: Object.fromEntries(Object.entries(searchTags).map(([k, v]) => [k, stats(v)])),
    },
    fetch: {
      overall: fetchStats,
      byTag: Object.fromEntries(Object.entries(fetchTags).map(([k, v]) => [k, stats(v)])),
    },
    concurrent: {
      search: concurrentSearch.map(r => ({ count: r.count, wallMs: r.wallMs, successes: r.successes })),
      fetch: concurrentFetch.map(r => ({ count: r.count, wallMs: r.wallMs, successes: r.successes })),
    },
    burst: burstSearch.map(r => ({ iterations: r.iterations, successes: r.successes, latencies: r.latencies })),
    cache: cacheResults.map(r => ({ coldLatencyMs: r.coldLatencyMs, warmLatencyMs: r.warmLatencyMs, speedup: r.speedup })),
    searchErrors: allResults.filter(r => r.kind === "search" && !r.ok).map(r => ({ query: r.query, error: r.error })),
    fetchErrors: allResults.filter(r => r.kind === "fetch" && !r.ok).map(r => ({ urls: r.urls, error: r.error })),
  };

  return report;
}

function generateMarkdown(report) {
  const s = report.search.overall;
  const f = report.fetch.overall;

  let md = `# pi-tiny-search Performance Report\n\n`;
  md += `> Generated: ${report.meta.timestamp} | Runs: ${report.meta.runCount} | Samples: ${report.meta.totalResults}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Search | Fetch |\n`;
  md += `| --- | --- | --- |\n`;
  md += `| Samples | ${s.count} | ${f.count} |\n`;
  md += `| Median (p50) | ${s.p50.toFixed(0)}ms | ${f.p50.toFixed(0)}ms |\n`;
  md += `| p90 | ${s.p90.toFixed(0)}ms | ${f.p90.toFixed(0)}ms |\n`;
  md += `| p95 | ${s.p95.toFixed(0)}ms | ${f.p95.toFixed(0)}ms |\n`;
  md += `| p99 | ${s.p99.toFixed(0)}ms | ${f.p99.toFixed(0)}ms |\n`;
  md += `| Mean | ${s.avg.toFixed(0)}ms | ${f.avg.toFixed(0)}ms |\n`;
  md += `| Min | ${s.min.toFixed(0)}ms | ${f.min.toFixed(0)}ms |\n`;
  md += `| Max | ${s.max.toFixed(0)}ms | ${f.max.toFixed(0)}ms |\n`;

  // Search by query type
  md += `\n## Search Latency by Query Type\n\n`;
  md += `| Category | Median | p90 | p95 | Samples |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  for (const [tag, latencies] of Object.entries(report.search.byTag).sort((a, b) => a[1].p50 - b[1].p50)) {
    md += `| ${tag} | ${latencies.p50.toFixed(0)}ms | ${latencies.p90.toFixed(0)}ms | ${latencies.p95.toFixed(0)}ms | ${latencies.count} |\n`;
  }

  // Fetch by page type
  md += `\n## Fetch Latency by Page Type\n\n`;
  md += `| Category | Median | p90 | p95 | Samples |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  for (const [tag, latencies] of Object.entries(report.fetch.byTag).sort((a, b) => a[1].p50 - b[1].p50)) {
    md += `| ${tag} | ${latencies.p50.toFixed(0)}ms | ${latencies.p90.toFixed(0)}ms | ${latencies.p95.toFixed(0)}ms | ${latencies.count} |\n`;
  }

  // Concurrency
  md += `\n## Concurrency\n\n`;
  md += `### Search\n\n`;
  md += `| Concurrent | Wall Time | Success | Effective Latency |\n`;
  md += `| --- | --- | --- | --- |\n`;
  for (const c of report.concurrent.search) {
    md += `| ${c.count} | ${c.wallMs.toFixed(0)}ms | ${c.successes}/${c.count} | ${(c.wallMs / c.count).toFixed(0)}ms |\n`;
  }

  md += `\n### Fetch\n\n`;
  md += `| Concurrent | Wall Time | Success | Effective Latency |\n`;
  md += `| --- | --- | --- | --- |\n`;
  for (const c of report.concurrent.fetch) {
    md += `| ${c.count} | ${c.wallMs.toFixed(0)}ms | ${c.successes}/${c.count} | ${(c.wallMs / c.count).toFixed(0)}ms |\n`;
  }

  // Burst
  md += `\n## Burst (Sequential Search)\n\n`;
  md += `| Iterations | Success | Min | Max | Avg |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  for (const b of report.burst) {
    md += `| ${b.iterations} | ${b.successes}/${b.iterations} | ${b.latencies.min.toFixed(0)}ms | ${b.latencies.max.toFixed(0)}ms | ${b.latencies.avg.toFixed(0)}ms |\n`;
  }

  // Cache
  md += `\n## Cache\n\n`;
  md += `| Cold (ttl=0) | Warm (ttl=600) | Speedup |\n`;
  md += `| --- | --- | --- |\n`;
  for (const c of report.cache) {
    md += `| ${c.coldLatencyMs.toFixed(0)}ms | ${c.warmLatencyMs.toFixed(0)}ms | ${c.speedup.toFixed(2)}x |\n`;
  }

  // Errors
  if (report.searchErrors.length || report.fetchErrors.length) {
    md += `\n## Errors\n\n`;
    if (report.searchErrors.length) {
      md += `### Search Errors\n\n`;
      for (const e of report.searchErrors) {
        md += `- \`${e.query}\`: ${e.error}\n`;
      }
    }
    if (report.fetchErrors.length) {
      md += `\n### Fetch Errors\n\n`;
      for (const e of report.fetchErrors) {
        md += `- \`${e.urls?.join(", ")}\`: ${e.error}\n`;
      }
    }
  }

  return md;
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  const runIndex = parseInt(process.env.PERF_RUN_INDEX || "0");
  const startTime = Date.now();
  const allResults = [];

  console.error(`[perf] Run #${runIndex} starting at ${new Date().toISOString()}`);

  // Phase 1: Individual searches (sequential, to get honest latency)
  console.error(`[perf] Phase 1: ${SEARCH_QUERIES.length} sequential searches...`);
  for (const q of SEARCH_QUERIES) {
    const result = await benchSearch(q, runIndex);
    allResults.push(result);
    console.error(`  search "${q.query.slice(0, 40)}..." ${result.ok ? result.latencyMs.toFixed(0) + "ms" : "FAIL " + result.error}`);
  }

  // Phase 2: Individual fetches (sequential)
  console.error(`[perf] Phase 2: ${FETCH_URLS.length} sequential fetches...`);
  for (const f of FETCH_URLS) {
    const result = await benchFetch(f, runIndex);
    allResults.push(result);
    console.error(`  fetch ${(f.urls[0] || "").slice(0, 50)} ${result.ok ? result.latencyMs.toFixed(0) + "ms" : "FAIL " + result.error}`);
  }

  // Phase 3: Concurrent searches (3, 5, 8)
  console.error(`[perf] Phase 3: concurrent search batches...`);
  for (const n of [3, 5, 8]) {
    const r = await benchConcurrentSearches(n, runIndex);
    allResults.push(r);
    console.error(`  concurrent-search x${n} → ${r.wallMs.toFixed(0)}ms wall, ${r.successes}/${n} ok`);
  }

  // Phase 4: Concurrent fetches (3, 5)
  console.error(`[perf] Phase 4: concurrent fetch batches...`);
  for (const n of [3, 5]) {
    const r = await benchConcurrentFetches(n, runIndex);
    allResults.push(r);
    console.error(`  concurrent-fetch x${n} → ${r.wallMs.toFixed(0)}ms wall, ${r.successes}/${n} ok`);
  }

  // Phase 5: Burst (10 sequential searches)
  console.error(`[perf] Phase 5: burst test (10 sequential searches)...`);
  const burst = await benchBurstSearch(10, runIndex);
  allResults.push(burst);
  console.error(`  burst → ${burst.successes}/10 ok, avg ${burst.latencies.avg.toFixed(0)}ms`);

  // Phase 6: Cache comparison
  console.error(`[perf] Phase 6: cache comparison...`);
  const cache = await benchCache(runIndex);
  allResults.push(cache);
  console.error(`  cache → cold ${cache.coldLatencyMs.toFixed(0)}ms, warm ${cache.warmLatencyMs.toFixed(0)}ms (${cache.speedup.toFixed(2)}x)`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.error(`[perf] Run #${runIndex} complete in ${elapsed}s`);

  // Output
  const report = generateReport(allResults, runIndex + 1);
  console.log(JSON.stringify(report, null, 2));

  // Append to markdown report
  mkdirSync(REPORTS_DIR, { recursive: true });
  const mdPath = join(REPORTS_DIR, `run-${runIndex}.md`);
  writeFileSync(mdPath, generateMarkdown(report));
  console.error(`[perf] Report written to ${mdPath}`);

  return report;
}

main().catch(e => {
  console.error("[perf] Fatal:", e);
  process.exit(1);
});
