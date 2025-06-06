import * as React from "react"
import {
  StyleProp,
  View,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
  Image,
  StyleSheet,
} from "react-native"
import { Button, Text } from "../../cores"
import { TxKeyPath } from "app/i18n"

type EmptyCipherListProps = {
  /**
   * Image to display in the empty state
   */
  img: ImageSourcePropType
  /**
   * Custom style for the image
   */
  imgStyle?: ImageStyle
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

export const EmptyCipherList = ({
  style,
  img,
  titleTx,
  descTx,
  buttonTx,
  addItem,
  imgStyle,
}: EmptyCipherListProps) => {
  return (
    <View style={[styles.container, style]}>
      <Image source={img} resizeMode="contain" style={imgStyle} />

      <Text preset="bold" size="large" style={styles.title} text={titleTx} />

      <Text preset="label" tx={descTx} size="base" style={styles.label} />

      {buttonTx && addItem && (
        <Button
          tx={buttonTx}
          onPress={addItem}
          style={{
            marginTop: 26,
            paddingHorizontal: 42,
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: "10%",
  },
  label: { lineHeight: 21, textAlign: "center" },
  title: {
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
  },
})
