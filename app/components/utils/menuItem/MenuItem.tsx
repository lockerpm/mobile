import React from "react"
import { TouchableOpacity, View, ViewProps, Image } from "react-native"
import { Icon, IconTypes, Text } from "app/components/cores"
import { useTheme } from "app/services/context"

export type MenuItemProps = {
  icon: IconTypes
  imageSource?: string
  name: string
  onPress?: () => void
  disabled?: boolean
  hide?: boolean
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
  content,
  rightIcon,
}: MenuItemProps) => {
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
        {!content ? <Text text={name} /> : content}
      </View>

      <Icon icon={rightIcon || "caret-right"} size={20} />
    </TouchableOpacity>
  )
}

interface ContainerProps extends ViewProps {
  title?: string
  children?: React.ReactNode | React.ReactNode[]
}

export const MenuItemContainer = ({ title, children, style, ...viewProps }: ContainerProps) => {
  const { colors } = useTheme()
  return (
    <View style={{ marginTop: 16 }}>
      {!!title && <Text preset="label" text={title.toUpperCase()} style={{ marginVertical: 2 }} />}
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
                borderBottomWidth: 1,
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
