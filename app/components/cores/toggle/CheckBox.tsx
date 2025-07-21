import { useEffect, useRef, useCallback } from "react"
import { ImageStyle, Animated, StyleProp, View, ViewStyle } from "react-native"
import { Icon, IconTypes } from "../icon/Icon"
import { $inputOuterBase, BaseToggleInputProps, ToggleProps, Toggle } from "./Toggle"
import { useAppTheme } from "@/utils/useAppTheme"
import { colorTransparency } from "@/theme"

export interface CheckboxToggleProps extends Omit<ToggleProps<CheckboxInputProps>, "ToggleInput"> {
  /**
   * Optional style prop that affects the Image component.
   */
  inputDetailStyle?: ImageStyle
  /**
   * Checkbox-only prop that changes the icon used for the "on" state.
   */
  icon?: IconTypes
}

interface CheckboxInputProps extends BaseToggleInputProps<CheckboxToggleProps> {
  icon?: CheckboxToggleProps["icon"]
}
/**
 * @param {CheckboxToggleProps} props - The props for the `Checkbox` component.
 * @returns {JSX.Element} The rendered `Checkbox` component.
 */
export function Checkbox(props: CheckboxToggleProps) {
  const { icon, ...rest } = props
  const checkboxInput = useCallback(
    (toggleProps: CheckboxInputProps) => <CheckboxInput {...toggleProps} icon={icon} />,
    [icon]
  )
  return <Toggle accessibilityRole="checkbox" {...rest} ToggleInput={checkboxInput} />
}

function CheckboxInput(props: CheckboxInputProps) {
  const {
    on,
    disabled,
    icon = "check",
    outerStyle: $outerStyleOverride,
    innerStyle: $innerStyleOverride,
    detailStyle: $detailStyleOverride,
  } = props

  const {
    theme: { colors },
  } = useAppTheme()

  const opacity = useRef(new Animated.Value(0))

  useEffect(() => {
    if (on) {
      Animated.timing(opacity.current, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      opacity.current.setValue(0)
    }
  }, [on])

  const offBackgroundColor = [disabled && colors.background, colors.border].filter(
    Boolean
  )[0] as string

  const outerBorderColor = [
    disabled && colors.disable,
    !on && colors.border,
    colorTransparency(colors.success, 80),
  ].filter(Boolean)[0] as string

  const onBackgroundColor = [disabled && colors.transparent, colors.primary].filter(
    Boolean
  )[0] as string

  const iconTintColor = [disabled && colors.disable, colors.white].filter(Boolean)[0] as string

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
        <Icon
          icon={icon}
          size={18}
          style={[!!iconTintColor && { tintColor: iconTintColor }, $detailStyleOverride]}
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
  borderRadius: 6,
}

const $inputOuter: StyleProp<ViewStyle> = [$inputOuterBase, { borderRadius: 8, overflow: "hidden" }]
