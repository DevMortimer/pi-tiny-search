export interface SearchOptions {
  /** The search query. Supports site: and -site: operators. */
  query: string;
  /** web (default), news, or research_paper. */
  domain_type?: "web" | "news" | "research_paper";
  /** Filter by geo location. */
  location?: string;
  /** Filter by language. */
  language?: string;
  /** Comma-separated domains to include. */
  include_domains?: string;
  /** Comma-separated domains to exclude. */
  exclude_domains?: string;
  /** Results from the last N minutes. */
  recency_minutes?: number;
  /** Results after this date (YYYY-MM-DD). */
  after_date?: string;
  /** Results before this date (YYYY-MM-DD). */
  before_date?: string;
  /** Page number (0-10). */
  page?: number;
  /** A short statement of the task the results are for. Sharpens ranking. */
  purpose?: string;
}

export interface SearchResult {
  position: number;
  title: string;
  url: string;
  site_name: string;
  snippet: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results?: number;
}

export interface FetchOptions {
  /** One or more URLs to fetch (max 10). */
  urls: string[];
  /** Output format: markdown (default), html, or json. */
  format?: "markdown" | "html" | "json";
  /** CSS selectors to include (1-20). Scoped extraction. */
  include_selectors?: string[];
  /** CSS selectors to exclude before extraction (1-20). */
  exclude_selectors?: string[];
  /** Cache freshness in seconds. Omit for any cache, 0 for live. */
  ttl?: number;
  /** Include all <a href> links as absolute URLs. */
  links?: boolean;
  /** Include all <img src> links as absolute URLs. */
  image_links?: boolean;
  /** Short statement of the task these results are for. */
  purpose?: string;
}

export interface FetchResult {
  url: string;
  title: string;
  text: string;
  links?: string[];
  image_links?: string[];
  etag?: string;
  last_modified?: string;
  not_modified?: boolean;
  candidate_selectors?: string[];
}

export interface FetchResponse {
  results: FetchResult[];
  errors?: Array<{ url: string; code: string; message?: string }>;
}

export interface TinySearchClientOptions {
  apiKey: string;
  /** Base URL override for testing. */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 30000. */
  timeoutMs?: number;
}

interface RateLimitState {
  searchAttempts: number;
  fetchAttempts: number;
  windowStart: number;
}

const RATE_LIMITS = { search: 30, fetch: 150 } as const;
const RATE_WINDOW_MS = 60_000;

export class TinySearchError extends Error {
  constructor(
    message: string,
    readonly code: "auth" | "rate_limit" | "network" | "invalid_response" | "timeout",
    readonly status?: number,
  ) {
    super(message);
    this.name = "TinySearchError";
  }
}

function assertRateLimit(state: RateLimitState, kind: "search" | "fetch"): void {
  const now = Date.now();
  if (now - state.windowStart > RATE_WINDOW_MS) {
    state.windowStart = now;
    state.searchAttempts = 0;
    state.fetchAttempts = 0;
  }
  const limit = RATE_LIMITS[kind];
  const current = kind === "search" ? state.searchAttempts : state.fetchAttempts;
  if (current >= limit) {
    throw new TinySearchError(
      `Rate limit exceeded: ${limit} ${kind} requests per minute. Wait before retrying.`,
      "rate_limit",
      429,
    );
  }
}

function trackAttempt(state: RateLimitState, kind: "search" | "fetch"): void {
  if (kind === "search") state.searchAttempts++;
  else state.fetchAttempts++;
}

