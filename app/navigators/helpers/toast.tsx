import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Dimensions, View } from "react-native"
import { fontSize } from "../../theme"
import { BaseToast, BaseToastProps } from 'react-native-toast-message'
import { useMixins } from '../../services/mixins'


export const InfoToast = (props: BaseToastProps) => {
  const { color } = useMixins()

  return (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 0,
        borderRadius: 8,
        height: undefined,
        width: Dimensions.get("screen").width - 40,
        backgroundColor: color.toastBackground,
        paddingVertical: 10,
      }}
      text2Style={{
        color:  color.white,
        fontSize: fontSize.small
      }}
      text2NumberOfLines={0}
      contentContainerStyle={{
        paddingLeft: 10
      }}
      renderLeadingIcon={() => (
        <View style={{
          height: '100%',
          justifyContent: 'center',
          marginLeft: 15
        }}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={color.white}
          />
        </View>
      )}
    />
  )
}

export const SuccessToast = (props: BaseToastProps) => {
  const { color, isDark } = useMixins()

  return (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 0,
        borderRadius: 8,
        height: undefined,
        width: Dimensions.get("screen").width - 40,
        backgroundColor: color.toastBackground,
        paddingVertical: 10,
      }}
      text2Style={{
        color: isDark? color.primary : color.white,
        fontSize: fontSize.small
      }}
      text2NumberOfLines={0}
      contentContainerStyle={{
        paddingLeft: 10
      }}
      renderLeadingIcon={() => (
        <View style={{
          height: '100%',
          justifyContent: 'center',
          marginLeft: 15
        }}>
          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color={color.primary}
          />
        </View>
      )}
    />
  )
}

export const ErrorToast = (props: BaseToastProps) => {
  const { color, isDark } = useMixins()

  return (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 0,
        borderRadius: 8,
        height: undefined,
        width: Dimensions.get("screen").width - 40,
        backgroundColor: color.toastBackground,
        paddingVertical: 10,
      }}
      text2Style={{
        color: isDark? color.error : color.white,
        fontSize: fontSize.small
      }}
      text2NumberOfLines={0}
      contentContainerStyle={{
        paddingLeft: 10
      }}
      renderLeadingIcon={() => (
        <View style={{
          height: '100%',
          justifyContent: 'center',
          marginLeft: 15
        }}>
          <Ionicons
            name="close-circle-outline"
            size={22}
            color={color.error}
          />
        </View>
      )}
    />
  )
}