// tslint:disable:no-console

import { promises as fs } from 'fs';
import { Interface } from "ethers/lib/utils";
import { ethers, upgrades, network } from "hardhat";
import { getAbi } from './tools/abi';
import { verifyProxy } from './tools/verification';
import { getVersion } from './tools/version';


export function getContractKeyInAbiFile(contract: string) {
    return contract.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
}

async function main() {
    const [ deployer,] = await ethers.getSigners();

    const version = await getVersion();

    let etherbaseAddress: string;
    let etherbaseInterface: Interface;
    
    console.log("Deploy Etherbase");
    const etherbaseUpgradeableFactory = await ethers.getContractFactory("Etherbase");
    const etherbase = (await upgrades.deployProxy(etherbaseUpgradeableFactory, [deployer.address]));
    await etherbase.deployTransaction.wait();
    etherbaseAddress = etherbase.address;
    etherbaseInterface = etherbase.interface;
    await verifyProxy("Etherbase", etherbase.address, []);

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
