import { ethers } from "hardhat";
import chalk from "chalk";
import hre from "hardhat";
import { SkaleABIFile, getContractKeyInAbiFile, encodeTransaction, upgrade } from "@skalenetwork/upgrade-tools";
import { getManifestAdmin } from "@openzeppelin/hardhat-upgrades/dist/admin";
import { ProxyAdmin } from "@skalenetwork/upgrade-tools/dist/typechain-types";


async function getEtherbaseUpgradeable(abi: SkaleABIFile) {
    return ((await ethers.getContractFactory("EtherbaseUpgradeable")).attach(
        abi[getContractKeyInAbiFile("Etherbase") + "_address"] as string
    ));
}

export async function getDeployedVersion(abi: SkaleABIFile) {
    const etherbase = await getEtherbaseUpgradeable(abi);
    try {
        return await etherbase.version();
    } catch {
        console.log(chalk.red("Can't read deployed version"));
    }
}

export async function setNewVersion(safeTransactions: string[], abi: SkaleABIFile, newVersion: string) {
    const etherbase = await getEtherbaseUpgradeable(abi);
    safeTransactions.push(encodeTransaction(
        0,
        etherbase.address,
        0,
        etherbase.interface.encodeFunctionData("setVersion", [newVersion]),
    ));
}

async function main() {
    await upgrade(
        "etherbase",
        "1.0.0",
        getDeployedVersion,
        setNewVersion,
        ["Etherbase"],
        ["EtherbaseUpgradeable"],
        // async (safeTransactions, abi, contractManager) => {
        async () => {
            // deploy new contracts
        },
        // async (safeTransactions, abi, contractManager) => {
        async (safeTransactions, abi, _, safeMockAddress) => {
            const schainName = process.env.SKALE_CHAIN_NAME;
            const messageProxyForMainnetAddress = process.env.MESSAGE_PROXY_FOR_MAINNET_ADDRESS;
            const marionetteMockAddress = process.env.MARIONETTE_MOCK_ADDRESS;
            if (!schainName) {
                console.log(chalk.red("Set SKALE chain name to environment"));
                process.exit(1);
            }
            if (!messageProxyForMainnetAddress) {
                console.log(chalk.red("Set address of MessageProxyForMainnet to environment"));
                process.exit(1);
            }

            const schainHash = ethers.utils.solidityKeccak256(["string"], [schainName]);
            const proxyAdmin = await getManifestAdmin(hre) as ProxyAdmin;
            const imaMockFactory = await ethers.getContractFactory("ImaMock");
            const imaMock = await imaMockFactory.deploy();
            await imaMock.deployTransaction.wait();
            const marionetteAddress = marionetteMockAddress !== undefined ? marionetteMockAddress : "0xD2c0DeFACe000000000000000000000000000000";
            const marionette = (await ethers.getContractFactory("MarionetteMock")).attach(marionetteAddress);

            const _safeTransactions: string[] = [];
            const startAddress = 4;
            const endAddress = 44;
            const startData = 172;
            for (const safeTransaction of safeTransactions) {
                _safeTransactions.push(encodeTransaction(
                    0,
                    messageProxyForMainnetAddress,
                    0,
                    imaMockFactory.interface.encodeFunctionData(
                        "postOutgoingMessage",
                        [
                            schainHash,
                            marionette.address,
                            ethers.utils.defaultAbiCoder.encode(["address", "uint", "bytes"], [
                                "0x" + safeTransaction.slice(startAddress, endAddress),
                                0,
                                "0x" + safeTransaction.slice(startData)
                            ])
                        ]
                    )
                ));
            }

            if (safeMockAddress !== undefined) {
                _safeTransactions.push(encodeTransaction(
                    0,
                    messageProxyForMainnetAddress,
                    0,
                    imaMockFactory.interface.encodeFunctionData(
                        "postOutgoingMessage",
                        [
                            schainHash,
                            marionette.address,
                            ethers.utils.defaultAbiCoder.encode(["address", "uint", "bytes"], [
                                proxyAdmin.address,
                                0,
                                proxyAdmin.interface.encodeFunctionData("transferOwnership", [safeMockAddress])
                            ])
                        ]
                    )
                ));
            } 
            safeTransactions.length = 0;
            Object.assign(safeTransactions, _safeTransactions);
        },
        async (safeMock, abi) => {
            const proxyAdmin = await getManifestAdmin(hre) as ProxyAdmin;
            const marionetteMockAddress = process.env.MARIONETTE_MOCK_ADDRESS;
            const etherbase = await getEtherbaseUpgradeable(abi);
            if (marionetteMockAddress !== undefined) {
                await etherbase.grantRole(await etherbase.DEFAULT_ADMIN_ROLE(), marionetteMockAddress);
                await safeMock.transferProxyAdminOwnership(proxyAdmin.address, marionetteMockAddress);
            }
        }
    );
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}