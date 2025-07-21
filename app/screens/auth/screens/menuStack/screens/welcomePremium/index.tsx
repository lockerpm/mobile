import { FC } from "react"
import { View, Image, ColorValue, StyleSheet } from "react-native"
import { Screen, Text, Button, Icon } from "app/components/cores"
import { MenuScreenProps } from "app/navigators/navigators.types"
import { useAppTheme } from "@/utils/useAppTheme"
import { TxKeyPath } from "@/i18n"

const HIGH_FIVE = require("assets/images/welcomePremium/HighFive.png")
const PREMIUM = require("assets/images/welcomePremium/LockerPremium.png")

const backgroundSecondary: ColorValue = "#21632F"

export const WelcomePremiumScreen: FC<MenuScreenProps<"welcomePremium">> = ({ navigation }) => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      backgroundColor={colors.primary}
      footer={
        <Button
          preset="secondary"
          tx={"welcome_premium:btn"}
          onPress={() => {
            navigation.navigate("mainTab", {
              screen: "homeTab",
            })
          }}
          style={styles.mh16}
        />
      }
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <Image resizeMode="contain" source={PREMIUM} style={styles.premium} />
        <Image resizeMode="contain" source={HIGH_FIVE} style={styles.highFive} />

        <Text
          preset="bold"
          tx={"welcome_premium:title"}
          color={colors.white}
          size="xl"
          style={styles.title}
        />
        <Text tx={"welcome_premium:all_features"} color={colors.white} style={styles.allFeats} />

        <View style={styles.feats}>
          <UnlockFeature tx={"welcome_premium:features.unlimited"} />
          <UnlockFeature tx={"welcome_premium:features.share"} />
          <UnlockFeature tx={"welcome_premium:features.monitor"} />
          <UnlockFeature tx={"welcome_premium:features.emergency"} />

          <Text tx={"welcome_premium:features.more"} color={colors.white} />
        </View>
      </View>
    </Screen>
  )
}

const UnlockFeature = ({ tx }: { tx: TxKeyPath }) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <View style={styles.unlockFeatureContainer}>
      <Icon icon="check" color={colors.white} size={16} />
      <Text tx={tx} color={colors.white} style={styles.unlockFeatureText} />
    </View>
  )
}

const styles = StyleSheet.create({
  allFeats: {
    marginTop: 16,
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  feats: {
    backgroundColor: backgroundSecondary,
    borderRadius: 10,
    marginTop: 16,
    maxWidth: 650,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
  },
  highFive: {
    height: 163,
    marginTop: 24,
    width: 155,
  },
  mh16: {
    marginHorizontal: 16,
  },
  premium: {
    height: 32,
    width: 152,
  },
  title: {
    marginTop: 24,
    textAlign: "center",
  },
  unlockFeatureContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 4,
  },
  unlockFeatureText: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 8,
  },
})
