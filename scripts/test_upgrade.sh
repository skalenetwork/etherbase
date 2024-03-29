#!/usr/bin/env bash

set -e

if [ -z $GITHUB_WORKSPACE ]
then
    GITHUB_WORKSPACE="$(dirname "$(dirname "$(realpath "$0")")")"
fi

if [ -z $GITHUB_REPOSITORY ]
then
    GITHUB_REPOSITORY="skalenetwork/etherbase"
fi

export NVM_DIR=~/.nvm;
source $NVM_DIR/nvm.sh;

DEPLOYED_TAG=$(cat $GITHUB_WORKSPACE/DEPLOYED)
DEPLOYED_VERSION=$(echo $DEPLOYED_TAG | cut -d '-' -f 1)
DEPLOYED_DIR=$GITHUB_WORKSPACE/deployed-etherbase/

DEPLOYED_WITH_NODE_VERSION="lts/gallium"
CURRENT_NODE_VERSION=$(nvm current)

git clone --branch $DEPLOYED_TAG https://github.com/$GITHUB_REPOSITORY.git $DEPLOYED_DIR

npx ganache -q &

cd $DEPLOYED_DIR
nvm install $DEPLOYED_WITH_NODE_VERSION
nvm use $DEPLOYED_WITH_NODE_VERSION
yarn install

VERSION=$DEPLOYED_VERSION \
MODE=UPGRADEABLE \
npx hardhat run migrations/deploy.ts --network localhost

rm $GITHUB_WORKSPACE/.openzeppelin/unknown-*.json || true
cp .openzeppelin/unknown-*.json $GITHUB_WORKSPACE/.openzeppelin
ABI_FILENAME="etherbase-$DEPLOYED_VERSION-localhost-abi-and-addresses.json"
cp "data/$ABI_FILENAME" "$GITHUB_WORKSPACE/data"

cd $GITHUB_WORKSPACE
rm -r --interactive=never $DEPLOYED_DIR

ALLOW_NOT_ATOMIC_UPGRADE="OK" \
SKALE_CHAIN_NAME="Bob" \
ABI="data/$ABI_FILENAME" \
npx hardhat run migrations/upgrade.ts --network localhost

npx kill-port 8545
