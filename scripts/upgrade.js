/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */
const hre = require('hardhat');
const { deployed } = require('./helpers/deployed');
const { getContract } = require('./helpers/getContract');
const { upgrades } = require('hardhat');
const verify = require('../scripts/verify');
const { wait } = require('../helpers/utils');

const { upgrades } = require('hardhat');
const verify = require('../scripts/verify');

let tx, verifyScript;
let Registry, registry;
let Lock, lock;

async function main() {
  // This is just a convenience check
  if (hre.network.name === 'hardhat') {
    console.warn(
      'You are trying to deploy a contract to the Hardhat Network, which' +
        'gets automatically created and destroyed every time. Use the Hardhat' +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying the contracts with the account:', await deployer.getAddress());
  console.log('Account balance:', (await deployer.getBalance()).toString());

  await getContractFactory();
  await getRegistry();
  await upgradeLock();
  await setDependencies();
}

async function getContractFactory() {
  Registry = await hre.ethers.getContractFactory('Registry');
  Lock = await hre.ethers.getContractFactory('Lock');
}

async function getRegistry() {
  registry = Registry.attach(await getContract('REGISTRY', hre.network.name));
}

async function upgradeLock() {
  const lockImpl = await upgrades.deployImplementation(Lock);
  console.log('Lock impl address:', lockImpl.address);
  await wait(30_000);

  await registry.upgradeContract('LOCK', lockImpl.address);
  await wait(30_000);
}

async function setDependencies() {
  tx = await lock.setDependencies(registry.address);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
