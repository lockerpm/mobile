import React, { useCallback, useEffect, useRef, useState } from "react"
import { View, Dimensions, ViewStyle, AppState } from "react-native"
import { SuggestEnableFaceID } from "./SuggestEnableFaceID"
import { SuggestEnableAutofill } from "./SuggestEnableAutofill"
import { ThemedColors } from "app/theme"
import { useTheme } from "app/services/context"
import Animated, {
  LinearTransition,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { autofillKeyChain } from "app/utils/autofillData"
import { AutofillServiceEnabled } from "app/utils/autofillHelper"
import { observer } from "mobx-react-lite"
import { useBiometricType } from "app/services/utils"

enum SliderEnum {
  SuggestEnableFaceID = "SuggestEnableFaceID",
  SuggestEnableAutofill = "SuggestEnableAutofill",
}

type SliderDataType = {
  id: string
  type: SliderEnum
  isShow: boolean
  onClose: () => void
}
const WIDTH = Dimensions.get("window").width

export const HomeSlider = observer(() => {
  const { user } = useStores()
  const { colors } = useTheme()
  const { cryptoService } = useCoreService()
  const { isBiometricAvailable } = useBiometricType()

  const styles = themedStyle(colors)
  // -------------- PARAMS ------------------

  const scrollRef = useRef(null)
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  const [data, setData] = useState<SliderDataType[]>([])

  const isShowData = data.filter((item) => item.isShow)

  // -------------- PARAMS ------------------

  const closeFaceid = useCallback(() => {
    setData((prev) =>
      prev.map((item) => (item.id === "SuggestEnableFaceID" ? { ...item, isShow: false } : item)),
    )
  }, [])

  const closeAutofill = useCallback(() => {
    setData((prev) =>
      prev.map((item) => (item.id === "SuggestEnableAutofill" ? { ...item, isShow: false } : item)),
    )
  }, [])

  const animIndex = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((event) => {
    animIndex.value = event.contentOffset.x / WIDTH
  }, [])

  const handleShowFaceIDSuggest = async () => {
    if (!user.isBiometricUnlock) {
      const available = await isBiometricAvailable()
      if (available) {
        setData((prev) => [
          ...prev,
          {
            id: "SuggestEnableFaceID",
            type: SliderEnum.SuggestEnableFaceID,
            isShow: true,
            onClose: closeFaceid,
          },
        ])
      }
    }
  }

  const syncAutofillUserInfo = async () => {
    if (!user.saveIosAutofillInfor) {
      const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()

      await autofillKeyChain.saveUserInfo({
        email: user.email || "",
        avatar: user.avatar || "",
        hashPass: hashPasswordAutofill || "",
        token: user.apiToken || "",
        language: user.language || "en",

        faceIdEnabled: user.isBiometricUnlock,
        isFree: user.isFreePlan,
      })
      user.setSaveIosAutofillInfor(true)
    }
  }

  useEffect(() => {
    syncAutofillUserInfo()
    handleShowFaceIDSuggest()

    AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
  }, [])

  useEffect(() => {
    AutofillServiceEnabled((isActived, androidNotSupport) => {
      if (!androidNotSupport && !isActived) {
        setData((prev) => [
          ...prev.filter((item) => item.id !== "SuggestEnableAutofill"),
          {
            id: "SuggestEnableAutofill",
            type: SliderEnum.SuggestEnableAutofill,
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
          switch (item.type) {
            case SliderEnum.SuggestEnableFaceID:
              return <SuggestEnableFaceID style={styles.itemContainer} onClose={item.onClose} />
            case SliderEnum.SuggestEnableAutofill:
              return <SuggestEnableAutofill style={styles.itemContainer} onClose={item.onClose} />
            default:
              return null
          }
        }}
      />
      {/* <AnimatedFooter animIndex={animIndex} length={data.length} /> */}
    </View>
  )
})

const themedStyle = (colors: ThemedColors) => ({
  itemContainer: {
    width: WIDTH - 32,
    backgroundColor: colors.palette.orange3,
    borderColor: colors.palette.orange8,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  } as ViewStyle,
})
