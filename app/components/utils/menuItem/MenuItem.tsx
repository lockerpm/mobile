import { Children } from "react"
import { View, ViewProps, Image, StyleSheet, ViewStyle } from "react-native"

import { Icon, IconTypes, PressableScale, Text } from "app/components/cores"
import { TxKeyPath, useAppLocale } from "app/i18n"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

export type MenuItemProps = {
  /**
   * Icon name
   */
  icon: IconTypes
  /**
   * Custom image instead of icon
   */
  imageSource?: string
  name: string

  onPress?: () => void
  disabled?: boolean
  hide?: boolean
  family?: boolean
  content?: React.ReactNode
  rightIcon?: IconTypes
}

export const MenuItem = ({
  icon,
  imageSource,
  name,
  onPress,
  disabled,
  hide,
  family,
  content,
  rightIcon,
}: MenuItemProps) => {
  const {
    theme: { colors },
  } = useAppTheme()

  if (hide) return null

  return (
    <PressableScale disabled={disabled} onPress={onPress} style={styles.itemContainer}>
      {!imageSource ? (
        <Icon icon={icon} />
      ) : (
        <Image resizeMode="contain" source={{ uri: imageSource }} style={styles.itemImage} />
      )}

      <View style={styles.row}>
        {!content ? (
          <>
            <Text text={name} />
            {family && <Text text={"FAMILY"} color={colors.primary} style={styles.ml12} />}
          </>
        ) : (
          content
        )}
      </View>

      <Icon icon={rightIcon || "caret-right"} size={20} color={colors.label} />
    </PressableScale>
  )
}

interface ContainerProps extends ViewProps {
  title?: string
  titleTx?: TxKeyPath
  children?: React.ReactNode | React.ReactNode[]
}

export const MenuItemContainer = ({
  title,
  titleTx,
  children,
  style,
  ...viewProps
}: ContainerProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
  const titleText = title || (titleTx && translate(titleTx))

  // Filter out null/undefined children
  const validChildren = Children.toArray(children).filter((child) => child != null)
  const arrayLength = validChildren.length

  return (
    <View style={styles.mt16}>
      {!!titleText && (
        <Text
          preset="bold"
          color={colors.label}
          text={titleText.toUpperCase()}
          style={styles.mv2}
        />
      )}
      <View style={themed([$menuContainer, style])} {...viewProps}>
        {validChildren.map((child, index) => {
          return (
            <View key={index}>
              {child}
              {index !== arrayLength - 1 && <View style={themed($divider)} />}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
  marginHorizontal: 16,
})

const $menuContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: colors.background,
})

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    padding: 16,
  },
  itemImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  ml12: {
    marginLeft: 12,
  },
  mt16: {
    marginTop: 16,
  },
  mv2: {
    marginBottom: 4,
    marginVertical: 2,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 12,
  },
})
