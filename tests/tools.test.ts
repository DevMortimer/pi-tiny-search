import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchArgs } from "../src/search.js";
import { normalizeFetchArgs } from "../src/fetch.js";
import { defaultConfig } from "../src/config.js";

describe("search", () => {
  it("normalizeSearchArgs passes through query", () => {
    const result = normalizeSearchArgs({ query: "test" });
    assert.equal(result.query, "test");
  });

  it("normalizeSearchArgs defaults to empty query", () => {
    const result = normalizeSearchArgs({});
    assert.equal(result.query, "");
  });

  it("normalizeSearchArgs handles all filter params", () => {
    const result = normalizeSearchArgs({
      query: "test",
      domain_type: "news",
      location: "US",
      language: "en",
      include_domains: "example.com",
      exclude_domains: "spam.com",
      recency_minutes: 60,
      after_date: "2024-01-01",
      before_date: "2024-12-31",
      page: 1,
      purpose: "research",
    });
    assert.equal(result.domain_type, "news");
    assert.equal(result.location, "US");
    assert.equal(result.language, "en");
    assert.equal(result.include_domains, "example.com");
    assert.equal(result.exclude_domains, "spam.com");
    assert.equal(result.recency_minutes, 60);
    assert.equal(result.after_date, "2024-01-01");
    assert.equal(result.before_date, "2024-12-31");
    assert.equal(result.page, 1);
    assert.equal(result.purpose, "research");
  });
});

describe("fetch", () => {
  it("normalizeFetchArgs passes through urls", () => {
    const result = normalizeFetchArgs({ urls: ["https://example.com"] });
    assert.deepEqual(result.urls, ["https://example.com"]);
  });

  it("normalizeFetchArgs handles single url fallback", () => {
    const result = normalizeFetchArgs({ url: "https://example.com" });
    assert.deepEqual(result.urls, ["https://example.com"]);
  });

  it("normalizeFetchArgs handles selectors", () => {
    const result = normalizeFetchArgs({ urls: ["https://example.com"], include_selectors: ["h1", "p"] });
    assert.deepEqual(result.include_selectors, ["h1", "p"]);
  });
});

describe("config", () => {
  it("defaultConfig returns expected defaults", () => {
    const config = defaultConfig();
    assert.equal(config.enabled, false);
    assert.equal(config.defaultDomainType, "web");
    assert.equal(config.defaultResults, 5);
    assert.equal(config.timeoutMs, 30_000);
    assert.equal(config.baseUrl, "https://api.monid.ai");
  });
});
