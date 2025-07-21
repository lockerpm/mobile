import { Image, StyleSheet, View } from "react-native"
import { Text, Button, BottomModalContainer } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"
import { BrowseScreenProps } from "app/navigators"
import { delay } from "@/utils/delay"

const locker = require("assets/images/intro/locker.png")

export const Premium = () => {
  const navigation = useNavigation<BrowseScreenProps<"folderActionModal">["navigation"]>()

  // --------------------PARAMS---------------------

  // --------------------METHODS---------------------

  const onUpgrade = async () => {
    navigation.goBack()
    delay(50).then(() => {
      navigation.navigate("menuStack", {
        screen: "payment",
      })
    })
  }

  return (
    <BottomModalContainer>
      <View style={styles.ph16}>
        <Text preset="bold" tx={"error:limit_storage"} style={styles.title} />
        <Image source={locker} style={styles.image} resizeMode="contain" />

        <Text tx="payment:benefit.locker" style={styles.locker} />
        <Button tx={"common:upgrade_now"} onPress={onUpgrade} />
      </View>
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  image: {
    alignSelf: "center",
    height: 150,
    marginBottom: 16,
    width: 150,
  },
  locker: {
    lineHeight: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  ph16: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
})
