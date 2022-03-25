// eslint-disable-next-line no-unused-vars
/* global artifacts:false, it:false, contract:false, assert:false */

const TestToken = artifacts.require('TestToken')
const WyvernExchange = artifacts.require('WyvernExchange')
const WyvernProxyRegistry = artifacts.require('WyvernProxyRegistry')
const WyvernTokenTransferProxy = artifacts.require('WyvernTokenTransferProxy')
const TestNft = artifacts.require('TestNft')
const BigNumber = require('bignumber.js')
const Web3 = require('web3')
const WyvernSchemas = require('wyvern-schemas')
const {encodeBuy, encodeSell} = WyvernSchemas

const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

contract('WyvernExchange', (accounts) => {
  const owner = accounts[0]

  let tokenInstance
  let nftInstance
  let exchangeInstance
  let registryInstance
  let tokenTransferProxyInstance
  let proxy
    // eslint-disable-next-line no-undef
  before(async () => {
    tokenInstance = await TestToken.deployed({from: owner})
    nftInstance = await TestNft.deployed({from: owner})
    exchangeInstance = await WyvernExchange.deployed({from: owner})
    registryInstance = await WyvernProxyRegistry.deployed({from: owner})
    tokenTransferProxyInstance = await WyvernTokenTransferProxy.deployed({from: owner})
  })

  it('create automatch tx', async () => {

    await registryInstance.registerProxy({from: owner})

    proxy = await registryInstance.proxies(owner)

    let buy = makeOrder(exchangeInstance.address, false)
    let sell = makeOrder(exchangeInstance.address, true)
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    // buy.paymentToken = '0x0000000000000000000000000000000000000000'
    // sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.paymentToken = tokenInstance.address
    sell.paymentToken = tokenInstance.address
    buy.basePrice = new BigNumber(10000)
    sell.basePrice = new BigNumber(10000)
    sell.makerProtocolFee = new BigNumber(100)
    sell.makerRelayerFee = new BigNumber(100)

    const _getSchema = () => {
      const schemaName_ = 'ERC721'
      const schema = WyvernSchemas.schemas['main'].filter(
          (s) => s.name == schemaName_
      )[0]

      if (!schema) {
        throw new Error(
            `Trading for this asset (${schemaName_}) is not yet supported. Please contact us or check back later!`
        )
      }
      return schema
    }

    const schema = _getSchema()
    const sellSpec = encodeSell(
        schema,
        {address: nftInstance.address, id: '20'},
        owner
    )
    const buySpec = encodeBuy(
        schema,
        {address: nftInstance.address, id: '20'},
        owner
    )

    buy.calldata = buySpec.calldata
    buy.replacementPattern = buySpec.replacementPattern
    buy.target = buySpec.target

    sell.calldata = sellSpec.calldata
    sell.replacementPattern = sellSpec.replacementPattern
    sell.target = sellSpec.target

    const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    await tokenInstance.approve(tokenTransferProxyInstance.address, MAX_INT, {from: owner})

    const canOderMatch = await exchangeInstance.ordersCanMatch_(
          [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
          [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
          [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
          buy.calldata,
          sell.calldata,
          buy.replacementPattern,
          sell.replacementPattern,
          buy.staticExtradata,
          sell.staticExtradata
      )
    console.log('canOderMatch: ', canOderMatch)

    // const buyOrder = await exchangeInstance.approveOrder_(
    //       [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken],
    //       [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt],
    //       buy.feeMethod,
    //       buy.side,
    //       buy.saleKind,
    //       buy.howToCall,
    //       buy.calldata,
    //       buy.replacementPattern,
    //       buy.staticExtradata,
    //       true, {from: owner})
    // console.log('buyOrder: ', buyOrder)
    //
    // const sellOrder = await exchangeInstance.approveOrder_(
    //       [sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
    //       [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
    //       sell.feeMethod,
    //       sell.side,
    //       sell.saleKind,
    //       sell.howToCall,
    //       sell.calldata,
    //       sell.replacementPattern,
    //       sell.staticExtradata,
    //       true, {from: owner})
    // console.log('sellOrder: ', sellOrder)
    const buyHash = hashOrder(buy)
    const sellHash = hashOrder(sell)
    let buySignature = await web3.eth.sign(buyHash, accounts[0])
    buySignature = buySignature.substr(2)
    const br = '0x' + buySignature.slice(0, 64)
    const bs = '0x' + buySignature.slice(64, 128)
    const bv = 27 + parseInt('0x' + buySignature.slice(128, 130), 16)
    let sellSignature = await web3.eth.sign(sellHash, accounts[0])
    sellSignature = sellSignature.substr(2)
    const sr = '0x' + sellSignature.slice(0, 64)
    const ss = '0x' + sellSignature.slice(64, 128)
    const sv = 27 + parseInt('0x' + sellSignature.slice(128, 130), 16)

    const autoMatchingOrder = await exchangeInstance.atomicMatch_(
          [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
          [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
          [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
          buy.calldata,
          sell.calldata,
          buy.replacementPattern,
          sell.replacementPattern,
          buy.staticExtradata,
          sell.staticExtradata,
          [bv, sv],
          [br, bs, sr, ss, '0x0000000000000000000000000000000000000000000000000000000000000000'],
          {from: owner}
        )

    console.log('owner: ', owner)
    console.log('nft: ', nftInstance.address)
    console.log('autoMatchingOrder: ', autoMatchingOrder.receipt.rawLogs)
  })

  const makeOrder = (exchange, isMaker) => ({
    exchange: exchange,
    maker: accounts[0],
    taker: accounts[0],
    makerRelayerFee: 0,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0,
    feeRecipient: isMaker ? accounts[0] : '0x0000000000000000000000000000000000000000',
    feeMethod: 0,
    side: 0,
    saleKind: 0,
    target: proxy,
    howToCall: 0,
    calldata: '0x',
    replacementPattern: '0x',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: accounts[0],
    basePrice: new BigNumber(0),
    extra: 0,
    listingTime: 0,
    expirationTime: 0,
    salt: new BigNumber(0)
  })

  const hashOrder = (order) => {
    return Web3.utils.soliditySha3(
            {type: 'address', value: order.exchange},
            {type: 'address', value: order.maker},
            {type: 'address', value: order.taker},
            {type: 'uint', value: new BigNumber(order.makerRelayerFee)},
            {type: 'uint', value: new BigNumber(order.takerRelayerFee)},
            {type: 'uint', value: new BigNumber(order.takerProtocolFee)},
            {type: 'uint', value: new BigNumber(order.takerProtocolFee)},
            {type: 'address', value: order.feeRecipient},
            {type: 'uint8', value: order.feeMethod},
            {type: 'uint8', value: order.side},
            {type: 'uint8', value: order.saleKind},
            {type: 'address', value: order.target},
            {type: 'uint8', value: order.howToCall},
            {type: 'bytes', value: order.calldata},
            {type: 'bytes', value: order.replacementPattern},
            {type: 'address', value: order.staticTarget},
            {type: 'bytes', value: order.staticExtradata},
            {type: 'address', value: order.paymentToken},
            {type: 'uint', value: new BigNumber(order.basePrice)},
            {type: 'uint', value: new BigNumber(order.extra)},
            {type: 'uint', value: new BigNumber(order.listingTime)},
            {type: 'uint', value: new BigNumber(order.expirationTime)},
            {type: 'uint', value: order.salt}
        ).toString('hex')
  }
})
