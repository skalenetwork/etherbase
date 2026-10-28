# Etherbase

<div align="center">

[![License](https://img.shields.io/github/license/skalenetwork/etherbase.svg)](LICENSE)
[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/skale)
[![Build Status](https://github.com/skalenetwork/etherbase/actions/workflows/test.yml/badge.svg)](https://github.com/skalenetwork/etherbase/actions)
[![codecov](https://codecov.io/gh/skalenetwork/etherbase/branch/develop/graph/badge.svg)](https://codecov.io/gh/skalenetwork/etherbase)

<p>A smart contract to control the distribution of sFUEL (gas) in SKALE chains</p>

</div>

## Introduction

Etherbase is a smart contract that serves as the central repository for sFUEL (gas tokens) on SKALE chains. It collects sFUEL from block rewards and transaction fees, providing controlled access to these funds through role-based permissions.

The contract implements the ETHER_MANAGER_ROLE to regulate who can withdraw funds, ensuring that only authorized addresses can retrieve sFUEL. Chain owners are granted both admin and ether manager roles upon deployment, giving them full control over fund distribution.

**Main capabilities**
- **Receive sFUEL**: Accepts sFUEL from mining rewards and gas fees through the receive function
- **Retrieve funds**: Allows authorized managers to withdraw the entire balance or send specific amounts to arbitrary accounts
- **Access control**: Uses OpenZeppelin's AccessControlEnumerable for secure role management
- **Event tracking**: Emits events for all sFUEL receipts and withdrawals for transparency


**NOTE:** To use `Etherbase` contract predeployed in your custom chain genesis block use [etherbase-predeployed](predeployed/README.md) library. It's available for python and is distributed as a [pip package](https://pypi.org/project/etherbase-predeployed).

## Installation & Setup

### Prerequisites

Before working with this repository, ensure you have the following installed:

- **Node.js**: Version 18.x, 20.x, or 22.x
- **Yarn**: Package manager (for Node.js dependencies)
- **Python**: Version 3.8 or higher
- **pip**: Python package manager

Optional tools for development:
- **Geth**: Ethereum client v1.13.X (required for some predeployed package tests)
- **Slither**: Solidity static analyzer (installed via pip)

### Clone and Install

1. Clone the repository:
```bash
git clone https://github.com/skalenetwork/etherbase.git
cd etherbase
```

2. Install Node.js dependencies:
```bash
yarn install
```

3. Install Python dependencies for Slither (static analysis):

If you already have a more recent version of slither installed, you may try to skip this step
```bash
pip3 install -r scripts/requirements.txt
```

4. Install Python dependencies for predeployed package development (optional):
```bash
pip3 install -r predeployed/scripts/requirements.txt
pip3 install -r predeployed/test/requirements.txt
```

5. Compile the contracts:
```bash
yarn compile
```

6. Install geth (method used in CI)
```bash
wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.13.15-c5ba367e.tar.gz
tar -xvf geth-linux-amd64-1.13.15-c5ba367e.tar.gz
sudo mv geth-linux-amd64-1.13.15-c5ba367e/geth /usr/local/bin/geth
```

7. Verify geth

```bash
geth version # should output content with Version: 1.13.15-stable
which geth # should output /usr/local/bin/geth
```

## Running Tests

### Solidity Contract Tests

Run the main test suite for Etherbase smart contracts:
```bash
yarn test
```

Run tests with coverage report:
```bash
npx hardhat coverage
```

### Linting and Static Analysis

Run all quality checks (linting, spell check, static analysis, type checking):
```bash
yarn fullCheck
```

Individual checks:
```bash
yarn lint        # Solidity linting with solhint
yarn cspell      # Spell checking
yarn slither     # Static analysis with Slither
yarn tsc         # TypeScript type checking
yarn eslint      # JavaScript/TypeScript linting
```

### Deployment Tests

Test the deployment script:
```bash
./scripts/test_deploy.sh
```

### Python Predeployed Package Tests

Set up Python environment and run predeployed package tests:

1. Ensure Python dependencies are installed:
```bash
pip3 install -r predeployed/scripts/requirements.txt
pip3 install -r predeployed/test/requirements.txt
```

2. Run type checking:
```bash
mypy predeployed/src
```

3. Run Python linting:
```bash
pylint predeployed/src/etherbase_predeployed/
```

4. Run pytest (with coverage):
```bash
PYTHONPATH=predeployed/src pytest --cov=etherbase_predeployed
# --cov is optional
```

5. (Optional) Build the package to verify it builds correctly:
```bash
VERSION="0.0.0" predeployed/scripts/build_package.sh
```

## Security and Audits

External audits of Etherbase will appear here. See other audits of SKALE components in https://docs.skale.space/audits-and-security/

### Bug Bounty Programs

Please see [HackerOne](https://hackerone.com/skale_network?type=team) for SKALE's active bug bounty program **or** submit a bug directly via [encrypted email](mailto:security@skalelabs.com).


## Deployments

Etherbase has a predefined address in all SKALE chains: **0xd2bA3e0000000000000000000000000000000000**

Examples:
 * EUROPA: https://elated-tan-skat.explorer.mainnet.skalenodes.com/address/0xd2bA3e0000000000000000000000000000000000

## Resources

- **SKALE Developer Documentation** – https://docs.skale.space/
- **SKALE Whitepaper** – Whitepaper of SKALE Network: https://skale.space/whitepaper
- **SKALE Main Website** – High-level overview of the network, architecture, and ecosystem: https://www.skale.space/
- **SKALE Ecosystem Portal** – Explorer, bridges, staking dashboard, live chains & projects: https://portal.skale.space/

## License

[![License](https://img.shields.io/github/license/skalenetwork/etherbase.svg)](LICENSE)

All contributions are made under the [GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.en.html). See [LICENSE](LICENSE).

Copyright (C) 2021-Present SKALE Labs
