import type { AgentToolResult } from "@earendil-works/pi-coding-agent";
import type { TinySearchClient, FetchOptions, FetchResponse } from "./client.js";

export const fetchParameters = {
  type: "object",
  properties: {
    urls: { type: "array", items: { type: "string" }, description: "One or more URLs to fetch (max 10)." },
    format: { type: "string", enum: ["markdown", "html", "json"], description: "Output format. Default: markdown." },
    include_selectors: { type: "array", items: { type: "string" }, description: "CSS selectors to include (1-20). Scoped extraction." },
    exclude_selectors: { type: "array", items: { type: "string" }, description: "CSS selectors to exclude before extraction (1-20)." },
    ttl: { type: "number", description: "Cache freshness in seconds. 0 = force live fetch." },
    purpose: { type: "string", description: "Short statement of the task these results are for." },
  },
  required: ["urls"],
} as const;

export function normalizeFetchArgs(args: Record<string, unknown>): FetchOptions {
  const urls = Array.isArray(args.urls) ? args.urls.map(String) : typeof args.url === "string" ? [args.url] : [];
  return {
    urls,
    ...(typeof args.format === "string" && { format: args.format as FetchOptions["format"] }),
    ...(Array.isArray(args.include_selectors) && { include_selectors: args.include_selectors.map(String) }),
    ...(Array.isArray(args.exclude_selectors) && { exclude_selectors: args.exclude_selectors.map(String) }),
    ...(typeof args.ttl === "number" && { ttl: args.ttl }),
    ...(typeof args.purpose === "string" && { purpose: args.purpose }),
  };
}

export function formatFetchResult(response: FetchResponse): string {
  const lines: string[] = [];
  for (const result of response.results) {
    if (result.not_modified) {
      lines.push(`<web page url="${result.url}" status="not_modified" />`);
    } else {
      lines.push(`<web page url="${result.url}" title="${result.title}">`);
      lines.push(result.text);
      lines.push("</web page>");
    }
    lines.push("");
  }
  if (response.errors?.length) {
    for (const error of response.errors) {
      lines.push(`<web page url="${error.url}" error="${error.code}">${error.message ?? ""}</web page>`);
    }
  }
  return lines.join("\n");
}

export async function executeFetch(
  client: TinySearchClient,
  args: Record<string, unknown>,
): Promise<AgentToolResult<FetchResponse>> {
  const options = normalizeFetchArgs(args);
  if (!options.urls.length) {
    throw new Error("Fetch requires a urls parameter (array of URLs).");
  }
  const result = await client.fetch(options);
  return {
    content: [{ type: "text", text: formatFetchResult(result) }],
    details: result,
  };
}
