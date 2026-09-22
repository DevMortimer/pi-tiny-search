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
    description: "Structured results with title, url, snippet, and site_name from a fast web search API. Use when: you encounter an API, library, or CLI you do not know or that is newer than your training data; you need a version number, changelog entry, or release date; the repository contains an error message or stack trace you cannot explain; the user asks a factual question the repository cannot answer. Not for code in this repository — read the files instead. Input: a query string, optionally with filters for domain type, language, date range, and result count. Examples: 'what is the latest version of zod', 'why does my Next.js build fail with MODULE_NOT_FOUND', 'is there a stable Bun test runner yet'.",
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
    description: "Clean extracted text from a web page, rendered with a real browser so JavaScript-heavy sites work. Use when: a search result or the user provides a URL you need to read; documentation lives on a website rather than in the repository; the content must be quoted exactly rather than recalled from memory. Not for code in this repository — read the files instead. Input: one or more URLs, with optional CSS selectors to extract specific sections. Examples: 'fetch the React 19 migration guide at this URL', 'read the README from github.com/vercel/next.js', 'grab the changelog section from that release page'.",
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
