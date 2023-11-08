import { useNavigation } from "@react-navigation/native"
import { Icon } from "app/components/cores"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef } from "react"
import {
  Dimensions,
  Image,
  Linking,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"

const IMAGE_VI = require("./vi.png")
const IMAGE_EN = require("./en.png")

export const MarketingScreen = observer(() => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { uiStore, user } = useStores()
  const { width, height } = Dimensions.get("screen")

  const isGoBack = useRef(false)

  const goBack = () => {
    if (!isGoBack.current) {
      isGoBack.current = true
      navigation.goBack()
    }
  }
  useEffect(() => {
    uiStore.setIsShowedPopupMarketing(true)
  }, [])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: colors.transparentModal,
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Linking.canOpenURL("https://locker.io/promo/cyber-month-2023").then((val) => {
            if (val) Linking.openURL("https://locker.io/promo/cyber-month-2023")
          })
          goBack()
        }}
      >
        <Image
          source={user.language === "en" ? IMAGE_EN : IMAGE_VI}
          style={{
            height,
            width,
          }}
          resizeMode="center"
        />
      </TouchableWithoutFeedback>

      <TouchableOpacity
        style={{
          position: "absolute",
          top: "15%",
          right: 0,
          padding: 20,
        }}
        onPress={goBack}
      >
        <Icon icon="x" size={30} color={colors.white} />
      </TouchableOpacity>
    </View>
  )
})
