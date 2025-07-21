import { View, Image, Dimensions, FlatList, StyleSheet } from "react-native"
import { Text } from "app/components/cores"
import { memo } from "react"
import { TxKeyPath } from "@/i18n"

const SCREEN_WIDTH = Dimensions.get("screen").width

export const PREMIUM_FEATURES_IMG = {
  locker: require("assets/images/intro/locker.png"),
  emergencyContact: require("assets/images/intro/emergency-contact.png"),
  web: require("assets/images/intro/web.png"),
  sharePassword: require("assets/images/intro/share-password.png"),
}

const tabs: { img: any; desc: TxKeyPath }[] = [
  {
    img: PREMIUM_FEATURES_IMG.locker,
    desc: "payment:benefit.locker",
  },
  {
    img: PREMIUM_FEATURES_IMG.web,
    desc: "payment:benefit.web",
  },
  {
    img: PREMIUM_FEATURES_IMG.emergencyContact,
    desc: "payment:benefit.emergency_contact",
  },
  {
    img: PREMIUM_FEATURES_IMG.sharePassword,
    desc: "payment:benefit.share_password",
  },
]

export const PremiumBenefits = memo(() => {
  return (
    <FlatList
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      snapToAlignment="center"
      snapToInterval={SCREEN_WIDTH}
      keyExtractor={(item) => item.desc}
      bounces={false}
      data={tabs}
      contentContainerStyle={styles.contentContainer}
      renderItem={({ item }) => (
        <View style={styles.container}>
          <Image source={item.img} style={styles.image} resizeMode="contain" />
          <Text tx={item.desc} style={styles.text} />
        </View>
      )}
    />
  )
})
PremiumBenefits.displayName = "PremiumBenefits"

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: 5,
    width: SCREEN_WIDTH,
  },
  contentContainer: {
    height: "40%",
  },
  image: {
    maxHeight: "60%",
  },
  text: {
    lineHeight: 24,
    maxWidth: "90%",
    textAlign: "center",
  },
})
