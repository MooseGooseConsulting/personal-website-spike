#!/usr/bin/env bash
# Headless digest runner. Push stays OFF unless PUSH=1.
# Usage: scripts/digest/run.sh [daily|weekly] [--dry-run]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

CADENCE="${1:-weekly}"
if [[ "$CADENCE" != "daily" && "$CADENCE" != "weekly" ]]; then
  echo "usage: scripts/digest/run.sh [daily|weekly] [--dry-run]" >&2
  exit 2
fi
shift || true

DRY=0
for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY=1
done

COMMIT="${COMMIT:-1}"
PUSH="${PUSH:-0}"
INGEST="${INGEST:-1}"

PROMPT="$ROOT/scripts/digest/prompts/${CADENCE}.md"
if [[ ! -f "$PROMPT" ]]; then
  echo "missing prompt: $PROMPT" >&2
  exit 1
fi

mkdir -p "$ROOT/var/digest"
STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
COMBINED="$ROOT/var/digest/${CADENCE}-${STAMP}.prompt.md"

{
  cat "$PROMPT"
  echo
  echo "## Operator envelope"
  echo
  echo "- cadence: ${CADENCE}"
  echo "- commit: ${COMMIT} (0 skips git commit)"
  echo "- push: ${PUSH} (must stay 0 unless you explicitly want deploy)"
  echo "- repeat-guard: reject item URLs already in content/digest/"
  echo "- transcript: required; tts-render writes a silent wav"
} > "$COMBINED"

if [[ "$INGEST" == "1" ]]; then
  echo "ingest: radar feeds -> var/ingest.sqlite" >&2
  npm run radar -w @notebook/ingest -- --limit 20 || echo "radar ingest failed (continuing)" >&2
fi

echo "prompt: $COMBINED" >&2

if [[ "$DRY" == "1" ]]; then
  echo "dry-run: not invoking an agent, not committing" >&2
  exit 0
fi

run_agent() {
  if command -v claude >/dev/null 2>&1; then
    echo "agent: claude -p" >&2
    claude -p "$(cat "$COMBINED")"
    return 0
  fi
  if command -v agent >/dev/null 2>&1; then
    echo "agent: agent -p" >&2
    agent -p "$(cat "$COMBINED")"
    return 0
  fi
  echo "No headless agent CLI found (claude / agent). Prompt written to:" >&2
  echo "  $COMBINED" >&2
  echo "Open it in Cursor and run the MCP tools listed there." >&2
  return 0
}

run_agent

if [[ "$COMMIT" == "1" ]]; then
  if [[ ! -d "$ROOT/.git" ]]; then
    echo "commit skipped: not a git checkout" >&2
  else
    git add content/digest content/links var/digest/proposed 2>/dev/null || true
    if git diff --cached --quiet; then
      echo "commit skipped: no staged digest/radar changes" >&2
    else
      git commit -m "$(cat <<EOF
Publish ${CADENCE} digest from headless runner.

EOF
)"
    fi
  fi
fi

if [[ "$PUSH" == "1" ]]; then
  echo "PUSH=1: git push" >&2
  git push
else
  echo "push off (set PUSH=1 to deploy)" >&2
fi
