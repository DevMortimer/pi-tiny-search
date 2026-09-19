# Configuration

pi-tiny-search stores its configuration in `~/.pi/agent/pi-tiny-search/`.

## API Key

The API key is stored at `~/.pi/agent/pi-tiny-search/auth.json` with owner-only permissions (mode 0600).

**Precedence:**
1. `TINYSEARCH_API_KEY` environment variable (highest)
2. Stored key from `/tiny-search login`

**Commands:**
- `/tiny-search login` — prompt for key, verify with test search, store
- `/tiny-search logout` — remove stored key

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `TINYSEARCH_API_KEY` | Monid API key. Takes precedence over stored key. | — |
| `PI_CODING_AGENT_DIR` | Pi agent directory. Overrides `~/.pi/agent`. | `~/.pi/agent` |

## Tool Defaults

The `tiny_search` tool accepts these parameters with defaults:

| Parameter | Default | Description |
| --- | --- | --- |
| `domain_type` | `"web"` | `web`, `news`, or `research_paper` |
| `page` | `0` | Page number (0-10) |
| `purpose` | — | Task statement to sharpen ranking |

All filter parameters (`location`, `language`, `include_domains`, `exclude_domains`, `recency_minutes`, `after_date`, `before_date`) are optional and omit results when not set.

## Rate Limits

TinyFish enforces:
- **Search:** 30 requests per minute
- **Fetch:** 150 requests per minute

The client tracks rate limits locally and throws before exceeding them.
