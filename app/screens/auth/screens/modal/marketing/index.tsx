import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Icon } from "app/components/cores"
import { useStores } from "app/models"
import { AuthScreenProps } from "app/navigators/navigators.types"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useRef } from "react"
import {
  Dimensions,
  Image,
  Linking,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native"

export const MarketingScreen: FC<AuthScreenProps<"marketingModal">> = observer(
  ({
    navigation,
    route: {
      params: { data },
    },
  }) => {
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { uiStore } = useStores()
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
      <View style={themed($container)}>
        <TouchableWithoutFeedback
          onPress={() => {
            Linking.canOpenURL(data.link).then((val) => {
              if (val) Linking.openURL(data.link)
            })
            goBack()
          }}
        >
          <Image
            source={{ uri: data.image }}
            style={{
              height,
              width: width - 40,
            }}
            resizeMode="contain"
          />
        </TouchableWithoutFeedback>

        <TouchableOpacity style={$close} onPress={goBack}>
          <Icon icon="x" size={30} color={colors.white} />
        </TouchableOpacity>
      </View>
    )
  }
)

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.transparentModal,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
})

const $close: ViewStyle = {
  position: "absolute",
  top: "10%",
  right: 0,
  padding: 20,
}
