import orderBy from "lodash/orderBy"

export const WALLET_APP_LIST = orderBy(
  [
    {
      name: "Coinbase",
      alias: "coinbase",
      logo: require("assets/images/icons/crypto/coinbase.jpeg"),
    },
    {
      name: "Binance",
      alias: "bsc",
      logo: require("assets/images/icons/crypto/binance.webp"),
    },
    {
      name: "Metamask",
      alias: "metamask",
      logo: require("assets/images/icons/crypto/metamask.webp"),
    },
    {
      name: "Huobi",
      alias: "huobi",
      logo: require("assets/images/icons/crypto/huobi.webp"),
    },
    {
      name: "Exodus",
      alias: "exodus",
      logo: require("assets/images/icons/crypto/exodus.webp"),
    },
    {
      name: "Crypto.com DeFi Wallet",
      alias: "cryptocom",
      logo: require("assets/images/icons/crypto/cryptocom.webp"),
    },
    {
      name: "RICE Wallet",
      alias: "rice",
      logo: require("assets/images/icons/crypto/rice.webp"),
    },
    {
      name: "Coin98",
      alias: "coin98",
      logo: require("assets/images/icons/crypto/coin98.webp"),
    },
    {
      name: "Trust Wallet",
      alias: "trustwallet",
      logo: require("assets/images/icons/crypto/trustwallet.png"),
    },
    {
      name: "OKX Exchange",
      alias: "okx",
      logo: require("assets/images/icons/crypto/okx.png"),
    },
    {
      name: "Bybit Exchange",
      alias: "bybit",
      logo: require("assets/images/icons/crypto/bybit.png"),
    },
    {
      name: "Ledger",
      alias: "ledger",
      logo: require("assets/images/icons/crypto/ledger.png"),
    },
    {
      name: "Backpack",
      alias: "backpack",
      logo: require("assets/images/icons/crypto/backpack.png"),
    },
    {
      name: "Electrum",
      alias: "electrum",
      logo: require("assets/images/icons/crypto/electrum.png"),
    },
    {
      name: "Ellipal",
      alias: "ellipal",
      logo: require("assets/images/icons/crypto/ellipal.png"),
    },
    {
      name: "Phantom",
      alias: "phantom",
      logo: require("assets/images/icons/crypto/phantom.png"),
    },
    {
      name: "Rabby",
      alias: "rabby",
      logo: require("assets/images/icons/crypto/rabby.png"),
    },
    {
      name: "Tonkeeper",
      alias: "tonkeeper",
      logo: require("assets/images/icons/crypto/tonkeeper.png"),
    },
  ],
  ["name"],
  ["asc"]
).concat([
  {
    name: "Other",
    alias: "other",
    logo: require("assets/images/icons/crypto/crypto-wallet.png"),
  },
])
