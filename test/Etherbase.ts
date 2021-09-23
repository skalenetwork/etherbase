import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Etherbase } from "../typechain";
import * as chai from 'chai'    
import chaiAsPromised from 'chai-as-promised'

chai.should();
chai.use(chaiAsPromised)

describe('Etherbase', () => {
    let schainOwner: SignerWithAddress
    let etherbase: Etherbase;

    beforeEach(async() => {
        [ schainOwner ] = await ethers.getSigners();
        etherbase = await (await ethers.getContractFactory('Etherbase')).deploy(schainOwner.address) as Etherbase;
    })

    it("should allow schain owner to grant roles", async () => {
        await etherbase.hasRole(await etherbase.DEFAULT_ADMIN_ROLE(), schainOwner.address)
            .should.eventually.be.true;
    })
});
