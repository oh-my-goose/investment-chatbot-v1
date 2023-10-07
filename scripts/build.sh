#! /usr/bin/env bash

set -uo pipefail
[ ! -z ${DEBUG:-} ] && set -x

use=${USE:-'nx'}

if [ "_$use" = "_nx" ]; then
  set -x
  nx run-many --targets build --parallel --output-style=stream --projects=$(npm run list-projects:csv | grep -v '>' | awk NF)
elif [ "_$use" = "_npm" ]; then
  set -x
  npm run build --workspaces --if-present
elif [ "_$use" = "_pnpm" ]; then
  set -x
  pnpm run -r build
else
  echo "Unsupported USE value: ${use} (choose: nx, npm, pnpm)"
  exit 1
fi
