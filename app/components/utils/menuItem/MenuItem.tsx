import React from "react"
import { TouchableOpacity, View, ViewProps, Image } from "react-native"
import { Icon, IconTypes, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { TxKeyPath } from "app/i18n"

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
  const { colors } = useTheme()

  if (hide) return null

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {!imageSource ? (
        <Icon icon={icon} containerStyle={{ marginRight: 10 }} />
      ) : (
        <Image
          resizeMode="contain"
          source={{ uri: imageSource }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
        />
      )}

      <View style={{ flex: 1, flexDirection: "row" }}>
        {!content ? (
          <>
            <Text text={name} />
            {family && <Text text={"FAMILY"} color={colors.primary} style={{ marginLeft: 12 }} />}
          </>
        ) : (
          content
        )}
      </View>

      <Icon icon={rightIcon || "caret-right"} size={20} color={colors.secondaryText} />
    </TouchableOpacity>
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
  const { colors } = useTheme()
  const { translate } = useAppLocale()
  const titleText = title || translate(titleTx)
  const arrayLength = Array.isArray(children) ? children.length : 1
  return (
    <View style={{ marginTop: 16 }}>
      {!!titleText && (
        <Text
          preset="bold"
          color={colors.secondaryText}
          text={titleText.toUpperCase()}
          style={{ marginVertical: 2 }}
        />
      )}
      <View
        style={[
          { borderRadius: 12, overflow: "hidden", backgroundColor: colors.background },
          style,
        ]}
        {...viewProps}
      >
        {React.Children.map(children, (child, index) => {
          return (
            <View
              key={index}
              style={{
                borderBottomColor: colors.border,
                borderBottomWidth: index !== arrayLength - 1 ? 1 : 0,
              }}
            >
              {child}
            </View>
          )
        })}
      </View>
    </View>
  )
}
