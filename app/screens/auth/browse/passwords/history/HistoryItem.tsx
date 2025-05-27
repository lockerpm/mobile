import React, { useState } from "react"
import { View, TextInput } from "react-native"
import { Text, Icon } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { typography } from "app/theme"
import moment from "moment"

interface Props {
  password: string
  createAt: Date
  setSelectHistory: () => void
}

export const HistoryItem = ({ password, createAt, setSelectHistory }: Props) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  const [showText, setShowText] = useState(false)
  const updateTime = createAt.getTime()
    ? translate("password_history.updated_password") +
      moment(createAt).format("HH:mm, MMMM Do YYYY")
    : ""

  return (
    <View
      style={{
        marginVertical: 6,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
      }}
    >
      <View
        style={{
          flexShrink: 1,
          flexGrow: 1,
          marginRight: 12,
        }}
      >
        <TextInput
          editable={false}
          value={password}
          secureTextEntry={!showText}
          style={{
            color: colors.primaryText,
            fontFamily: typography.primary.regular,
            fontSize: 16,
            lineHeight: 20,
            flexGrow: 1,
            padding: 2,
          }}
        />
        {!!updateTime && <Text preset="label" text={updateTime} size="small" />}
      </View>
      <Icon
        icon={showText ? "eye-slash" : "eye"}
        size={20}
        onPress={() => {
          setShowText(!showText)
        }}
      />
      <Icon
        icon="dots-three-vertical"
        size={20}
        onPress={setSelectHistory}
        containerStyle={{
          padding: 6,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 4,
          marginLeft: 12,
        }}
      />
    </View>
  )
}
