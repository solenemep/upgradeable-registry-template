const { ethers, upgrades } = require('hardhat');
const { toWei, wait } = require('./utils');

let Registry, registry;

let Lock, lock;

const init = async () => {
  const users = await ethers.getSigners();

  await getContractFactory();
  await deployContracts();
  await deployImplementations();
  // await addContracts();
  await addProxies();
  await deployProxies();
  await initContracts();
  await setDependencies();

  return {
    users,
    lock,
  };
};

const getContractFactory = async () => {
  Registry = await ethers.getContractFactory('Registry');
  Lock = await ethers.getContractFactory('Lock');
};

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

// async function addContracts() {
//   tx = await registry.addContract('TREASURY', '');
//   await tx.wait();
// }

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

module.exports.init = init;
