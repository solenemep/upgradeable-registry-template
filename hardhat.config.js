require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-solhint');
require('hardhat-docgen');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-web3');
require('@openzeppelin/hardhat-upgrades');
require('@nomicfoundation/hardhat-chai-matchers');
require('web3-eth');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.10',
};
