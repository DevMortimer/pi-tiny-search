import type { AgentToolResult, ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { createClient, TinySearchError } from "./client.js";
import type { TinySearchClient } from "./client.js";
import { keySituation } from "./credentials.js";
import { registerCommand } from "./command.js";
import { executeFetch, fetchParameters, normalizeFetchArgs } from "./fetch.js";
import { executeSearch, formatSearchResults, searchParameters, normalizeSearchArgs } from "./search.js";

const PACKAGE_NAME = "pi-tiny-search";

/** Native Pi registration; importing the root library does not load this module. */
export default function tinySearchExtension(pi: ExtensionAPI): void {
  let enabled = false;
  let client: TinySearchClient | undefined;

  const getClient = (): TinySearchClient | undefined => {
    if (client) return client;
    const situation = keySituation();
    if (situation.kind === "environment" || situation.kind === "stored") {
      client = createClient({ apiKey: situation.key });
      return client;
    }
    return undefined;
  };

  pi.on("session_start", async (_event, ctx) => {
    enabled = false;
    client = undefined;
    const situation = keySituation();
    if (situation.kind === "missing") {
      const msg = "tiny-search: no API key configured. Run /tiny-search login or set TINYSEARCH_API_KEY.";
      if (ctx.hasUI) ctx.ui.notify(msg, "warning");
      else pi.sendMessage({ customType: `${PACKAGE_NAME}-status`, content: msg, display: true });
    } else if (situation.kind === "unusable") {
      const msg = `tiny-search: key unusable — ${situation.reason}`;
      if (ctx.hasUI) ctx.ui.notify(msg, "warning");
      else pi.sendMessage({ customType: `${PACKAGE_NAME}-status`, content: msg, display: true });
    }
  });

  registerCommand(
    pi as unknown as { registerCommand: (name: string, config: Record<string, unknown>) => void; sendMessage: (msg: Record<string, unknown>) => void },
    () => ({ enabled, client }),
    (patch) => {
      if (patch.enabled !== undefined) enabled = patch.enabled;
      if (patch.client !== undefined) client = patch.client;
    },
  );

  pi.registerTool({
    name: "tiny_search",
    label: "Web Search",
    description: "Search the web via TinyFish. Returns structured results (title, url, snippet, site_name). No browser, no LLM summarization — instant API call. Set domain_type to web (default), news, or research_paper. Filters: location, language, include/exclude_domains, recency_minutes, after_date/before_date. Page 0-10. Pass purpose to sharpen ranking.",
    promptSnippet: "Use for web research questions. Prefer {queries:[...]} with 2-4 varied angles over a single query for broader coverage.",
    parameters: searchParameters,
    prepareArguments: args => normalizeSearchArgs(args as Record<string, unknown>),
    async execute(_id, params, signal, _onUpdate, ctx): Promise<AgentToolResult<import("./client.js").SearchResponse>> {
      const currentClient = getClient();
      if (!currentClient) {
        const situation = keySituation();
        if (situation.kind === "missing") throw new Error("tiny-search: no API key configured. Run /tiny-search login or set TINYSEARCH_API_KEY.");
        if (situation.kind === "unusable") throw new Error(`tiny-search: ${situation.reason}`);
        throw new Error("tiny-search: could not create client. Check your configuration.");
      }
      try {
        const result = await executeSearch(currentClient, params as Record<string, unknown>);
        return result;
      } catch (error) {
        if (error instanceof TinySearchError && error.code === "auth") {
          if (ctx.hasUI) ctx.ui.notify("tiny-search: authentication failed. Run /tiny-search login to reconfigure.", "error");
        }
        throw error;
      }
    },
    renderCall(args) {
      const query = typeof args === "object" && args !== null ? String((args as Record<string, unknown>).query ?? "") : "";
      return new Text(`Web Search · "${query}"`, 0, 0);
    },
    renderResult(result, { isPartial }) {
      if (isPartial) return new Text("Web Search · waiting for response", 0, 0);
      return new Text(result.content.filter(part => part.type === "text").map(part => part.text).join("\n"), 0, 0);
    },
  });

  pi.registerTool({
    name: "tiny_fetch",
    label: "Web Fetch",
    description: "Fetch a URL via TinyFish and return clean extracted text. Renders JavaScript-heavy pages in a real browser. Use CSS selectors to extract specific content. Free endpoint.",
    promptSnippet: "Use to fetch readable or raw URL content after a web_search result gives you URLs.",
    parameters: fetchParameters,
    prepareArguments: args => normalizeFetchArgs(args as Record<string, unknown>),
    async execute(_id, params, signal, _onUpdate, ctx): Promise<AgentToolResult<import("./client.js").FetchResponse>> {
      const currentClient = getClient();
      if (!currentClient) {
        const situation = keySituation();
        if (situation.kind === "missing") throw new Error("tiny-search: no API key configured. Run /tiny-search login or set TINYSEARCH_API_KEY.");
        if (situation.kind === "unusable") throw new Error(`tiny-search: ${situation.reason}`);
        throw new Error("tiny-search: could not create client. Check your configuration.");
      }
      try {
        const result = await executeFetch(currentClient, params as Record<string, unknown>);
        return result;
      } catch (error) {
        if (error instanceof TinySearchError && error.code === "auth") {
          if (ctx.hasUI) ctx.ui.notify("tiny-search: authentication failed. Run /tiny-search login to reconfigure.", "error");
        }
        throw error;
      }
    },
    renderCall(args) {
      const url = typeof args === "object" && args !== null ? String((args as Record<string, unknown>).url ?? "") : "";
      return new Text(`Web Fetch · ${url}`, 0, 0);
    },
    renderResult(result, { isPartial }) {
      if (isPartial) return new Text("Web Fetch · waiting for response", 0, 0);
      return new Text(result.content.filter(part => part.type === "text").map(part => part.text).join("\n"), 0, 0);
    },
  });
}
