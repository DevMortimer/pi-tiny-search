import type { AgentToolResult } from "@earendil-works/pi-coding-agent";
import type { TinySearchClient, SearchOptions, SearchResponse } from "./client.js";

export const searchParameters = {
  type: "object",
  properties: {
    query: { type: "string", description: "The search query. Supports site: and -site: operators." },
    domain_type: { type: "string", enum: ["web", "news", "research_paper"], description: "Type of domain to search. Default: web." },
    location: { type: "string", description: "Filter by geo location." },
    language: { type: "string", description: "Filter by language code." },
    include_domains: { type: "string", description: "Comma-separated domains to include. Example: github.com,arxiv.org." },
    exclude_domains: { type: "string", description: "Comma-separated domains to exclude. Example: pinterest.com,quora.com." },
    recency_minutes: { type: "number", description: "Results from the last N minutes." },
    after_date: { type: "string", description: "Results after this date (ISO format)." },
    before_date: { type: "string", description: "Results before this date (ISO format)." },
    page: { type: "number", description: "Page number (0-10)." },
    purpose: { type: "string", description: "A short statement of the task the results are for. Sharpens ranking." },
  },
  required: ["query"],
} as const;

export function normalizeSearchArgs(args: Record<string, unknown>): SearchOptions {
  return {
    query: String(args.query ?? ""),
    ...(typeof args.domain_type === "string" && { domain_type: args.domain_type as SearchOptions["domain_type"] }),
    ...(typeof args.location === "string" && { location: args.location }),
    ...(typeof args.language === "string" && { language: args.language }),
    ...(typeof args.include_domains === "string" && { include_domains: args.include_domains }),
    ...(typeof args.exclude_domains === "string" && { exclude_domains: args.exclude_domains }),
    ...(typeof args.recency_minutes === "number" && { recency_minutes: args.recency_minutes }),
    ...(typeof args.after_date === "string" && { after_date: args.after_date }),
    ...(typeof args.before_date === "string" && { before_date: args.before_date }),
    ...(typeof args.page === "number" && { page: args.page }),
    ...(typeof args.purpose === "string" && { purpose: args.purpose }),
  };
}

export function formatSearchResults(response: SearchResponse): string {
  if (response.results.length === 0) {
    return `No results found for "${response.query}".`;
  }
  const lines = [`<web search results query="${response.query}">`];
  for (const result of response.results) {
    lines.push(`[${result.position}] ${result.title}`);
    lines.push(`    ${result.url}`);
    lines.push(`    ${result.site_name}`);
    lines.push(`    ${result.snippet}`);
    lines.push("");
  }
  lines.push("</web search results>");
  return lines.join("\n");
}

export async function executeSearch(
  client: TinySearchClient,
  args: Record<string, unknown>,
): Promise<AgentToolResult<SearchResponse>> {
  const options = normalizeSearchArgs(args);
  if (!options.query) {
    throw new Error("Search requires a query parameter.");
  }
  const result = await client.search(options);
  return {
    content: [{ type: "text", text: formatSearchResults(result) }],
    details: result,
  };
}
