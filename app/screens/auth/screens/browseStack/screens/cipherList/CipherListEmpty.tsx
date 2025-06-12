import * as React from "react"
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native"
import { Button, Text } from "app/components/cores"
import { CipherType } from "core/enums"
import { TxKeyPath } from "app/i18n"

interface EmptyCipherListProps {
  onAdd: () => void
  cipherTypes: CipherType[]
  isDeleted: boolean
}

type EmptyCipherListType = {
  titleTx: TxKeyPath
  descTx: TxKeyPath
  buttonTx?: TxKeyPath
  image: ImageSourcePropType
}

const HOME_EMPTY = require("assets/images/emptyCipherList/home-empty-cipher.png")
const CRYPTO_EMPTY = require("assets/images/emptyCipherList/crypto-empty-img.png")
const CARD_EMPTY = require("assets/images/emptyCipherList/card-empty-img.png")
const IDENTITIES_EMPTY = require("assets/images/emptyCipherList/identity-empty-img.png")
const PASSWORD_EMPTY = require("assets/images/emptyCipherList/password-empty-img.png")
const NOTE_EMPTY = require("assets/images/emptyCipherList/note-empty-img.png")
const TRASH_EMPTY = require("assets/images/emptyCipherList/trash-empty-img.png")

const emptyTypeContent: Record<number, EmptyCipherListType> = {
  [CipherType.Login]: {
    titleTx: "password.empty.title",
    descTx: "password.empty.desc",
    buttonTx: "password.empty.btn",
    image: PASSWORD_EMPTY,
  },
  [CipherType.CryptoWallet]: {
    titleTx: "crypto_asset.empty.title",
    descTx: "crypto_asset.empty.desc",
    buttonTx: "crypto_asset.empty.btn",
    image: CRYPTO_EMPTY,
  },
  [CipherType.Card]: {
    titleTx: "card.empty.title",
    descTx: "card.empty.desc",
    buttonTx: "card.empty.btn",
    image: CARD_EMPTY,
  },
  [CipherType.Identity]: {
    titleTx: "identity.empty.title",
    descTx: "identity.empty.desc",
    buttonTx: "identity.empty.btn",
    image: IDENTITIES_EMPTY,
  },
  [CipherType.SecureNote]: {
    titleTx: "note.empty.title",
    descTx: "note.empty.desc",
    buttonTx: "note.empty.btn",
    image: NOTE_EMPTY,
  },
}

const emptyAll: EmptyCipherListType = {
  titleTx: "all_items.empty.title",
  descTx: "all_items.empty.desc",
  buttonTx: "all_items.empty.btn",
  image: HOME_EMPTY,
}
const trashEmpty: EmptyCipherListType = {
  titleTx: "trash.empty.title",
  descTx: "trash.empty.desc",
  image: TRASH_EMPTY,
}

const parseEmptyCipherContent = (
  cipherTypes: CipherType[],
  isDeleted: boolean,
): EmptyCipherListType => {
  if (isDeleted) {
    return trashEmpty
  }
  if (cipherTypes.length > 2) {
    // for all types
    return emptyAll
  }
  if (cipherTypes.length === 2) {
    // for password and master password
    return emptyTypeContent[CipherType.Login] || emptyAll
  }
  if (cipherTypes.length === 1) {
    return emptyTypeContent[cipherTypes[0]] || emptyAll
  }
  return emptyAll
}

export const CipherListEmpty = React.memo(
  ({ onAdd, cipherTypes, isDeleted }: EmptyCipherListProps) => {
    const content = parseEmptyCipherContent(cipherTypes, isDeleted)
    return (
      <View style={styles.container}>
        <Image source={content.image} resizeMode="contain" style={styles.image} />
        <Text preset="bold" size="large" style={styles.title} tx={content.titleTx} />
        <Text preset="label" tx={content.descTx} size="base" style={styles.label} />
        {content.buttonTx && <Button tx={content.buttonTx} onPress={onAdd} />}
      </View>
    )
  },
)

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 26,
  },

  container: {
    alignItems: "center",
    marginTop: "10%",
    paddingHorizontal: 20,
  },
  image: {
    height: 55,
    width: 120,
  },
  label: {
    lineHeight: 21,
    textAlign: "center",
  },
  title: {
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
  },
})
