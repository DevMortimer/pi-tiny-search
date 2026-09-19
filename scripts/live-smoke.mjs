#!/usr/bin/env node
// Live smoke test against the real Monid API. Requires .env with MONID_API_KEY.
import { createClient } from "../dist/index.js";

const key = process.env.MONID_API_KEY || process.env.TINYSEARCH_API_KEY;
if (!key) {
  console.error("Set MONID_API_KEY or TINYSEARCH_API_KEY in .env");
  process.exit(1);
}

const client = createClient({ apiKey: key });

console.log("Testing search...");
try {
  const results = await client.search({ query: "TypeScript 5.8 release notes", page: 0 });
  console.log(`Search OK: ${results.results.length} results`);
  for (const r of results.results.slice(0, 3)) {
    console.log(`  [${r.position}] ${r.title}`);
    console.log(`    ${r.url}`);
  }
} catch (error) {
  console.error("Search failed:", error.message);
  process.exit(1);
}

console.log("\nTesting fetch...");
try {
  const searchResult = await client.search({ query: "TypeScript 5.8 release notes", page: 0 });
  const firstUrl = searchResult.results[0]?.url;
  if (firstUrl) {
    console.log(`Fetching: ${firstUrl}`);
    const page = await client.fetch({ urls: [firstUrl] });
    console.log(`Fetch OK: ${page.results.length} result(s)`);
    for (const r of page.results) {
      console.log(`  ${r.url} — "${r.title}" (${r.text.length} chars)`);
    }
    if (page.errors?.length) {
      for (const e of page.errors) {
        console.log(`  Error: ${e.url} — ${e.code}: ${e.message}`);
      }
    }
  } else {
    console.log("No URL to fetch");
  }
} catch (error) {
  console.error("Fetch failed:", error.message);
  process.exit(1);
}

console.log("\nAll tests passed.");
