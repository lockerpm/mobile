import * as React from "react"
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native"
import { Button, Text } from "app/components/cores"
import { CipherType } from "core/enums"
import { TxKeyPath } from "app/i18n"

interface EmptyCipherListProps {
  onAdd: () => void
  cipherTypes: CipherType[]
}

type EmptyCipherListType = {
  titleTx: TxKeyPath
  descTx: TxKeyPath
  buttonTx: TxKeyPath
  image: ImageSourcePropType
  type: CipherType
}

const HOME_EMPTY_CIPHER = require("assets/images/emptyCipherList/home-empty-cipher.png")

export const CipherListEmpty = React.memo(({ onAdd }: EmptyCipherListProps) => {
  return (
    <View style={styles.container}>
      <Image source={HOME_EMPTY_CIPHER} resizeMode="contain" style={{ height: 55, width: 120 }} />
      <Text preset="bold" size="large" style={styles.title} tx={"all_items.empty.title"} />
      <Text preset="label" tx="all_items.empty.desc" size="base" style={styles.label} />
      <View style={styles.buttonContainer}>
        <Button tx="all_items.empty.btn" onPress={onAdd} style={styles.buttonMargin} />
        <Button
          preset="secondary"
          tx={"settings.import"}
          onPress={onImport}
          style={styles.buttonMargin}
        />
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 26,
  },
  buttonMargin: {
    marginHorizontal: 8,
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
