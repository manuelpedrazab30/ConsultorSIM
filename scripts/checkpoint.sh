#!/bin/sh
# Usage: scripts/checkpoint.sh "what changed"
set -e
git add -A
git commit -m "Checkpoint: $1"
git push
