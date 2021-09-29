#!/usr/bin/env bash

set -e

cd "$(dirname "$0")/.."
./scripts/generate_package_version.py > version.txt
ARTIFACTS_DIR="../src/etherbase_predeployed/artifacts/"
cp -v "../../artifacts/contracts/Etherbase.sol/Etherbase.json" "$ARTIFACTS_DIR"
python3 -m build
