#!/bin/bash
# Performance eval loop — runs until time limit or manual stop
# Usage: bash eval/run-perf.sh [max_minutes]

cd "$(dirname "$0")/.."

MAX_MINUTES=${1:-29}
END_TIME=$(($(date +%s) + MAX_MINUTES * 60))
RUN=0
RESULTS_DIR="eval/reports"
mkdir -p "$RESULTS_DIR"

# Export the API key
if [ -z "${TINYSEARCH_API_KEY:-}" ] && [ -f .env ]; then
  MONID=$(grep '^MONID_API_KEY=' .env | head -1 | cut -d= -f2-)
  if [ -n "$MONID" ]; then
    export TINYSEARCH_API_KEY="$MONID"
  fi
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  pi-tiny-search performance eval                           ║"
echo "║  Max: ${MAX_MINUTES} minutes | End by: $(date -r "$END_TIME" "+%H:%M:%S")                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

ACCUM="$RESULTS_DIR/accumulated.json"
if [ ! -f "$ACCUM" ]; then
  echo "[]" > "$ACCUM"
fi

while [ "$(date +%s)" -lt "$END_TIME" ]; do
    REMAINING=$(( (END_TIME - $(date +%s)) / 60 ))
    echo "━━━ Run $RUN ($(date "+%H:%M:%S")) | ~${REMAINING}m remaining ━━━"

    # Run perf eval
    OUTPUT=$(TINYSEARCH_API_KEY="$TINYSEARCH_API_KEY" PERF_RUN_INDEX="$RUN" node eval/perf.mjs 2>&1) && {
      # Save raw JSON output for this run
      echo "$OUTPUT" | sed -n '/^{/p' | tail -1 > "$RESULTS_DIR/run-$RUN.json"
      echo "  ✓ Run $RUN complete"
    } || {
      echo "  ⚠ Run $RUN failed, retrying in 10s..."
      sleep 10
    }

    RUN=$((RUN + 1))

    # Brief pause between runs
    sleep 3
done

echo ""
echo "━━━ Eval complete: $RUN runs ━━━"
echo "Reports in $RESULTS_DIR/"
