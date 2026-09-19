import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createClient } from "./client.js";
import { clearStoredApiKey, credentialsPath, keySituation, keySourceLabel } from "./credentials.js";
import { loginWithPrompt } from "./login.js";

const actions = ["login", "logout", "status", "enable", "disable"];

export function registerCommand(
  pi: { registerCommand: (name: string, config: Record<string, unknown>) => void; sendMessage: (msg: Record<string, unknown>) => void },
  getState: () => { enabled: boolean; client: ReturnType<typeof createClient> | undefined },
  setState: (patch: { enabled?: boolean; client?: ReturnType<typeof createClient> | undefined }) => void,
): void {
  pi.registerCommand("tiny-search", {
    description: "TinyFish web search login, status, and session control",
    getArgumentCompletions(prefix: string) {
      const matches = actions.filter(action => action.startsWith(prefix)).map(action => ({ value: action, label: action }));
      return matches.length ? matches : null;
    },
    async handler(args: string, ctx: ExtensionCommandContext) {
      const action = args.trim() || "status";
      const report = (text: string, level: "info" | "warning" | "error" = "info") => {
        if (ctx.hasUI) ctx.ui.notify(text, level);
        else pi.sendMessage({ customType: "tiny-search-status", content: text, display: true });
      };
      try {
        if (action === "status") {
          const situation = keySituation();
          const state = getState();
          const keyDesc = keySourceLabel(situation);
          const status = state.enabled ? "enabled" : "disabled";
          const keyStatus = situation.kind === "missing" ? "not configured" : situation.kind === "unusable" ? `unusable: ${situation.reason}` : `configured via ${keyDesc}`;
          report(`tiny-search: ${status}. Key: ${keyStatus}.`);
          return;
        }
        if (action === "logout") {
          const removed = clearStoredApiKey();
          setState({ enabled: false, client: undefined });
          report(removed ? `Removed the stored key at ${credentialsPath()}. tiny-search is disabled.` : "No stored key to remove." + (process.env.TINYSEARCH_API_KEY?.trim() ? " TINYSEARCH_API_KEY is still set in the environment." : ""));
          return;
        }
        if (action === "disable") {
          setState({ enabled: false });
          report("tiny-search disabled for future agent calls.");
          return;
        }
        if (!actions.includes(action)) {
          report(`Usage: /tiny-search ${actions.join(" | ")}`, "warning");
          return;
        }
        if (!ctx.hasUI) {
          report("This command needs interactive Pi. For headless tool use, set TINYSEARCH_API_KEY before launching Pi.", "warning");
          return;
        }
        if (action === "login") {
          if (process.env.TINYSEARCH_API_KEY?.trim()) {
            report("TINYSEARCH_API_KEY is set in the environment and takes precedence. Unset it before using /tiny-search login.", "warning");
            return;
          }
          const login = await loginWithPrompt(ctx);
          if (login === undefined) { report("Login cancelled; nothing was saved."); return; }
          setState({ client: undefined });
          report(`Key verified and saved to ${login.path}. Run /tiny-search enable to allow agent tool calls.`);
          return;
        }
        if (action === "enable") {
          const situation = keySituation();
          if (situation.kind === "missing") { report("Run /tiny-search login first: no API key is configured.", "warning"); return; }
          if (situation.kind === "unusable") { report(`The stored key cannot be used. ${situation.reason}`, "warning"); return; }
          setState({ enabled: true, client: undefined });
          report("tiny-search enabled for this session.");
          return;
        }
        report(`Unknown action "${action}". Use: ${actions.join(", ")}.`, "warning");
      } catch (error) {
        report(error instanceof Error ? error.message : "tiny-search command failed.", "error");
      }
    },
  });
}
