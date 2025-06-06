import { useNavigation } from "@react-navigation/native"
import { TabsScreenProps } from "app/navigators"
import { useAppLocale } from "app/services/context"
import { useAuthentication } from "app/services/hook"
import { LockType } from "app/static/types"
import { useEffect } from "react"
import { Alert } from "react-native"

/**
 * Custom hook to handle back navigation in the home tab.
 */
export const useHomeBackHandler = () => {
  const navigation = useNavigation<TabsScreenProps<"homeTab">["navigation"]>()
  const { translate } = useAppLocale()
  const { lock } = useAuthentication()

  // ------------------------ EFFECT ----------------------------
  // Handle back navigation to lock the app
  useEffect(() => {
    const handleBack = (e: any) => {
      if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()

      Alert.alert(translate("alert.lock_app"), "", [
        {
          text: translate("common.cancel"),
          style: "cancel",
          onPress: () => null,
        },
        {
          text: translate("common.lock"),
          style: "destructive",
          onPress: async () => {
            await lock()
            navigation.navigate("lock", {
              type: LockType.Individual,
            })
          },
        },
      ])
    }

    const unsubscribe = navigation.addListener("beforeRemove", handleBack)

    return () => {
      unsubscribe()
    }
  }, [navigation])
}
