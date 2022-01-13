// SPDX-License-Identifier: AGPL-3.0-only

/**
 *   PrecompiledMock.sol - Etherbase
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


interface IPrecompiledMock {
    fallback (bytes calldata _input) external payable returns (bytes memory);
    function setTarget(address _target) external;
    function setValue(uint _value) external;
} 

contract PrecompiledMock is IPrecompiledMock {

    address public target;
    uint public value;

    fallback (bytes calldata _input) external payable override returns (bytes memory) {
        address _target = address(bytes20(_input[0:20]));
        uint _value = uint(bytes32(_input[20:20 + 32]));
        require(target == _target, "Target address was passed incorrectly");
        require(value == _value, "Value was passed incorrectly");
        return(abi.encodePacked(uint(1)));
    }
   

    function setTarget(address _target) external override {
        target = _target;
    }

    function setValue(uint _value) external override {
        value = _value;
    }
}