import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Etherbase, EtherbaseUpgradeable } from "../typechain-types";
import * as chai from "chai"
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.should();
chai.use(chaiAsPromised)


async function deployEtherbase(schainOwner: string) {
    return await (await ethers.getContractFactory('Etherbase')).deploy(schainOwner);
}

async function deployEtherbaseUpgradeable(schainOwner: string) {
    const etherbase = await (await ethers.getContractFactory('EtherbaseUpgradeable')).deploy();
    await etherbase.initialize(schainOwner);
    return etherbase;
}

function testEtherbase(deploy: (schainOwner: string) => Promise<Etherbase | EtherbaseUpgradeable>) {
    let schainOwner: SignerWithAddress;
    let hacker: SignerWithAddress;
    let etherbase: Etherbase | EtherbaseUpgradeable;
    const amount = ethers.utils.parseEther("5");

    beforeEach(async() => {
        [ schainOwner, hacker ] = await ethers.getSigners();
        etherbase = await deploy(schainOwner.address);
    })

    it("should allow schain owner to grant roles", async () => {
        await etherbase.hasRole(await etherbase.DEFAULT_ADMIN_ROLE(), schainOwner.address)
            .should.eventually.be.true;
    });

    it("should be able to receive ETH", async () => {
        await schainOwner.sendTransaction({value: amount, to: etherbase.address})
            .should.emit(etherbase, "EtherReceived")
            .withArgs(schainOwner.address, amount);
        await ethers.provider.getBalance(etherbase.address).should.eventually.equal(amount);
    });

    it("should allow only owner to set a version", async function (this: Mocha.Context) {
        if (this.test?.fullTitle().includes("EtherbaseUpgradeable")) {
            const etherbaseUpgradeable: EtherbaseUpgradeable = etherbase as EtherbaseUpgradeable;

            await expect(etherbaseUpgradeable.connect(hacker).setVersion("bad")).to.be.revertedWithCustomError(
                etherbaseUpgradeable,
                "Unauthorized"
                );

            await etherbaseUpgradeable.setVersion("good");
            (await etherbaseUpgradeable.version()).should.be.equal("good");
        }
    });

    describe("when Etherbase has ETH", () => {
        beforeEach(async () => {
            await schainOwner.sendTransaction({value: amount, to: etherbase.address});
        });

        afterEach(async() => {
            await etherbase.retrieve(schainOwner.address);
        })

        it("should be able to give ETH", async () => {
            const half = amount.div(2);
            const balanceBefore = await ethers.provider.getBalance(hacker.address);
            await etherbase.partiallyRetrieve(hacker.address, half)
                .should.emit(etherbase, "EtherSent")
                .withArgs(hacker.address, half);
            await ethers.provider.getBalance(etherbase.address).should.eventually.equal(amount.sub(half));
            await ethers.provider.getBalance(hacker.address).should.eventually.equal(half.add(balanceBefore));

            // return ETH
            await hacker.sendTransaction({to: etherbase.address, value: half});
        });

        it("should not allow anyone to retrieve ETH", async () => {
            await etherbase.connect(hacker).retrieve(hacker.address).should.eventually.rejectedWith("ETHER_MANAGER_ROLE is required");
        })

        it("should allow smart contract to retrieve ETH", async () => {
            const etherController = await (await ethers.getContractFactory("EtherController")).deploy(etherbase.address);
            await etherbase.grantRole(await etherbase.ETHER_MANAGER_ROLE(), etherController.address);

            const etherbaseBalanceBefore = await ethers.provider.getBalance(etherbase.address);
            const userBalanceBefore = await ethers.provider.getBalance(hacker.address);

            await etherController.provideEth(hacker.address)
                .should.emit(etherbase, "EtherSent")
                .withArgs(hacker.address, etherbaseBalanceBefore);
            await ethers.provider.getBalance(etherbase.address).should.eventually.equal(0);
            await ethers.provider.getBalance(hacker.address).should.eventually.equal(userBalanceBefore.add(etherbaseBalanceBefore));

            // return ETH
            await hacker.sendTransaction({to: etherbase.address, value: etherbaseBalanceBefore});
        });
    });
}

describe("Etherbase", () => {
    testEtherbase(deployEtherbase);
});

describe("EtherbaseUpgradeable", () => {
    testEtherbase(deployEtherbaseUpgradeable);
});
