/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */
const hre = require('hardhat');
const { deployed } = require('./helpers/deployed');
const { upgrades } = require('hardhat');
const verify = require('../scripts/verify');
const { wait } = require('../helpers/utils');

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

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', await deployer.getAddress());
  console.log('Account balance:', (await deployer.getBalance()).toString());

  await getContractFactory();
  await deployContracts();
  await deployImplementations();
  await addContracts();
  await addProxies();
  await deployProxies();
  await initContracts();
  await setDependencies();
  await setUpContracts();
  await verifyContracts();
  await printContracts();
}

async function getContractFactory() {
  Registry = await hre.ethers.getContractFactory('Registry');
  Lock = await hre.ethers.getContractFactory('Lock');
}

async function deployContracts() {
  // Registry
  registry = await Registry.deploy();
  await registry.deployed();
  console.log('Registry address:', registry.address);
  await wait(30_000);
}

async function deployImplementations() {
  // Lock
  lock = await upgrades.deployImplementation(Lock);
  console.log('Lock impl address:', lock.address);
  await wait(30_000);
}

async function addContracts() {
  tx = await registry.addContract('TREASURY', '');
  await tx.wait();
}

async function addProxies() {
  tx = await registry.addProxyContract('LOCK', lock);
  await tx.wait();
}

async function deployProxies() {
  // Lock
  lock = await Lock.attach(await registry.getContract('LOCK'));
  console.log('Lock address:', lock.address);
  await wait(30_000);
}

async function initContracts() {
  await lock.__Lock_init();
}

async function setDependencies() {
  tx = await lock.setDependencies(registry.address);
  await tx.wait();
}

async function verifyContracts() {
  console.log('Waiting 20 seconds before calling verify script...');
  await wait(20_000);

  // Registry
  verifyScript = verify.buildVerifyScript('Registry', registry.address, hre.network.name, ``, false, '');
  verify.logVerifyScript(verifyScript);
  await verify.verifyContract(verifyScript, 2);
  console.log('Registry verified');

  // Lock
  verifyScript = verify.buildVerifyScript('Lock', lock.address, hre.network.name, ``, false, '');
  verify.logVerifyScript(verifyScript);
  await verify.verifyContract(verifyScript, 2);
  console.log('Lock verified');
}

async function printContracts() {
  await deployed('REGISTRY', hre.network.name, registry.address);
  await deployed('LOCK', hre.network.name, lock.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
