import { ImageSourcePropType } from "react-native"

// PERMISSIONS
export const TEAM_COLLECTION_EDITOR = ["owner", "admin"]
export const TEAM_CIPHER_EDITOR = ["owner", "admin", "manager"]

// DATA
export const TEMP_PREFIX = "tmp__"
export const MAX_MULTIPLE_SHARE_COUNT = 20
export const IMPORT_BATCH_SIZE = 1000
export const BACKGROUND_DECRYPT_FIRST_BATCH_SIZE = 50
export const BACKGROUND_DECRYPT_BATCH_SIZE = 500
export const BACKGROUND_DECRYPT_REINDEX_EVERY = 2
export const MAX_CIPHER_SELECTION = 10000
export const MASTER_PW_MIN_LENGTH = 8

// FREE
export const FREE_PLAN_LIMIT = {
  ITEMS: 100,
  OTP: 10,
  PRIVATE_EMAIL: 10,
}

export const CARD_BRANDS: {
  label: string
  value: string
  logo: ImageSourcePropType
}[] = [
  {
    label: "Visa",
    value: "Visa",
    logo: require("assets/images/cards/visa.png"),
  },
  {
    label: "Mastercard",
    value: "Mastercard",
    logo: require("assets/images/cards/mastercard.png"),
  },
  {
    label: "American Express",
    value: "Amex",
    logo: require("assets/images/cards/american-express.png"),
  },
  {
    label: "Discover",
    value: "Discover",
    logo: require("assets/images/cards/discover.png"),
  },
  {
    label: "Diners Club",
    value: "Diners Club",
    logo: require("assets/images/cards/diners-club.png"),
  },
  {
    label: "JCB",
    value: "JCB",
    logo: require("assets/images/cards/jcb.png"),
  },
  {
    label: "Maestro",
    value: "Maestro",
    logo: require("assets/images/cards/maestro.png"),
  },
  {
    label: "UnionPay",
    value: "UnionPay",
    logo: require("assets/images/cards/union-pay.png"),
  },
  {
    label: "Other",
    value: "Other",
    logo: require("assets/images/cards/credit-card.png"),
  },
]
