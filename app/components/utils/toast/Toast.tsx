import React from "react"
import { Dimensions, View } from "react-native"
import { BaseToast, BaseToastProps } from "react-native-toast-message"
import { useTheme } from "app/services/context"
import { Icon } from "../../cores"

export const InfoToast = (props: BaseToastProps) => {
  const { colors } = useTheme()

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
      text2Style={{
        color: colors.white,
        fontSize: 14,
      }}
      text2NumberOfLines={0}
      contentContainerStyle={{
        paddingLeft: 10,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            marginLeft: 15,
          }}
        >
          <Icon icon="info" size={22} color={colors.white} />
        </View>
      )}
    />
  )
}

export const SuccessToast = (props: BaseToastProps) => {
  const { colors } = useTheme()

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
      text2Style={{
        color: colors.white,
        fontSize: 14,
      }}
      text2NumberOfLines={0}
      contentContainerStyle={{
        paddingLeft: 10,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            marginLeft: 15,
          }}
        >
          <Icon icon="check-circle" size={22} color={colors.primary} />
        </View>
      )}
    />
  )
}

export const ErrorToast = (props: BaseToastProps) => {
  const { colors } = useTheme()

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
      text2Style={{
        color: colors.white,
        fontSize: 14,
      }}
      text2NumberOfLines={0}
      contentContainerStyle={{
        paddingLeft: 10,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            height: "100%",
            justifyContent: "center",
            marginLeft: 15,
          }}
        >
          <Icon icon="x-circle" size={22} color={colors.error} />
        </View>
      )}
    />
  )
}
