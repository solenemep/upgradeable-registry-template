const { expect } = require('chai');
const { init } = require('./helpers/init');
const { toBN, toWei, snapshot, restore, getTime, getCosts } = require('./helpers/utils');

describe('Lock', async () => {
  let lock;
  let owner;
  let user1, user2, user3, user4, user5, user6;

  before('setup', async () => {
    const setups = await init();
    owner = setups.users[0];
    user1 = setups.users[1];
    user2 = setups.users[2];
    user3 = setups.users[3];
    user4 = setups.users[4];
    user5 = setups.users[5];
    user6 = setups.users[6];

    lock = setups.lock;

    await snapshot();
  });

  afterEach('revert', async () => {
    await restore();
  });

  describe('lock', async () => {
    it('locks successfully', async () => {
      console.log(lock.address);
    });
    it('add successfully', async () => {
      console.log((await lock.add(2)).toString());
    });
  });
});
