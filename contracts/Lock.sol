// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./Registry.sol";

contract Lock is OwnableUpgradeable {
    address public treasury;

    mapping(address => uint256) internal _lockedAmounts;

    function __Lock_init() external initializer {
        __Ownable_init();
    }

    function setDependencies(address registryAddress) external onlyOwner {
        // treasury = Registry(registryAddress).getContract("TREASURY");
    }

    function lock(uint256 amount) external {
        _lockedAmounts[msg.sender] += amount;
    }

    function add(uint256 a) external pure returns (uint256) {
        return a + 10;
    }
}
