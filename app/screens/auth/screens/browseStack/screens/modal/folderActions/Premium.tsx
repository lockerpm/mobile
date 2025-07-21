import { Image, StyleSheet, View } from "react-native"
import { Text, Button, BottomModalContainer, BottomModalHeader } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"
import { BrowseScreenProps } from "app/navigators"
import { delay } from "@/utils/delay"

const TRASH = require("assets/images/intro/share-password.png")

export const Premium = () => {
  const navigation = useNavigation<BrowseScreenProps<"folderActionModal">["navigation"]>()

  // --------------------PARAMS---------------------

  // --------------------METHODS---------------------

  const goToPayment = async () => {
    navigation.goBack()
    delay(30).then(() => {
      navigation.navigate("menuStack", {
        screen: "payment",
      })
    })
  }

  return (
    <BottomModalContainer>
      <BottomModalHeader tx="payment:premium.header" onClose={navigation.goBack} />

      <View style={styles.container}>
        <Image resizeMode="contain" source={TRASH} style={styles.image} />
        <Text preset="label" tx={"payment:benefit.share_password"} style={styles.label} />

        <Button onPress={goToPayment} tx="common:upgrade_now" />
      </View>
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  image: {
    alignSelf: "center",
    height: 170,
    marginBottom: 12,
    width: 150,
  },
  label: {
    marginBottom: 24,
    textAlign: "center",
  },
})
