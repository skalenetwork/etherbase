// SPDX-License-Identifier: AGPL-3.0-only

/**
 *   EtherbaseUpgradeable.sol - Etherbase
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

import { AccessControlEnumerableUpgradeable, AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

import { IEtherbaseUpgradeable } from "./interfaces/IEtherbaseUpgradeable.sol";


contract EtherbaseUpgradeable is AccessControlEnumerableUpgradeable, IEtherbaseUpgradeable {

    bytes32 public constant override ETHER_MANAGER_ROLE = keccak256("ETHER_MANAGER_ROLE");
    string public version;

    event EtherReceived(
        address sender,
        uint256 amount
    );

    event EtherSent(
        address receiver,
        uint256 amount
    );

    event VersionUpdated(
        string oldVersion,
        string newVersion
    );

    error Unauthorized(address unauthorizedSender);

    modifier onlyEtherManager() {
        require(hasRole(ETHER_MANAGER_ROLE, msg.sender), "ETHER_MANAGER_ROLE is required");
        _;
    }

    receive() external payable override {
        emit EtherReceived(msg.sender, msg.value);
    }

    function retrieve(address payable receiver) external override onlyEtherManager {
        partiallyRetrieve(receiver, address(this).balance);
    }

    function setVersion(string calldata newVersion) external override {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender))
            revert Unauthorized(msg.sender);
        emit VersionUpdated(version, newVersion);
        version = newVersion;
    }

    function initialize(address schainOwner) external initializer override
    {
        AccessControlUpgradeable.__AccessControl_init();
        _setupRole(DEFAULT_ADMIN_ROLE, schainOwner);
        _setupRole(ETHER_MANAGER_ROLE, schainOwner);
    }

    function partiallyRetrieve(address payable receiver, uint256 amount) public override onlyEtherManager {
        require(receiver != address(0), "Receiver address is not set");
        require(amount <= address(this).balance, "Insufficient funds");

        emit EtherSent(receiver, amount);

        receiver.transfer(amount);
    }
}
