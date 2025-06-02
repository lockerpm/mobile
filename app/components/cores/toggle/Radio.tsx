import React, { useEffect, useRef } from "react"
import { StyleProp, View, ViewStyle, Animated } from "react-native"
import { $inputOuterBase, BaseToggleInputProps, ToggleProps, Toggle } from "./Toggle2"
import { useTheme } from "app/services/context"

export interface RadioToggleProps extends Omit<ToggleProps<RadioInputProps>, "ToggleInput"> {
  /**
   * Optional style prop that affects the dot View.
   */
  inputDetailStyle?: ViewStyle
}

interface RadioInputProps extends BaseToggleInputProps<RadioToggleProps> {}

/**
 * @param {RadioToggleProps} props - The props for the `Radio` component.
 * @returns {JSX.Element} The rendered `Radio` component.
 */
export function Radio(props: RadioToggleProps) {
  return <Toggle accessibilityRole="radio" {...props} ToggleInput={RadioInput} />
}

function RadioInput(props: RadioInputProps) {
  const {
    on,
    disabled,
    outerStyle: $outerStyleOverride,
    innerStyle: $innerStyleOverride,
    detailStyle: $detailStyleOverride,
  } = props

  const { colors } = useTheme()

  const opacity = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: on ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [on])

  const offBackgroundColor = [disabled && colors.block, colors.divider].filter(Boolean)[0] as string

  const outerBorderColor = [
    disabled && colors.disable,
    !on && colors.border,
    colors.success,
  ].filter(Boolean)[0] as string

  const onBackgroundColor = [disabled && colors.transparent, colors.divider].filter(
    Boolean,
  )[0] as string

  const dotBackgroundColor = [disabled && colors.disable, colors.success].filter(
    Boolean,
  )[0] as string

  return (
    <View
      style={[
        $inputOuter,
        { backgroundColor: offBackgroundColor, borderColor: outerBorderColor },
        $outerStyleOverride,
      ]}
    >
      <Animated.View
        style={[
          $toggleInner,
          { backgroundColor: onBackgroundColor },
          $innerStyleOverride,
          { opacity: opacity.current },
        ]}
      >
        <View
          style={[$radioDetail, { backgroundColor: dotBackgroundColor }, $detailStyleOverride]}
        />
      </Animated.View>
    </View>
  )
}

const $toggleInner: ViewStyle = {
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}

const $radioDetail: ViewStyle = {
  width: 12,
  height: 12,
  borderRadius: 6,
}

const $inputOuter: StyleProp<ViewStyle> = [$inputOuterBase, { borderRadius: 12 }]
