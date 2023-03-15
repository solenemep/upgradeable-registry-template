// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import "./helpers/Upgrader.sol";

contract Registry is Ownable {
    Upgrader internal _upgrader;

    mapping(string => address) private _contracts;
    mapping(address => bool) private _isProxy;

    constructor() {
        _upgrader = new Upgrader();
    }

    function addContract(string memory name, address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Wrong address");

        _contracts[name] = contractAddress;
    }

    function addProxyContract(string memory name, address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Wrong address");

        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(contractAddress, address(_upgrader), "");

        _contracts[name] = address(proxy);
        _isProxy[address(proxy)] = true;
    }

    function deleteContract(string memory name) external onlyOwner {
        require(_contracts[name] != address(0), "No mapping");

        delete _contracts[name];
    }

    function upgradeContract(string memory name, address newImplementation) external onlyOwner {
        _upgradeContract(name, newImplementation, "");
    }

    /// @notice can only call functions that have no parameters
    function upgradeContractAndCall(
        string memory name,
        address newImplementation,
        string calldata functionSignature
    ) external onlyOwner {
        _upgradeContract(name, newImplementation, functionSignature);
    }

    function _upgradeContract(string memory name, address newImplementation, string memory functionSignature) internal {
        address contractToUpgrade = _contracts[name];

        require(contractToUpgrade != address(0), "No mapping");
        require(_isProxy[contractToUpgrade], "Not a proxy");

        if (bytes(functionSignature).length > 0) {
            _upgrader.upgradeAndCall(contractToUpgrade, newImplementation, abi.encodeWithSignature(functionSignature));
        } else {
            _upgrader.upgrade(contractToUpgrade, newImplementation);
        }
    }

    function getContract(string memory name) public view returns (address) {
        require(_contracts[name] != address(0), "No mapping");

        return _contracts[name];
    }

    function hasContract(string memory name) external view returns (bool) {
        return _contracts[name] != address(0);
    }

    function getUpgrader() external view returns (address) {
        require(address(_upgrader) != address(0), "Wrong upgrader");

        return address(_upgrader);
    }

    function getImplementation(string memory name) external returns (address) {
        address contractProxy = _contracts[name];

        require(contractProxy != address(0), "No mapping");
        require(_isProxy[contractProxy], "Not a proxy");

        return _upgrader.getImplementation(contractProxy);
    }
}