export function createClient(options: TinySearchClientOptions) {
  const { apiKey, baseUrl = "https://api.monid.ai", timeoutMs = 30_000 } = options;
  const rateState: RateLimitState = { searchAttempts: 0, fetchAttempts: 0, windowStart: Date.now() };

  async function runSearch(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    assertRateLimit(rateState, "search");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}/v1/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ provider: "tinyfish", endpoint: "/search", input: { queryParams: input } }),
        signal: controller.signal,
      });
      trackAttempt(rateState, "search");
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new TinySearchError("Authentication failed. Check your Monid API key. Run /tiny-search login to reconfigure.", "auth", response.status);
        }
        if (response.status === 429) {
          throw new TinySearchError("Rate limit hit by upstream. Wait before retrying.", "rate_limit", 429);
        }
        const text = await response.text().catch(() => "");
        throw new TinySearchError(`Monid API error ${response.status}: ${text || response.statusText}`, "network", response.status);
      }
      const json: unknown = await response.json();
      return json as Record<string, unknown>;
    } catch (error) {
      if (error instanceof TinySearchError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new TinySearchError(`Request timed out after ${timeoutMs}ms.`, "timeout");
      }
      throw new TinySearchError(`Network error: ${error instanceof Error ? error.message : String(error)}`, "network");
    } finally {
      clearTimeout(timer);
    }
  }

  async function runFetch(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    assertRateLimit(rateState, "fetch");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}/v1/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ provider: "tinyfish", endpoint: "/fetch", input: { body: input } }),
        signal: controller.signal,
      });
      trackAttempt(rateState, "fetch");
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new TinySearchError("Authentication failed. Check your Monid API key. Run /tiny-search login to reconfigure.", "auth", response.status);
        }
        if (response.status === 429) {
          throw new TinySearchError("Rate limit hit by upstream. Wait before retrying.", "rate_limit", 429);
        }
        const text = await response.text().catch(() => "");
        throw new TinySearchError(`Monid API error ${response.status}: ${text || response.statusText}`, "network", response.status);
      }
      const json: unknown = await response.json();
      return json as Record<string, unknown>;
    } catch (error) {
      if (error instanceof TinySearchError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new TinySearchError(`Request timed out after ${timeoutMs}ms.`, "timeout");
      }
      throw new TinySearchError(`Network error: ${error instanceof Error ? error.message : String(error)}`, "network");
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async search(options: SearchOptions): Promise<SearchResponse> {
      const params: Record<string, unknown> = { query: options.query };
      if (options.domain_type) params.domain_type = options.domain_type;
      if (options.location) params.location = options.location;
      if (options.language) params.language = options.language;
      if (options.include_domains) params.include_domains = options.include_domains;
      if (options.exclude_domains) params.exclude_domains = options.exclude_domains;
      if (options.recency_minutes !== undefined) params.recency_minutes = options.recency_minutes;
      if (options.after_date) params.after_date = options.after_date;
      if (options.before_date) params.before_date = options.before_date;
      if (options.page !== undefined) params.page = options.page;
      if (options.purpose) params.purpose = options.purpose;

      const raw = await runSearch(params);
      const output = (raw.output ?? {}) as Record<string, unknown>;
      const results = (output.results ?? []) as Array<Record<string, unknown>>;
      return {
        results: results.map(r => ({
          position: (r.position as number) ?? 0,
          title: (r.title as string) ?? "",
          url: (r.url as string) ?? "",
          site_name: (r.site_name as string) ?? "",
          snippet: (r.snippet as string) ?? "",
        })),
        query: (output.query as string) ?? options.query,
        total_results: raw.total_results as number | undefined,
      };
    },

    async fetch(options: FetchOptions): Promise<FetchResponse> {
      const body: Record<string, unknown> = { urls: options.urls };
      if (options.format) body.format = options.format;
      if (options.include_selectors?.length) body.include_selectors = options.include_selectors;
      if (options.exclude_selectors?.length) body.exclude_selectors = options.exclude_selectors;
      if (options.ttl !== undefined) body.ttl = options.ttl;
      if (options.links !== undefined) body.links = options.links;
      if (options.image_links !== undefined) body.image_links = options.image_links;
      if (options.purpose) body.purpose = options.purpose;

      const raw = await runFetch(body);
      const output = (raw.output ?? {}) as Record<string, unknown>;
      const results = (output.results ?? []) as Array<Record<string, unknown>>;
      const errors = (output.errors ?? []) as Array<Record<string, unknown>>;
      return {
        results: results.map(r => {
          const result: FetchResult = {
            url: (r.url as string) ?? "",
            title: (r.title as string) ?? "",
            text: (r.text as string) ?? "",
          };
          if (Array.isArray(r.links)) result.links = r.links as string[];
          if (Array.isArray(r.image_links)) result.image_links = r.image_links as string[];
          if (typeof r.etag === "string") result.etag = r.etag;
          if (typeof r.last_modified === "string") result.last_modified = r.last_modified;
          if (typeof r.not_modified === "boolean") result.not_modified = r.not_modified;
          if (Array.isArray(r.candidate_selectors)) result.candidate_selectors = r.candidate_selectors as string[];
          return result;
        }),
        errors: errors.map(e => ({
          url: (e.url as string) ?? "",
          code: (e.code as string) ?? "",
          message: e.message as string | undefined,
        })),
      };
    },

    /** Expose rate limit state for testing. */
    getRateState(): Readonly<RateLimitState> {
      return { ...rateState };
    },
  };
}

export type TinySearchClient = ReturnType<typeof createClient>;
