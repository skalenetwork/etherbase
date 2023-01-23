import { ethers } from "hardhat";
import hre from "hardhat";
import { Upgrader } from "@skalenetwork/upgrade-tools";
import { promises as fs, existsSync } from "fs";
import { SkaleABIFile } from "@skalenetwork/upgrade-tools/dist/src/types/SkaleABIFile";


const etherbase_address = "0xd2bA3e0000000000000000000000000000000000";

class EtherbaseUpgrader extends Upgrader {

    getDeployedVersion = async () => {
        try {
            return await (await this.getEtherbase()).version();
        } catch {
            // if there is no version() function
            // it means there is a version 1.0.0
            return "1.0.0";
        }
    };

    setVersion = async (newVersion: string) => {
        const etherbase = await this.getEtherbase();
        this.transactions.push({
            to: etherbase.address,
            data: etherbase.interface.encodeFunctionData("setVersion", [newVersion])
        });
    }

    async getEtherbase() {
        return await ethers.getContractAt("EtherbaseUpgradeable", this.abi["etherbase_address"] as string);
    }
}

async function main() {

    // prepare the manifest
    const { chainId } = await hre.ethers.provider.getNetwork();
    const originManifestFileName = __dirname + "/../.openzeppelin/predeployed.json";
    const targetManifestFileName = __dirname + `/../.openzeppelin/unknown-${chainId}.json`;

    if (!existsSync(targetManifestFileName)) {
        console.log("Create a manifest file based on predeployed template");
        await fs.copyFile(originManifestFileName, targetManifestFileName);
    }


    let abi: SkaleABIFile;
    if (process.env.ABI) {
        // a file with marionette address is provided
        abi = JSON.parse(await fs.readFile(process.env.ABI, "utf-8")) as SkaleABIFile;
    } else {
        // use default one
        abi = {
            "etherbase_address": etherbase_address
        }
    }

    const upgrader = new EtherbaseUpgrader(
        "Etherbase",
        "1.0.0",
        abi,
        ["Etherbase"]
    );

    await upgrader.upgrade();
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}