// SPDX-License-Identifier: AGPL-3.0-only

/**
 *   Etherbase.sol - Etherbase
 *   Copyright (C) 2021-Present SKALE Labs
 *   @author Dmytro Stebaiev
 *
 *   Etherbase is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   Etherbase is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with Etherbase.  If not, see <https://www.gnu.org/licenses/>.
 */

pragma solidity ^0.8.11;

import { AccessControlEnumerable } from "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

import { IEtherbase } from "./interfaces/IEtherbase.sol";


contract Etherbase is AccessControlEnumerable, IEtherbase {

    bytes32 public constant ETHER_MANAGER_ROLE = keccak256("ETHER_MANAGER_ROLE");

    event EtherReceived(
        address sender,
        uint256 amount
    );

    event EtherSent(
        address receiver,
        uint256 amount
    );

    modifier onlyEtherManager() {
        if(!hasRole(ETHER_MANAGER_ROLE, msg.sender)) {
            revert RoleRequired(ETHER_MANAGER_ROLE);
        }
        _;
    }

    constructor (address schainOwner) {
        _setupRole(DEFAULT_ADMIN_ROLE, schainOwner);
        _setupRole(ETHER_MANAGER_ROLE, schainOwner);
    }

    receive() external payable override {
        emit EtherReceived(msg.sender, msg.value);
    }

    function retrieve(address payable receiver) external override onlyEtherManager {
        partiallyRetrieve(receiver, address(this).balance);
    }

    function partiallyRetrieve(address payable receiver, uint256 amount) public override onlyEtherManager {
        if(receiver == address(0)) {
            revert EmptyReceiver();
        }
        if(amount > address(this).balance) {
            revert InsufficientFunds();
        }

        emit EtherSent(receiver, amount);

        receiver.transfer(amount);
    }
}
