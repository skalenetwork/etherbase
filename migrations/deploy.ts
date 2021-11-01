// tslint:disable:no-console

import { promises as fs } from 'fs';
import { Interface } from "ethers/lib/utils";
import { ethers, upgrades, network, artifacts } from "hardhat";
import { EtherbaseUpgradeable } from "../typechain-types";
import { getAbi } from './tools/abi';
import { verify, verifyProxy } from './tools/verification';
import { getVersion } from './tools/version';


export function getContractKeyInAbiFile(contract: string) {
    return contract.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
}

async function main() {
    const [ deployer,] = await ethers.getSigners();

    const version = await getVersion();

    if (!process.env.MODE || !['FIXED', 'UPGRADEABLE'].includes(process.env.MODE)) {
        console.log("Required variables:");
        console.log("MODE = FIXED | UPGRADEABLE");
        console.log("");
        console.log("For custom network do not forget to set:");
        console.log("ENDPOINT - rpc endpoint");
        console.log("PRIVATE_KEY - deployer private key");
        console.log("GASPRICE - optional - desired gas price");
        console.log("");
        console.log("Usage example:");
        console.log("MODE=UPGRADEABLE npx hardhat run migrations/deploy.ts --network custom")
        process.exit(1);
    }

    const upgradeable = process.env.MODE === "UPGRADEABLE";

    let etherbaseAddress: string;
    let etherbaseInterface: Interface;
    if (upgradeable) {
        console.log("Deploy EtherbaseUpgradeable");
        const etherbaseUpgradeableFactory = await ethers.getContractFactory("EtherbaseUpgradeable");
        const etherbase = (await upgrades.deployProxy(etherbaseUpgradeableFactory, [deployer.address])) as EtherbaseUpgradeable;
        await etherbase.deployTransaction.wait();
        etherbaseAddress = etherbase.address;
        etherbaseInterface = etherbase.interface;
        await verifyProxy("EtherbaseUpgradeable", etherbase.address, []);
    } else {
        console.log("Deploy Etherbase");
        const etherbaseFactory = await ethers.getContractFactory("Etherbase");
        const etherbase = await etherbaseFactory.deploy(deployer.address);
        await etherbase.deployTransaction.wait();
        etherbaseAddress = etherbase.address;
        etherbaseInterface = etherbase.interface;
        await verify("Etherbase", etherbase.address, {"schainOwner": deployer.address})
    }

    console.log("Store ABIs");

    const abiAndAddresses: {[key: string]: string | []} = {};
    abiAndAddresses[getContractKeyInAbiFile("Etherbase") + "_address"] = etherbaseAddress;
    abiAndAddresses[getContractKeyInAbiFile("Etherbase") + "_abi"] = getAbi(etherbaseInterface);

    await fs.writeFile(`data/etherbase-${version}-${network.name}-abi-and-addresses.json`, JSON.stringify(abiAndAddresses, null, 4));

    console.log("Done");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
