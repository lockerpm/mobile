import React, { useEffect, useRef, useState } from "react"
import { View, FlatList, Dimensions, ViewStyle, AppState } from "react-native"
import { SuggestEnableFaceID } from "./SuggestEnableFaceID"
import { FirstImport } from "./FirstImport"
import { SuggestEnableAutofill } from "./SuggestEnableAutofill"
import { ThemedColors } from "app/theme"
import { useTheme } from "app/services/context"
import Animated, { LinearTransition } from "react-native-reanimated"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { iosKeyChain } from "app/utils/iosAutofillData"
import { AutofillServiceEnabled } from "app/utils/autofillHelper"

enum SliderEnum {
  SuggestEnableFaceID = "SuggestEnableFaceID",
  SuggestEnableAutofill = "SuggestEnableAutofill",
  FirstImport = "FirstImport",
}

type SliderDataType = {
  id: string
  type: SliderEnum
  isShow: boolean
  onClose: () => void
}

const WIDTH = Dimensions.get("window").width

export const HomeSlider = () => {
  const { user } = useStores()
  const { colors } = useTheme()
  const { cryptoService } = useCoreService()
  const { isBiometricAvailable } = useHelper()

  const styles = themedStyle(colors)
  // -------------- PARAMS ------------------
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  const [isAutofillEnabled, setIsAutofillEnabled] = useState(true)
  const [isShowAutofillSuggest, setShowAutofillSuggest] = useState(true)
  const [isShowFaceIDSuggest, setShowFaceIDSuggest] = useState(false)

  const [data, setData] = useState<SliderDataType[]>([
    {
      id: "SuggestEnableFaceID",
      type: SliderEnum.SuggestEnableFaceID,
      isShow: true,
      onClose: () => {
        setData((prev) =>
          prev.map((item) =>
            item.id === "SuggestEnableFaceID" ? { ...item, isShow: false } : item,
          ),
        )
      },
    },
    {
      id: "SuggestEnableAutofill",
      type: SliderEnum.SuggestEnableAutofill,
      isShow: true,
      onClose: () => {
        setData((prev) =>
          prev.map((item) =>
            item.id === "SuggestEnableAutofill" ? { ...item, isShow: false } : item,
          ),
        )
      },
    },
    {
      id: "FirstImport",
      type: SliderEnum.FirstImport,
      isShow: true,
      onClose: () => {
        setData((prev) =>
          prev.map((item) => (item.id === "FirstImport" ? { ...item, isShow: false } : item)),
        )
      },
    },
  ])

  const isShowData = data.filter((item) => item.isShow)

  // -------------- PARAMS ------------------
  const handleShowFaceIDSuggest = async () => {
    if (!user.isBiometricUnlock) {
      const available = await isBiometricAvailable()
      if (available) setShowFaceIDSuggest(true)
    }
  }

  const syncAutofillUserInfo = async () => {
    const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()
    await iosKeyChain.saveUserInfo({
      email: user.email || "",
      avatar: user.avatar || "",
      hashPass: hashPasswordAutofill || "",
      token: user.apiToken || "",
      language: user.language || "en",

      faceIdEnabled: user.isBiometricUnlock,
      isFree: user.isFreePlan,
    })
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
      setIsAutofillEnabled(isActived)
      if (androidNotSupport) {
        setShowAutofillSuggest(false)
      }
    })
  }, [appStateVisible])

  return (
    <View>
      <Animated.FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        data={isShowData}
        keyExtractor={(item) => item.id}
        itemLayoutAnimation={LinearTransition}
        renderItem={({ item }) => {
          switch (item.type) {
            case SliderEnum.SuggestEnableFaceID:
              return <SuggestEnableFaceID style={styles.itemContainer} onClose={item.onClose} />
            case SliderEnum.SuggestEnableAutofill:
              return <SuggestEnableAutofill style={styles.itemContainer} onClose={item.onClose} />
            case SliderEnum.FirstImport:
              return <FirstImport style={styles.itemContainer} onClose={item.onClose} />
            default:
              return null
          }
        }}
      />
    </View>
  )
}

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
