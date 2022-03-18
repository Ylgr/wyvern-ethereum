/* global artifacts: false */

const WyvernExchange = artifacts.require('./WyvernExchange.sol')
const WyvernProxyRegistry = artifacts.require('./WyvernProxyRegistry.sol')
const WyvernTokenTransferProxy = artifacts.require('./WyvernTokenTransferProxy.sol')

module.exports = async (deployer, network) => {
    if (network === 'bsc_testnet') {
        await deployer.deploy(WyvernTokenTransferProxy, '0x588CcA53d3039c934c52f523867a0ecf05a86c45');
        await deployer.deploy(WyvernExchange,
            '0x588CcA53d3039c934c52f523867a0ecf05a86c45',
            WyvernTokenTransferProxy.address,
            '0x29AAC54d6c20e80AB359561E1C61AC2Cd22AD85D', // BIC address
            '0xE56d14686572F7C1556Bc0A846D1b27Ce3489981', // fee
            )

    }

  // if (network === 'development' || network === 'rinkeby' || network === 'coverage' || network === 'main') {
  //   return deployer.deploy(WyvernProxyRegistry)
  //     .then(() => {
  //       setConfig('deployed.' + network + '.WyvernProxyRegistry', WyvernProxyRegistry.address)
  //       return TestToken.deployed().then(tokenInstance => {
  //         return deployer.deploy(WyvernTokenTransferProxy, WyvernProxyRegistry.address).then(() => {
  //           setConfig('deployed.' + network + '.WyvernTokenTransferProxy', WyvernTokenTransferProxy.address)
  //           return deployer.deploy(WyvernExchange, WyvernProxyRegistry.address, WyvernTokenTransferProxy.address, (network === 'development' || network === 'rinkeby' || network === 'coverage') ? tokenInstance.address : '0x056017c55ae7ae32d12aef7c679df83a85ca75ff', '0xa839d4b5a36265795eba6894651a8af3d0ae2e68')
  //             .then(() => {
  //               setConfig('deployed.' + network + '.WyvernExchange', WyvernExchange.address)
  //               return WyvernProxyRegistry.deployed().then(proxyRegistry => {
  //                 return WyvernExchange.deployed().then(exchange => {
  //                   return proxyRegistry.grantInitialAuthentication(exchange.address)
  //                 })
  //               })
  //             })
  //         })
  //       })
  //     })
  // }
}
