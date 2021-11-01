#!/usr/bin/env bash

set -e

npx ganache-cli --gasLimit 8000000 --quiet &
GANACHE_PID=$!

MODE=FIXED npx hardhat run migrations/deploy.ts
MODE=UPGRADEABLE npx hardhat run migrations/deploy.ts

kill $GANACHE_PID
tail --pid=$GANACHE_PID -f /dev/null
