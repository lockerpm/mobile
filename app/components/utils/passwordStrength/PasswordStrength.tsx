import { useAppTheme } from "@/utils/useAppTheme"
import { Icon, IconTypes, Text } from "../../cores"
import { StyleProp, ViewStyle, View, StyleSheet, Dimensions } from "react-native"
import { Bar } from "react-native-progress"
import { useAppLocale } from "@/i18n"

export interface PasswordStrengthProps {
  style?: StyleProp<ViewStyle>
  value: number
  width?: number
  preset?: "progress" | "text"
}

const { width } = Dimensions.get("window")

/**
 * Describe your component here
 */
export const PasswordStrength = (props: PasswordStrengthProps) => {
  const { value, style, preset = "progress", width: propsWidth } = props
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  const config: {
    [name: string]: {
      text: string
      color: string
      icon?: IconTypes
    }
  } = {
    "-1": {
      text: "",
      color: colors.primary,
    },
    0: {
      text: translate("password_strength:very_weak"),
      color: colors.error,
      icon: "shield",
    },
    1: {
      text: translate("password_strength:weak"),
      color: colors.error,
      icon: "shield",
    },
    2: {
      text: translate("password_strength:medium"),
      color: colors.palette.gold6,
      icon: "shield-fill",
    },
    3: {
      text: translate("password_strength:good"),
      color: colors.primary,
      icon: "shield-check",
    },
    4: {
      text: translate("password_strength:strong"),
      color: colors.primary,
      icon: "shield-check-fill",
    },
  }

  return (
    <View style={[styles.container, style]}>
      {preset === "progress" && (
        <Bar
          height={8}
          width={propsWidth || width - 36}
          borderRadius={12}
          unfilledColor={colors.background}
          borderColor="transparent"
          color={config[value]?.color || colors.block}
          progress={(value + 1) / 5}
        />
      )}

      <View style={styles.content}>
        {config[value]?.icon && (
          <Icon icon={config[value]?.icon} size={14} color={config[value]?.color} />
        )}
        <Text
          preset="bold"
          size="sm"
          style={styles.text}
          color={config[value]?.color}
          text={config[value]?.text}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  content: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
  },
  text: {
    marginLeft: 5,
  },
})
