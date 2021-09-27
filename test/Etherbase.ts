import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Etherbase, EtherController } from "../typechain";
import * as chai from "chai"
import chaiAsPromised from "chai-as-promised";

chai.should();
chai.use(chaiAsPromised)

describe("Etherbase", () => {
    let schainOwner: SignerWithAddress;
    let hacker: SignerWithAddress;
    let etherbase: Etherbase;
    const amount = ethers.utils.parseEther("5");

    beforeEach(async() => {
        [ schainOwner, hacker ] = await ethers.getSigners();
        etherbase = await (await ethers.getContractFactory('Etherbase')).deploy(schainOwner.address) as Etherbase;
    })

    it("should allow schain owner to grant roles", async () => {
        await etherbase.hasRole(await etherbase.DEFAULT_ADMIN_ROLE(), schainOwner.address)
            .should.eventually.be.true;
    });

    it("should be able to receive ETH", async () => {
        await schainOwner.sendTransaction({value: amount, to: etherbase.address});
        await ethers.provider.getBalance(etherbase.address).should.eventually.equal(amount);
    });

    describe("when Etherbase has ETH", async () => {
        beforeEach(async () => {
            await schainOwner.sendTransaction({value: amount, to: etherbase.address});
        });

        afterEach(async() => {
            await etherbase.retrieve(schainOwner.address);
        })

        it("should be able to give ETH", async () => {
            const half = amount.div(2);
            const balanceBefore = await ethers.provider.getBalance(hacker.address);
            await etherbase.partiallyRetrieve(hacker.address, half);
            await ethers.provider.getBalance(etherbase.address).should.eventually.equal(amount.sub(half));
            await ethers.provider.getBalance(hacker.address).should.eventually.equal(half.add(balanceBefore));

            // return ETH
            await hacker.sendTransaction({to: etherbase.address, value: half});
        });

        it("should not allow anyone to retrieve ETH", async () => {
            await etherbase.connect(hacker).retrieve(hacker.address).should.eventually.rejectedWith("ETHER_MANAGER_ROLE is required");
        })

        it("should allow smart contract to retrieve ETH", async () => {
            const etherController = await (await ethers.getContractFactory("EtherController")).deploy(etherbase.address) as EtherController;
            await etherbase.grantRole(await etherbase.ETHER_MANAGER_ROLE(), etherController.address);

            const etherbaseBalanceBefore = await ethers.provider.getBalance(etherbase.address);
            const userBalanceBefore = await ethers.provider.getBalance(hacker.address);

            await etherController.provideEth(hacker.address);
            await ethers.provider.getBalance(etherbase.address).should.eventually.equal(0);
            await ethers.provider.getBalance(hacker.address).should.eventually.equal(userBalanceBefore.add(etherbaseBalanceBefore));

            await hacker.sendTransaction({to: etherbase.address, value: etherbaseBalanceBefore});
        });
    });
});
