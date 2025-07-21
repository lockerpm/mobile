import { Image, StyleSheet } from "react-native"
import { Text, Button, BottomModalContainer } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"
import { AuthScreenProps } from "app/navigators"
import { delay } from "@/utils/delay"

const SHARE = require("assets/images/intro/share-password.png")
const LIMIT = require("assets/images/intro/locker.png")

type Props = {
  isShare: boolean
}

export const PremiumAction = ({ isShare }: Props) => {
  const navigation = useNavigation<AuthScreenProps<"cipherActionsModal">["navigation"]>()

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
    <BottomModalContainer style={styles.container}>
      <Text
        preset="bold"
        tx={isShare ? "payment:premium.header" : "error:limit_storage"}
        style={styles.header}
      />
      <Image resizeMode="contain" source={isShare ? SHARE : LIMIT} style={styles.image} />
      <Text
        preset="label"
        size="sm"
        tx={isShare ? "payment:benefit.share_password" : "payment:benefit.locker"}
        style={styles.label}
      />

      <Button onPress={goToPayment} tx="common:upgrade_now" />
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
