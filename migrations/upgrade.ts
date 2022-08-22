import { ethers } from "hardhat";
import chalk from "chalk";
import { upgrade, SkaleABIFile, getContractKeyInAbiFile, encodeTransaction } from "@skalenetwork/upgrade-tools"


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
        async () => {
            // initialize
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