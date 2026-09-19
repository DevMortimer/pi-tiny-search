import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createClient } from "./client.js";
import { keySituation, normalizeApiKey, storeApiKey } from "./credentials.js";
import type { KeySource } from "./credentials.js";

export interface LoginResult {
  /** Where the verified key was saved. */
  path: string;
  /** Proves the key was accepted by the API. */
  verified: boolean;
}

/**
 * Prompt for a key (hidden input), verify it with a test search, and store it for every pi-tiny-search consumer.
 * Resolves to undefined when the user cancels. Rejects for an invalid or unverifiable key.
 * Refuses when TINYSEARCH_API_KEY is set, because the environment would shadow the stored key.
 */
export async function loginWithPrompt(ctx: ExtensionCommandContext): Promise<LoginResult | undefined> {
  if (process.env.TINYSEARCH_API_KEY?.trim()) {
    throw new Error("TINYSEARCH_API_KEY is set in the environment and takes precedence over a stored key. Unset it before logging in interactively.");
  }
  if (!ctx.hasUI) {
    throw new Error("Logging in needs an interactive session. Set TINYSEARCH_API_KEY in the environment instead.");
  }
  const entered = await ctx.ui.input("Monid API key", "Paste the key from monid.ai, then press Enter");
  if (entered === undefined || !entered.trim()) return undefined;
  const key = normalizeApiKey(entered);
  // Verify before saving so a bad paste fails here, not on first use.
  const client = createClient({ apiKey: key });
  const testResult = await client.search({ query: "test", page: 0 });
  return { path: storeApiKey(key), verified: testResult.results !== undefined };
}

export type EnsureApiKeyResult =
  | { source: KeySource; login?: undefined }
  | { source: "stored"; login: LoginResult };

/**
 * Use the configured key if there is one; otherwise run the login prompt. `undefined` means the user cancelled.
 * A store that must not be read throws with the reason instead of prompting, so a permissions
 * problem stays visible; the result shape is frozen for existing callers.
 */
export async function ensureApiKey(ctx: ExtensionCommandContext): Promise<EnsureApiKeyResult | undefined> {
  const situation = keySituation();
  if (situation.kind === "environment" || situation.kind === "stored") return { source: situation.kind };
  if (situation.kind === "unusable") throw new Error(situation.reason);
  const login = await loginWithPrompt(ctx);
  return login ? { source: "stored", login } : undefined;
}
