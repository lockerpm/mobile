/* eslint-disable react-native/no-inline-styles */
import { Dimensions, View } from "react-native"
import { BaseToast, BaseToastProps } from "react-native-toast-message"

import { useAppTheme } from "@/utils/useAppTheme"

import { Logo } from "../lockerLogo/Logo"

/**
 * In-app push notification toast: Logo2 as the leading icon, the push title as
 * text1 (bold) and the body as text2. Press handling (e.g. logging title/body)
 * is passed via `onPress` when calling Toast.show.
 */
export const ForegroundToast = (props: BaseToastProps) => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 0,
        borderRadius: 8,
        height: undefined,
        width: Dimensions.get("screen").width - 40,
        backgroundColor: colors.toastBackground,
        paddingVertical: 10,
      }}
      text1Style={{
        color: colors.white,
        fontSize: 15,
        fontWeight: "600",
      }}
      text2Style={{
        color: colors.white,
        fontSize: 14,
      }}
      text1NumberOfLines={1}
      text2NumberOfLines={0}
      contentContainerStyle={{
        paddingLeft: 10,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            marginLeft: 16,
          }}
        >
          <Logo preset="default" style={{ width: 40, height: 40, marginTop: 0 }} />
        </View>
      )}
    />
  )
}
