import orderBy from 'lodash/orderBy'


export const CHAIN_LIST = orderBy([
  {
    name: 'Bitcoin',
    alias: 'bitcoin',
    logo: require('assets/images/icons/crypto/bitcoin.png')
  },
  {
    name: 'Binance Smart Chain',
    alias: 'bsc',
    logo: require('assets/images/icons/crypto/bsc.png')
  },
  {
    name: 'Ethereum',
    alias: 'ethereum',
    logo: require('assets/images/icons/crypto/ethereum.png')
  },
  {
    name: 'Polygon',
    alias: 'polygon',
    logo: require('assets/images/icons/crypto/polygon.png')
  },
  {
    name: 'Avalanche',
    alias: 'avalanche',
    logo: require('assets/images/icons/crypto/avalanche.png')
  },
  {
    name: 'Solana',
    alias: 'solana',
    logo: require('assets/images/icons/crypto/solana.png')
  },
  {
    name: 'Polkadot',
    alias: 'polkadot',
    logo: require('assets/images/icons/crypto/polkadot.png')
  },
  {
    name: 'Cosmos',
    alias: 'cosmos',
    logo: require('assets/images/icons/crypto/cosmos.png')
  },
  {
    name: 'Metadium',
    alias: 'metadium',
    logo: require('assets/images/icons/crypto/metadium.png')
  },
  {
    name: 'Cronos',
    alias: 'cronos',
    logo: require('assets/images/icons/crypto/cronos.png')
  },
  {
    name: 'Shibachain',
    alias: 'shibachain',
    logo: require('assets/images/icons/crypto/shibachain.png')
  },
  {
    name: 'XRP Ledger',
    alias: 'xrpl',
    logo: require('assets/images/icons/crypto/xrpl.png')
  },
  {
    name: 'Cardano',
    alias: 'cardano',
    logo: require('assets/images/icons/crypto/cardano.png')
  },
  {
    name: 'Hedera',
    alias: 'hedera',
    logo: require('assets/images/icons/crypto/hedera.png')
  },
  {
    name: 'Tezos',
    alias: 'tezos',
    logo: require('assets/images/icons/crypto/tezos.png')
  },
  {
    name: 'Boba',
    alias: 'boba',
    logo: require('assets/images/icons/crypto/boba.png')
  },
  {
    name: 'Tomochain',
    alias: 'tomochain',
    logo: require('assets/images/icons/crypto/tomochain.png')
  },
  {
    name: 'Gnosis',
    alias: 'gnosis',
    logo: require('assets/images/icons/crypto/gnosis.png')
  }
], ['name'], ['asc']).concat([
  {
    name: 'Other',
    alias: 'other',
    logo: require('assets/images/icons/crypto/other.png')
  }
])