import { useCallback, useEffect, useRef, useState } from "react"
import { View, Dimensions, ViewStyle, AppState } from "react-native"
import { observer } from "mobx-react-lite"
import Animated, {
  LinearTransition,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated"

import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { getDeviceAuthCapabilities } from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { isDeviceAutofillServiceEnabled } from "@/utils/autofill.android"
import { autofillKeyChain } from "@/utils/autofill.ios"
import { useAppTheme } from "@/utils/useAppTheme"

import { ConfirmYourSharing } from "./ConfirmYourSharing"
import { SuggestEnableAutofill } from "./SuggestEnableAutofill"
import { SuggestEnableFaceID } from "./SuggestEnableFaceID"
import { useLoadConfirmShare } from "./useLoadConfirmShare"

enum SliderEnum {
  ConfirmShare = "ConfirmShare",
  SuggestEnableFaceID = "SuggestEnableFaceID",
  SuggestEnableAutofill = "SuggestEnableAutofill",
}

type SliderDataType = {
  id: SliderEnum
  isShow: boolean
  onClose: () => void
  hasBiometric?: boolean
}
const WIDTH = Dimensions.get("window").width

export const HomeSlider = observer(() => {
  const { user } = useStores()
  const { themed } = useAppTheme()
  const { lang } = useAppLocale()
  const { cryptoService } = useCoreService()
  // -------------- PARAMS ------------------

  const scrollRef = useRef(null)
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  const [data, setData] = useState<SliderDataType[]>([])

  const { confirmShareCount } = useLoadConfirmShare()

  const isShowData = data.filter((item) => item.isShow)

  // -------------- PARAMS ------------------

  const closeFaceid = useCallback(() => {
    setData((prev) =>
      prev.map((item) =>
        item.id === SliderEnum.SuggestEnableFaceID ? { ...item, isShow: false } : item
      )
    )
  }, [])

  const closeAutofill = useCallback(() => {
    setData((prev) =>
      prev.map((item) =>
        item.id === SliderEnum.SuggestEnableAutofill ? { ...item, isShow: false } : item
      )
    )
  }, [])

  const closeConfirmShare = useCallback(() => {
    setData((prev) =>
      prev.map((item) => (item.id === SliderEnum.ConfirmShare ? { ...item, isShow: false } : item))
    )
  }, [])

  const animIndex = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((event) => {
    animIndex.value = event.contentOffset.x / WIDTH
  }, [])

  const handleShowFaceIDSuggest = async () => {
    if (user.isBiometricUnlock) return
    const { hasBiometric, hasDevicePasscode } = await getDeviceAuthCapabilities()
    if (!hasBiometric && !hasDevicePasscode) return
    setData((prev) => [
      ...prev,
      {
        id: SliderEnum.SuggestEnableFaceID,
        isShow: true,
        onClose: closeFaceid,
        hasBiometric,
      },
    ])
  }

  const syncAutofillUserInfo = async () => {
    const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()

    await autofillKeyChain.saveUserInfo({
      email: user.email || "",
      avatar: user.avatar || "",
      hashPass: hashPasswordAutofill || "",
      token: user.apiToken || "",
      language: lang || "en",

      faceIdEnabled: user.isBiometricUnlock,
      isFree: user.isFreePlan,
    })
  }

  useEffect(() => {
    if (confirmShareCount > 0) {
      setData((prev) => [
        {
          id: SliderEnum.ConfirmShare,
          isShow: true,
          onClose: closeConfirmShare,
        },
        ...prev,
      ])
    } else {
      closeConfirmShare()
    }
  }, [confirmShareCount, closeConfirmShare])

  useEffect(() => {
    isDeviceAutofillServiceEnabled().then((isActived) => {
      if (!isActived) {
        setData((prev) => [
          ...prev.filter((item) => item.id !== SliderEnum.SuggestEnableAutofill),
          {
            id: SliderEnum.SuggestEnableAutofill,
            isShow: true,
            onClose: closeAutofill,
          },
        ])
      }
      if (isActived) {
        closeAutofill()
      }
    })
  }, [appStateVisible])

  useEffect(() => {
    syncAutofillUserInfo()
    handleShowFaceIDSuggest()

    AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
  }, [])

  return (
    <View>
      <Animated.FlatList
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={WIDTH}
        data={isShowData}
        bounces={false}
        alwaysBounceHorizontal={false}
        decelerationRate="fast"
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        itemLayoutAnimation={LinearTransition}
        onScroll={scrollHandler}
        renderItem={({ item }) => {
          switch (item.id) {
            case SliderEnum.SuggestEnableFaceID:
              return (
                <SuggestEnableFaceID
                  style={themed($itemContainer)}
                  onClose={item.onClose}
                  hasBiometric={item.hasBiometric ?? false}
                />
              )
            case SliderEnum.SuggestEnableAutofill:
              return <SuggestEnableAutofill style={themed($itemContainer)} onClose={item.onClose} />
            case SliderEnum.ConfirmShare:
              return <ConfirmYourSharing style={themed($itemContainer)} onClose={item.onClose} />
            default:
              return null
          }
        }}
      />
    </View>
  )
})

const $itemContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: WIDTH - 32,
  backgroundColor: colors.palette.orange3,
  borderColor: colors.palette.orange8,
  borderRadius: 12,
  borderWidth: 1,
  flexDirection: "row",
  marginHorizontal: 16,
  marginTop: 12,
  paddingHorizontal: 12,
  paddingVertical: 12,
})
