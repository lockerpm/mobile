import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle, ViewProps } from "react-native"
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated"
import { bin } from "react-native-redash"
import { typography } from "app/theme"

import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { TextProps } from "@/components/cores"

interface Props extends ViewProps {
  editable?: boolean
  haveValue: boolean
  /**
   * Title
   */
  label?: TextProps["text"]
  /**
   * Title tx
   */
  labelTx?: TextProps["tx"]
  /**
   * Title txoptions
   */
  labelTxOption?: TextProps["txOptions"]
  /**
   * Pass any additional props directly to the label Text component.
   */
  LabelTextProps?: TextProps
  /**
   * Optional input style override.
   */
  style?: StyleProp<TextStyle>
  /**
   * Style overrides for the container
   */
  containerStyle?: StyleProp<ViewStyle>
  children?: JSX.Element | JSX.Element[]
  onPress: () => void
}

/**
 * A component that allows for the entering and editing of text.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-TextField.md)
 */
export const CipherEditActionField = (props: Props) => {
  const {
    editable,
    label,
    labelTx,
    labelTxOption,
    LabelTextProps,
    haveValue,
    containerStyle: $containerStyleOverride,
    onPress,
    ...viewProps
  } = props
  const { translate } = useAppLocale()
  const {
    theme: { colors },
  } = useAppTheme()

  // -------------------- PARAMS --------------------

  // -------------------- COMPUTED --------------------

  const labelProps = label || (labelTx && translate(labelTx, labelTxOption))

  const $containerStyles: StyleProp<ViewStyle> = [
    { width: "100%", alignItems: "flex-start", marginVertical: 2 },
    $containerStyleOverride,
  ]
  const $labelStyles: StyleProp<TextStyle> = [
    {
      fontSize: 16,
      fontFamily: typography.primary.medium,
      marginBottom: 4,
    },
    LabelTextProps?.style,
  ]

  const $inputWrapperStyles = [
    $inputWrapperStyle,
    {
      borderColor: colors.border,
    },
  ]

  const toggleStyle = useDerivedValue(() => {
    return withTiming(bin(haveValue))
  }, [])

  const $titleAnim = useAnimatedStyle(() => {
    return {
      zIndex: 2,
      backgroundColor: colors.background,
      paddingHorizontal: 4,
      transform: [
        {
          scale: interpolate(toggleStyle.value, [0, 1], [1, 0.9]),
        },
        {
          translateX: interpolate(toggleStyle.value, [0, 1], [12, 0]),
        },
        {
          translateY: interpolate(toggleStyle.value, [0, 1], [39, 14]),
        },
      ],
      color: interpolateColor(toggleStyle.value, [0, 1], [colors.disable, colors.text]),
    }
  })

  return (
    <TouchableOpacity disabled={editable} style={$containerStyles} onPress={onPress}>
      {!!labelProps && (
        <Animated.Text style={[$labelStyles, $titleAnim]} {...LabelTextProps}>
          {labelProps}
        </Animated.Text>
      )}

      <View style={$inputWrapperStyles}>
        <View {...viewProps} />
      </View>
    </TouchableOpacity>
  )
}

const $inputWrapperStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  borderWidth: 1,
  borderRadius: 8,
  overflow: "hidden",
}
