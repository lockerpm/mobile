import * as React from 'react'
import { StyleProp, View, ViewStyle, ActivityIndicator } from 'react-native'
import { flatten } from 'ramda'
import { Text } from '../../cores'
import { useTheme } from 'app/services/context'

const CONTAINER: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
}

const OVERLAY_CONTAINER: ViewStyle = {
  flex: 1,
  position: 'absolute',
  height: '100%',
  width: '100%',
  top: 0,
  left: 0,
  zIndex: 1000,
  opacity: 0.8,
  justifyContent: 'center',
  alignItems: 'center',
}

export interface LoadingProps {
  style?: StyleProp<ViewStyle>
  message?: string
}

/**
 * Describe your component here
 */
export const Loading = function Loading(props: LoadingProps) {
  const { style, message } = props
  const { colors } = useTheme()

  const styles = flatten([CONTAINER, style])

  return (
    <View
      style={[
        styles,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {!!message && (
        <Text
          text={message}
          style={{
            marginTop: 10,
          }}
        />
      )}
    </View>
  )
}

export const OverlayLoading = function OverlayLoading(props: LoadingProps) {
  const { style } = props
  const { colors } = useTheme()
  const styles = flatten([OVERLAY_CONTAINER, style])

  return (
    <View
      style={[
        styles,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )
}
