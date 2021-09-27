// SPDX-License-Identifier: AGPL-3.0-only

/**
 *   EtherController.sol - Etherbase
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

pragma solidity ^0.8.7;

import "../Etherbase.sol";


interface IEtherController {
    function provideEth(address payable target) external;
}

contract EtherController is IEtherController {

    Etherbase public etherbase;

    constructor (Etherbase _etherbase) {
        etherbase = _etherbase;
    }

    function provideEth(address payable target) external override {
        etherbase.retrieve(target);
    }
}