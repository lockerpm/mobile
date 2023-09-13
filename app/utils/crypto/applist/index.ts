import orderBy from 'lodash/orderBy'


export const WALLET_APP_LIST = orderBy([
  {
    name: 'Coinbase',
    alias: 'coinbase',
    logo: require('assets/images/icons/crypto/coinbase.jpeg'),
    passcode: true,
    password: false,
    pin: false
  },
  {
    name: 'Binance',
    alias: 'bsc',
    logo: require('assets/images/icons/crypto/binance.webp'),
    passcode: false,
    password: true,
    pin: false
  },
  {
    name: 'Metamask',
    alias: 'metamask',
    logo: require('assets/images/icons/crypto/metamask.webp'),
    passcode: false,
    password: true,
    pin: false
  },
  {
    name: 'Huobi',
    alias: 'huobi',
    logo: require('assets/images/icons/crypto/huobi.webp'),
    passcode: false,
    password: true,
    pin: false
  },
  {
    name: 'Exodus',
    alias: 'exodus',
    logo: require('assets/images/icons/crypto/exodus.webp'),
    passcode: true,
    password: false,
    pin: false
  },
  {
    name: 'Crypto.com DeFi Wallet',
    alias: 'cryptocom',
    logo: require('assets/images/icons/crypto/cryptocom.webp'),
    passcode: true,
    password: false,
    pin: false
  },
  {
    name: 'RICE Wallet',
    alias: 'rice',
    logo: require('assets/images/icons/crypto/rice.webp'),
    passcode: false,
    password: false,
    pin: true
  },
  {
    name: 'Coin98',
    alias: 'coin98',
    logo: require('assets/images/icons/crypto/coin98.webp'),
    passcode: false,
    password: false,
    pin: true
  },
  {
    name: 'Trust Wallet',
    alias: 'trustwallet',
    logo: require('assets/images/icons/crypto/trustwallet.webp'),
    passcode: true,
    password: false,
    pin: false
  }
], ['name'], ['asc']).concat([
  {
    name: 'Other',
    alias: 'other',
    logo: require('assets/images/icons/crypto/crypto-wallet.png'),
    passcode: false,
    password: true,
    pin: false
  }
])