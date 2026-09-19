export const PACKAGE_NAME = "pi-tiny-search";

export interface TinySearchConfig {
  /** Whether the extension is enabled. Default: false. */
  enabled: boolean;
  /** Default domain_type for searches. Default: "web". */
  defaultDomainType: "web" | "news" | "research_paper";
  /** Default number of results to request. Default: 5. */
  defaultResults: number;
  /** Request timeout in milliseconds. Default: 30000. */
  timeoutMs: number;
  /** Base URL for the Monid API. Default: "https://api.monid.ai". */
  baseUrl: string;
}

export function defaultConfig(): TinySearchConfig {
  return {
    enabled: false,
    defaultDomainType: "web",
    defaultResults: 5,
    timeoutMs: 30_000,
    baseUrl: "https://api.monid.ai",
  };
}

export function loadConfig(overrides?: Partial<TinySearchConfig>): TinySearchConfig {
  return { ...defaultConfig(), ...overrides };
}
