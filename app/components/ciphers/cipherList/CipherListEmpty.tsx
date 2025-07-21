import { StyleProp, View, ViewStyle, Image, StyleSheet, ImageSourcePropType } from "react-native"
import { Button, Text } from "../../cores"
import { TxKeyPath } from "app/i18n"

type EmptyCipherListProps = {
  image?: ImageSourcePropType
  /**
   * Title text to display in the empty state
   */
  titleTx: TxKeyPath
  /**
   * Description text to display in the empty state
   */
  descTx: TxKeyPath
  /**
   * Text key for the button to add a new item
   */
  buttonTx?: TxKeyPath
  /**
   * Callback when the add item button is pressed
   */
  addItem?: () => void
  /**
   * Custom style for the container view
   */
  style?: StyleProp<ViewStyle>
}

const EMPTY_CIPHER = require("assets/images/emptyCipherList/home-empty-cipher.png")

export const EmptyCipherList = ({
  image,
  style,
  titleTx,
  descTx,
  buttonTx,
  addItem,
}: EmptyCipherListProps) => {
  return (
    <View style={[styles.container, style]}>
      <Image source={image || EMPTY_CIPHER} resizeMode="contain" style={styles.image} />

      <Text preset="bold" size="lg" style={styles.title} tx={titleTx} />

      <Text preset="label" tx={descTx} size="sm" style={styles.label} />

      {buttonTx && addItem && <Button tx={buttonTx} onPress={addItem} style={styles.button} />}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 26,
    paddingHorizontal: 42,
  },
  container: {
    alignItems: "center",
    marginTop: "10%",
  },
  image: {
    height: 90,
    width: 220,
  },
  label: { lineHeight: 21, textAlign: "center" },
  title: {
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
  },
})
