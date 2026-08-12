/* eslint-disable react-native/no-inline-styles */
import { Dimensions, Platform, StyleSheet, View } from "react-native"
import { BaseToast, BaseToastProps } from "react-native-toast-message"

import { useAppTheme } from "@/utils/useAppTheme"

import { Icon, IconTypes } from "../icon/Icon"

type ToastProps = BaseToastProps & {
  icon: IconTypes
  iconColor: string
}

const Toast = ({ icon, iconColor, ...props }: ToastProps) => {
  const {
    theme: { colors },
  } = useAppTheme()

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
        color: colors.background,
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
  const {
    theme: { colors },
  } = useAppTheme()
  return <Toast {...props} icon={"info"} iconColor={colors.background} />
}

export const SuccessToast = (props: BaseToastProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return <Toast {...props} icon={"check-circle"} iconColor={colors.primary} />
}

export const ErrorToast = (props: BaseToastProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return <Toast {...props} icon={"x-circle"} iconColor={colors.error} />
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 0,
    borderRadius: 12,
    marginTop: Platform.OS === "android" ? 32 : 0,
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
