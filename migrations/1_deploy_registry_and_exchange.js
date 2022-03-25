/* global artifacts: false */

const WyvernExchange = artifacts.require('./WyvernExchange.sol')
const WyvernProxyRegistry = artifacts.require('./WyvernProxyRegistry.sol')
const WyvernTokenTransferProxy = artifacts.require('./WyvernTokenTransferProxy.sol')
const TestToken = artifacts.require('TestToken')
const TestNft = artifacts.require('TestNft')

module.exports = async (deployer, network) => {
  if (network === 'bsc_testnet') {
    // await deployer.deploy(TestToken)
    deployer.deploy(TestNft, '0x588CcA53d3039c934c52f523867a0ecf05a86c45')

      // await deployer.deploy(WyvernTokenTransferProxy, '0x588CcA53d3039c934c52f523867a0ecf05a86c45')
    // await deployer.deploy(WyvernExchange,
    //         '0x588CcA53d3039c934c52f523867a0ecf05a86c45',
    //         WyvernTokenTransferProxy.address,
    //         '0x43b67834264a9C9B18692A91e5C86b5f6dBAbA21', // BIC address
            // TestToken.address, // BIC address
            // '0xF4402fE2B09da7c02504DC308DBc307834CE56fE' // fee
            // )
  }

  if (network === 'development' || network === 'rinkeby' || network === 'coverage' || network === 'main') {
    return deployer.deploy(WyvernProxyRegistry)
      .then(() => {
        deployer.deploy(TestNft, WyvernProxyRegistry.address)

        return deployer.deploy(TestToken).then(tokenInstance => {
          return deployer.deploy(WyvernTokenTransferProxy, WyvernProxyRegistry.address).then(() => {
            return deployer.deploy(WyvernExchange, WyvernProxyRegistry.address, WyvernTokenTransferProxy.address, tokenInstance.address, '0xF4402fE2B09da7c02504DC308DBc307834CE56fE')
              .then(() => {
                return WyvernProxyRegistry.deployed().then(proxyRegistry => {
                  return WyvernExchange.deployed().then(exchange => {
                    return proxyRegistry.grantInitialAuthentication(exchange.address)
                  })
                })
              })
          })
        })
      })
  }
}
