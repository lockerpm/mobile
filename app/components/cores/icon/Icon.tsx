import {
  ColorValue,
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"

export type IconTypes = keyof typeof iconRegistry

type BaseIconProps = {
  /**
   * The name of the icon
   */
  icon: IconTypes

  /**
   * An optional tint color for the icon
   */
  color?: ColorValue

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: number

  /**
   * Style overrides for the icon image
   */
  style?: StyleProp<ImageStyle>

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>
}

type PressableIconProps = Omit<TouchableOpacityProps, "style"> & BaseIconProps
type IconProps = Omit<ViewProps, "style"> & BaseIconProps

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity />
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Icon/}
 * @param {PressableIconProps} props - The props for the `PressableIcon` component.
 * @returns {JSX.Element} The rendered `PressableIcon` component.
 */
export function PressableIcon(props: PressableIconProps) {
  const {
    icon,
    color,
    size = 24, // Default size if not provided
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...pressableProps
  } = props

  const { theme } = useAppTheme()

  const $imageStyle: StyleProp<ImageStyle> = [
    $imageStyleBase,
    { tintColor: color ?? theme.colors.text, width: size, height: size },
    $imageStyleOverride,
  ]

  return (
    <TouchableOpacity {...pressableProps} style={$containerStyleOverride}>
      <Image style={$imageStyle} source={iconRegistry[icon]} />
    </TouchableOpacity>
  )
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <View />, use `PressableIcon` if you want to react to input
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Icon/}
 * @param {IconProps} props - The props for the `Icon` component.
 * @returns {JSX.Element} The rendered `Icon` component.
 */
export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size = 24, // Default size if not provided
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...viewProps
  } = props

  const { theme } = useAppTheme()

  const $imageStyle: StyleProp<ImageStyle> = [
    $imageStyleBase,
    { tintColor: color ?? theme.colors.text, width: size, height: size },
    $imageStyleOverride,
  ]

  return (
    <View {...viewProps} style={$containerStyleOverride}>
      <Image style={$imageStyle} source={iconRegistry[icon]} />
    </View>
  )
}

export const iconRegistry = {
  "arrow-left": require("assets/icons/arrow-left.png"),
  "arrow-right": require("assets/icons/arrow-right.png"),
  "caret-left": require("assets/icons/caret-left.png"),
  "caret-right": require("assets/icons/caret-right.png"),
  check: require("assets/icons/check.png"),
  "x-circle": require("assets/icons/x-circle.png"),
  bug: require("assets/icons/bug.png"),
  shield: require("assets/icons/shield.png"),
  "shield-check": require("assets/icons/shield-check.png"),
  "arrow-left-fill": require("assets/icons/arrow-left-fill.png"),
  "arrow-right-fill": require("assets/icons/arrow-right-fill.png"),
  "caret-left-fill": require("assets/icons/caret-left-fill.png"),
  "caret-right-fill": require("assets/icons/caret-right-fill.png"),
  "check-fill": require("assets/icons/check-fill.png"),
  "x-circle-fill": require("assets/icons/x-circle-fill.png"),
  "bug-fill": require("assets/icons/bug-fill.png"),
  "shield-fill": require("assets/icons/shield-fill.png"),
  "shield-check-fill": require("assets/icons/shield-check-fill.png"),
  "info-fill": require("assets/icons/info-fill.png"),
  "at-fill": require("assets/icons/at-fill.png"),
  "mailbox-fill": require("assets/icons/mailbox-fill.png"),
  "password-fill": require("assets/icons/password-fill.png"),
  "eye-slash": require("assets/icons/eye-slash.png"),
  eye: require("assets/icons/eye.png"),
  dot: require("assets/icons/dot.png"),
  "magnifying-glass": require("assets/icons/magnifying-glass.png"),
  "envelope-simple": require("assets/icons/envelope-simple.png"),
  "device-mobile": require("assets/icons/device-mobile.png"),
  "face-id": require("assets/icons/face-id.png"),
  fingerprint: require("assets/icons/fingerprint.png"),
  info: require("assets/icons/info.png"),
  "check-circle": require("assets/icons/check-circle.png"),
  authenticator: require("assets/icons/authenticator.png"),
  browser: require("assets/icons/browser.png"),
  home: require("assets/icons/home.png"),
  menu: require("assets/icons/menu.png"),
  tools: require("assets/icons/tools.png"),
  "arrows-clockwise": require("assets/icons/arrows-clockwise.png"),
  "wifi-slash": require("assets/icons/wifi-slash.png"),
  "caret-down": require("assets/icons/caret-down.png"),
  "caret-up": require("assets/icons/caret-up.png"),
  "dots-three": require("assets/icons/dots-three.png"),

  copy: require("assets/icons/copy.png"),
  edit: require("assets/icons/edit.png"),
  "file-text": require("assets/icons/file-text.png"),
  gear: require("assets/icons/gear.png"),
  trash: require("assets/icons/trash.png"),
  x: require("assets/icons/x.png"),

  "check-bold": require("assets/icons/check-bold.png"),
  "folder-simple": require("assets/icons/folder-simple.png"),
  plus: require("assets/icons/plus.png"),
  share: require("assets/icons/share.png"),
  "sliders-horizontal": require("assets/icons/sliders-horizontal.png"),
  bell: require("assets/icons/bell.png"),
  "users-three": require("assets/icons/users-three.png"),
  keyboard: require("assets/icons/keyboard.png"),
  "user-plus": require("assets/icons/user-plus.png"),
  "user-minus": require("assets/icons/user-minus.png"),
  star: require("assets/icons/star.png"),
  question: require("assets/icons/question.png"),
  "lock-key": require("assets/icons/lock-key.png"),
  "sign-out": require("assets/icons/sign-out.png"),
  invite: require("assets/icons/invite.png"),
  headset: require("assets/icons/headset.png"),
  user: require("assets/icons/user.png"),
  link: require("assets/icons/link.png"),
  warning: require("assets/icons/warning.png"),
  "file-arrow-up": require("assets/icons/file-arrow-up.png"),
  repeat: require("assets/icons/repeat.png"),
  "plus-circle": require("assets/icons/plus-circle.png"),
  "minus-circle": require("assets/icons/minus-circle.png"),

  "list-bullets": require("assets/icons/list-bullets.png"),
  "external-link": require("assets/icons/external-link.png"),
  "qr-code": require("assets/icons/qr-code.png"),
  "clock-clockwise": require("assets/icons/clock-clockwise.png"),
  "arrow-clockwise": require("assets/icons/arrow-clockwise.png"),
  "dots-three-vertical": require("assets/icons/dots-three-vertical.png"),
  "zap-fast": require("assets/icons/zap-fast.png"),
  "mail-03": require("assets/icons/mail-03.png"),
  image: require("assets/icons/image.png"),
  "download-simple": require("assets/icons/download-simple.png"),
}

const $imageStyleBase: ImageStyle = {
  resizeMode: "contain",
}
