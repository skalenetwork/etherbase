// SPDX-License-Identifier: AGPL-3.0-only

/**
 *   IEtherbaseUpgradeable.sol - Etherbase
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

// solhint-disable-next-line compiler-version
pragma solidity ^0.8.0;

import { IAccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

import { IEtherbase } from "./IEtherbase.sol";

interface IEtherbaseUpgradeable is IAccessControlUpgradeable, IEtherbase {
    function initialize(address schainOwner) external;
    function setVersion(string calldata newVersion) external;
    // slither-disable-next-line naming-convention
    function ETHER_MANAGER_ROLE() external pure returns (bytes32); // solhint-disable-line func-name-mixedcase
}
