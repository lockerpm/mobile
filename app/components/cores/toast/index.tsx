import React from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import { BaseToast, BaseToastProps } from "react-native-toast-message"
import { useTheme } from "app/services/context"
import { Icon, IconTypes } from ".."

type ToastProps = BaseToastProps & {
  icon: IconTypes
  iconColor: string
}

const Toast = ({ icon, iconColor, ...props }: ToastProps) => {
  const { colors } = useTheme()

  return (
    <BaseToast
      {...props}
      style={[
        styles.container,
        {
          backgroundColor: colors.toastBackground,
        },
      ]}
      text2Style={{
        color: colors.white,
        fontSize: 14,
      }}
      text2NumberOfLines={0}
      contentContainerStyle={styles.contentContainerStyle}
      renderLeadingIcon={() => (
        <View style={styles.leadIcon}>
          <Icon icon={icon} size={22} color={iconColor} />
        </View>
      )}
    />
  )
}
export const InfoToast = (props: BaseToastProps) => {
  const { colors } = useTheme()
  return <Toast {...props} icon={"info"} iconColor={colors.white} />
}

export const SuccessToast = (props: BaseToastProps) => {
  const { colors } = useTheme()
  return <Toast {...props} icon={"check-circle"} iconColor={colors.primary} />
}

export const ErrorToast = (props: BaseToastProps) => {
  const { colors } = useTheme()
  return <Toast {...props} icon={"x-circle"} iconColor={colors.error} />
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 0,
    borderRadius: 8,
    paddingVertical: 10,
    width: Dimensions.get("screen").width - 40,
  },
  contentContainerStyle: {
    paddingLeft: 10,
  },
  leadIcon: {
    height: "100%",
    justifyContent: "center",
    marginLeft: 15,
  },
})
