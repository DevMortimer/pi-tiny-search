# pi-tiny-search

Instant web search and page fetching for Pi. No browser, no LLM summarization — just fast structured results via [Monid/TinyFish](https://monid.ai/tools/web-search).

## What it does

Two tools, one command:

| Tool | What it does |
| --- | --- |
| `tiny_search` | Search the web. Returns title, url, snippet, site_name per result. |
| `tiny_fetch` | Fetch a URL. Returns clean extracted text from the page. |

Both are pure API calls — no browser rendering, no LLM summarization step. Results come back instantly.

## Setup

```bash
npm install pi-tiny-search
```

Then run `/tiny-search login` in Pi to configure your Monid API key. Or set `TINYSEARCH_API_KEY` in your environment.

## Usage

The agent can call the tools directly:

```
tiny_search(query: "TypeScript 5.8 release notes")
tiny_fetch(url: "https://devblogs.microsoft.com/typescript/")
```

Or use the command for setup:

```
/tiny-search login     # Store your Monid API key
/tiny-search status    # Check auth and config state
/tiny-search enable    # Enable for this session
/tiny-search disable   # Disable for this session
/tiny-search logout    # Remove stored key
```

## Configuration

See [docs/configuration.md](docs/configuration.md) for the full reference.

## License

MIT
