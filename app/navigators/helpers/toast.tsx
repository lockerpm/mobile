import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { View } from "react-native"
import { fontSize } from "../../theme"
import { BaseToast, BaseToastProps } from 'react-native-toast-message'
import { useMixins } from '../../services/mixins'


export const SuccessToast = (props: BaseToastProps) => {
  const { color, isDark } = useMixins()

  return (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: color.primary,
        backgroundColor: isDark ? color.block : color.background
      }}
      text2Style={{
        color: color.primary,
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
        borderLeftColor: color.error,
        backgroundColor: isDark ? color.block : color.background
      }}
      text2Style={{
        color: color.error,
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