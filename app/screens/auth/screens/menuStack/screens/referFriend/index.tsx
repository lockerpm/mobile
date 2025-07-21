import { FC, useCallback, useEffect, useState } from "react"
import {
  View,
  Share,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StyleSheet,
  ViewStyle,
} from "react-native"
import { Button, Icon, PressableIcon, Text } from "app/components/cores"
import LinearGradient from "react-native-linear-gradient"
import { useClipboard, useToast } from "app/services/utils"
import { MenuScreenProps } from "app/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
import { Logger } from "@/utils/logger"
import { ThemedStyle } from "@/theme"
import { useStores } from "@/models"

const IS_IOS = Platform.OS === "ios"

const REFER = require("assets/images/intro/refer.png")

export const ReferFriendScreen: FC<MenuScreenProps<"referFriend">> = ({ navigation }) => {
  const { themed } = useAppTheme()
  const { user } = useStores()
  const { copyToClipboard } = useClipboard()
  const { translate } = useAppLocale()
  const { notifyApiError } = useToast()

  const [referLink, setReferLink] = useState<string>("")
  const [isSharing, setIsSharing] = useState(false)

  const gradientColor = IS_IOS
    ? ["#F1F2F3", "#D5EBD920", "#26833460"]
    : ["#FFFFFF", "#D5EBD920", "#26833460"]

  // -------------------METHODS-----------------------
  const onShare = async () => {
    setIsSharing(true)
    try {
      const result = await Share.share({
        message: translate("refer_friend:refer_header") + referLink,
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Logger.error("ReferFriendScreen", "onShare", error)
    }
    setIsSharing(false)
  }

  const getReferralsLink = useCallback(async () => {
    const res = await user.getReferLink()
    if (res.kind === "ok") {
      setReferLink(res.data.referral_link)
    } else {
      notifyApiError(res)
    }
  }, [])

  // -------------------EFFECT-----------------------

  useEffect(() => {
    if (!user.onPremiseUser) {
      getReferralsLink()
    }
  }, [])

  // ----------------------- RENDER -----------------------
  return (
    <SafeAreaView style={themed($container)}>
      <LinearGradient colors={gradientColor} style={styles.gradient}>
        <PressableIcon
          icon={"x"}
          size={24}
          containerStyle={styles.icon}
          onPress={navigation.goBack}
        />
        <Image resizeMode="contain" source={REFER} style={styles.image} />
      </LinearGradient>
      <View style={styles.mh16}>
        <Text preset="bold" size="xl" style={styles.mt32} tx={"refer_friend:title"} />

        <Text style={styles.mv16} tx={"refer_friend:desc"} />

        <TouchableOpacity
          onPress={() => copyToClipboard(translate("refer_friend:refer_header") + referLink)}
          style={themed($refer)}
        >
          <Icon icon="link" size={18} />
          <Text text={referLink ?? "Placeholder.."} size="sm" style={styles.ml8} />
        </TouchableOpacity>
      </View>

      <Button
        loading={isSharing}
        disabled={isSharing}
        style={styles.btn}
        tx={"refer_friend:btn"}
        onPress={onShare}
      />
    </SafeAreaView>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.block,
  paddingHorizontal: 0,
  flex: 1,
})

const $refer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.disable,
  borderRadius: 8,
  borderWidth: 1,
  padding: 12,
  flexDirection: "row",
  alignItems: "center",
})

const styles = StyleSheet.create({
  btn: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  gradient: {
    alignItems: "center",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    height: "40%",
    justifyContent: "center",
  },
  icon: {
    alignSelf: "flex-end",
    left: 16,
    position: "absolute",
    top: 0,
    zIndex: 2,
  },
  image: {
    height: 200,
    marginTop: 20,
    width: 200,
  },
  mh16: {
    marginHorizontal: 16,
  },
  ml8: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 8,
  },
  mt32: {
    marginTop: 32,
  },
  mv16: {
    marginVertical: 16,
  },
})
