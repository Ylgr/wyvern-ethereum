const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 6700000
    },
    kovan: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 6700000
    },
    rinkeby: {
      host: 'localhost',
      from: '0xb483a98e72a583cc9b45b70cee07ac628d633d69',
      port: 8545,
      network_id: '*',
      gas: 6700000,
      gasPrice: 21000000000
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8545,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    },
    main: {
      host: 'localhost',
      port: 8547,
      from: '0x0084a81668B9A978416aBEB88bC1572816cc7cAC',
      network_id: 1,
      gas: 6700000,
      gasPrice: 6110000000
    },
    bsc_testnet: {
      network_id: 97,
      provider: () => new HDWalletProvider(
          // process.env.PRIVATE_KEY,
          'c8153958ab784c94d8cdb17b946f68a5d8ae75b629852a7651468f1f649919b2',
          `https://data-seed-prebsc-1-s1.binance.org:8545`

      ),
      // confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  compilers: {
    solc: {
      version: '0.4.23' // A version or constraint - Ex. "^0.5.0"
    }
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: 'c8153958ab784c94d8cdb17b946f68a5d8ae75b629852a7651468f1f649919b2',
    bscscan: 'c8153958ab784c94d8cdb17b946f68a5d8ae75b629852a7651468f1f649919b2',
    testnet: 'c8153958ab784c94d8cdb17b946f68a5d8ae75b629852a7651468f1f649919b2'
  }
}
