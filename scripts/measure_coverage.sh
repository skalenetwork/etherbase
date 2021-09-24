#!/bin/bash

# cSpell:words solcover solcoverjs

set -e

NODE_OPTIONS="--max_old_space_size=4096" npx hardhat coverage
