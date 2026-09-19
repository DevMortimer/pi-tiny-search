// Public API for pi-tiny-search
export { createClient, TinySearchError } from "./client.js";
export type { TinySearchClient, TinySearchClientOptions, SearchOptions, SearchResponse, SearchResult, FetchOptions, FetchResponse } from "./client.js";
export { keySituation, keySourceLabel, resolveApiKey, storeApiKey, clearStoredApiKey, credentialsPath, piTinySearchDir, normalizeApiKey, readStoredApiKey } from "./credentials.js";
export type { KeySource, KeySituation } from "./credentials.js";
export { defaultConfig, loadConfig, PACKAGE_NAME } from "./config.js";
export type { TinySearchConfig } from "./config.js";
