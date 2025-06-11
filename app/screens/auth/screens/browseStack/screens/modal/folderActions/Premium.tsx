import React from "react"
import { Image, StyleSheet } from "react-native"
import { Text, Button, BottomModalContainer } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"
import { AuthStackScreenProps } from "app/navigators"

const TRASH = require("assets/images/intro/share-password.png")

export const Premium = () => {
  const navigation = useNavigation<AuthStackScreenProps<"cipherActionsModal">["navigation"]>()

  // --------------------PARAMS---------------------

  // --------------------METHODS---------------------

  const goToPayment = async () => {
    navigation.replace("menuStack", {
      screen: "payment",
    })
  }

  return (
    <BottomModalContainer style={styles.container}>
      <Text preset="bold" tx="payment.premium.header" style={styles.header} />
      <Image resizeMode="contain" source={TRASH} style={styles.image} />
      <Text preset="label" size="base" tx={"payment.benefit.share_password"} style={styles.label} />

      <Button onPress={goToPayment} tx="common.upgrade_now" />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
    textAlign: "center",
  },
  image: {
    alignSelf: "center",
    height: 110,
    marginBottom: 12,
    width: 100,
  },
  label: {
    marginBottom: 16,
    textAlign: "center",
  },
})
